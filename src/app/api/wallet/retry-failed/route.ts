import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerBattleTokenService } from '@/services/serverBattleToken'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userFid } = body

    // Validate required fields
    if (!userFid) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: userFid' },
        { status: 400 }
      )
    }

    console.log(`🔄 API: Retrying failed distributions for user ${userFid}`)

    // 1. Get user's wallet address
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('fid', parseInt(userFid))
      .single()

    if (userError || !user) {
      console.error('❌ API: Error fetching user:', userError)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const walletAddresses = user.wallet_address || []
    const cleanWalletAddress = Array.isArray(walletAddresses) && walletAddresses.length > 0 
      ? walletAddresses[0] 
      : null

    if (!cleanWalletAddress) {
      return NextResponse.json(
        { success: false, error: 'No wallet address found for user' },
        { status: 400 }
      )
    }

    console.log(`🔧 API: Using wallet address: ${cleanWalletAddress}`)

    // 2. Get all failed distributions for this user
    const { data: failedVotes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_fid', parseInt(userFid))
      .eq('distribution_status', 'failed')
      .order('created_at', { ascending: true })

    if (votesError) {
      console.error('❌ API: Error fetching failed votes:', votesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch failed distributions' },
        { status: 500 }
      )
    }

    if (!failedVotes || failedVotes.length === 0) {
      console.log(`ℹ️ API: No failed distributions found for user ${userFid}`)
      return NextResponse.json({
        success: true,
        tokensDistributed: 0,
        message: 'No failed distributions to retry.'
      })
    }

    console.log(`📦 API: Found ${failedVotes.length} failed distributions to retry`)

    let totalDistributed = 0
    let failedCount = 0
    const serverTokenService = getServerBattleTokenService()

    // 3. Retry each failed distribution
    for (const vote of failedVotes) {
      let retryCount = 0
      const maxRetries = 2
      let success = false

      while (retryCount <= maxRetries && !success) {
        try {
          console.log(`🔄 API: Retrying distribution for vote ${vote.id}: ${vote.token_reward} tokens (attempt ${retryCount + 1})`)

          // Update vote record to mark as pending distribution
          await supabase
            .from('votes')
            .update({ distribution_status: 'pending' })
            .eq('id', vote.id)

          // Check recipient balance before distribution
          const beforeBalance = await serverTokenService.getRecipientBalance(cleanWalletAddress)
          console.log(`💰 API: Recipient balance before: ${beforeBalance.formatted} BATTLE`)

          // Execute real blockchain distribution
          const distributionResult = await serverTokenService.distributeTokens(cleanWalletAddress, vote.token_reward)

          if (!distributionResult.success) {
            throw new Error(distributionResult.error || 'Token distribution failed')
          }

          const transactionHash = distributionResult.transactionHash!
          console.log(`✅ API: Distribution successful for vote ${vote.id}`)
          console.log(`📄 API: Transaction hash: ${transactionHash}`)

          // Verify the distribution by checking balance after
          const afterBalance = await serverTokenService.getRecipientBalance(cleanWalletAddress)
          console.log(`💰 API: Recipient balance after: ${afterBalance.formatted} BATTLE`)

          // Update vote record with success
          await supabase
            .from('votes')
            .update({
              distribution_status: 'distributed',
              distributed_at: new Date().toISOString(),
              transaction_hash: transactionHash,
              distribution_error: null // Clear the error
            })
            .eq('id', vote.id)

          totalDistributed += vote.token_reward
          success = true
          console.log(`✅ API: Successfully distributed ${vote.token_reward} tokens for vote ${vote.id}`)

        } catch (error) {
          retryCount++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          console.error(`❌ API: Failed to distribute tokens for vote ${vote.id} (attempt ${retryCount}):`, errorMessage)

          if (retryCount > maxRetries) {
            failedCount++
            console.error(`❌ API: Max retries exceeded for vote ${vote.id}, marking as failed`)

            // Update vote record with error
            await supabase
              .from('votes')
              .update({
                distribution_status: 'failed',
                distribution_error: errorMessage
              })
              .eq('id', vote.id)
          } else {
            // Wait before retry (exponential backoff)
            const waitTime = Math.pow(2, retryCount) * 1000 // 2s, 4s, 8s
            console.log(`⏳ API: Waiting ${waitTime}ms before retry...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
      }
    }

    console.log(`🎉 API: Retried ${failedVotes.length} distributions: ${totalDistributed} tokens distributed, ${failedCount} still failed`)

    // 4. Update user's battle_tokens in database to reflect distributed tokens
    if (totalDistributed > 0) {
      try {
        // Get current balance from database
        const { data: currentUser, error: userError } = await supabase
          .from('users')
          .select('battle_tokens')
          .eq('fid', parseInt(userFid))
          .single()

        if (userError) {
          console.error('❌ API: Error fetching current user balance:', userError)
        } else {
          const currentBalance = currentUser?.battle_tokens || 0
          const newBalance = currentBalance + totalDistributed

          // Update user's battle_tokens in database
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              battle_tokens: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('fid', parseInt(userFid))

          if (updateError) {
            console.error('❌ API: Error updating user balance:', updateError)
          } else {
            console.log(`✅ API: Updated user balance: ${currentBalance} → ${newBalance} BATTLE tokens`)
          }
        }
      } catch (error) {
        console.error('❌ API: Error updating user balance:', error)
      }
    }

    const message = totalDistributed > 0 
      ? `Successfully retried and distributed ${totalDistributed} BATTLE tokens!`
      : 'No failed distributions could be retried successfully.'

    return NextResponse.json({
      success: true,
      tokensDistributed: totalDistributed,
      message
    })

  } catch (error) {
    console.error('❌ API: Error in retry failed distributions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
