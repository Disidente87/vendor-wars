import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerBattleTokenService } from '@/services/serverBattleToken'
import { parseEther } from 'viem'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userFid, walletAddress } = body

    // Validate required fields
    if (!userFid || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userFid, walletAddress' },
        { status: 400 }
      )
    }

    console.log(`🔄 API: Synchronizing wallet for user ${userFid} with address ${walletAddress}`)

    // 1. Update user's wallet address in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_address: [walletAddress] })
      .eq('fid', parseInt(userFid))

    if (updateError) {
      console.error('❌ API: Error updating user wallet:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update wallet address' },
        { status: 500 }
      )
    }

    console.log(`✅ API: Wallet address updated for user ${userFid}`)

    // 2. Get all pending distributions for this user
    const { data: pendingVotes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_fid', parseInt(userFid))
      .eq('distribution_status', 'pending')
      .order('created_at', { ascending: true })

    if (votesError) {
      console.error('❌ API: Error fetching pending votes:', votesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending distributions' },
        { status: 500 }
      )
    }

    if (!pendingVotes || pendingVotes.length === 0) {
      console.log(`ℹ️ API: No pending distributions found for user ${userFid}`)
      return NextResponse.json({
        success: true,
        tokensDistributed: 0,
        message: 'Wallet synchronized successfully. No pending tokens to distribute.'
      })
    }

    console.log(`📦 API: Found ${pendingVotes.length} pending distributions`)

    let totalDistributed = 0
    let failedCount = 0
    const serverTokenService = getServerBattleTokenService()

    // 3. Process each pending distribution with retry logic
    for (const vote of pendingVotes) {
      let retryCount = 0
      const maxRetries = 2
      let success = false

      while (retryCount <= maxRetries && !success) {
        try {
          console.log(`🎁 API: Processing distribution for vote ${vote.id}: ${vote.token_reward} tokens (attempt ${retryCount + 1})`)

          // Update vote record to mark as pending distribution
          await supabase
            .from('votes')
            .update({ distribution_status: 'pending' })
            .eq('id', vote.id)

          // Check recipient balance before distribution
          const beforeBalance = await serverTokenService.getRecipientBalance(walletAddress)
          console.log(`💰 API: Recipient balance before: ${beforeBalance.formatted} BATTLE`)

          // Execute real blockchain distribution
          const distributionResult = await serverTokenService.distributeTokens(walletAddress, vote.token_reward)

          if (!distributionResult.success) {
            throw new Error(distributionResult.error || 'Token distribution failed')
          }

          const transactionHash = distributionResult.transactionHash!
          console.log(`✅ API: Distribution successful for vote ${vote.id}`)
          console.log(`📄 API: Transaction hash: ${transactionHash}`)

          // Verify the distribution by checking balance after
          const afterBalance = await serverTokenService.getRecipientBalance(walletAddress)
          console.log(`💰 API: Recipient balance after: ${afterBalance.formatted} BATTLE`)

          // Update vote record with success
          await supabase
            .from('votes')
            .update({
              distribution_status: 'distributed',
              distributed_at: new Date().toISOString(),
              transaction_hash: transactionHash
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

    console.log(`🎉 API: Processed ${pendingVotes.length} distributions: ${totalDistributed} tokens distributed, ${failedCount} failed`)

    const message = totalDistributed > 0 
      ? `Successfully distributed ${totalDistributed} BATTLE tokens to your wallet!`
      : 'Wallet synchronized successfully. No pending tokens to distribute.'

    return NextResponse.json({
      success: true,
      tokensDistributed: totalDistributed,
      message
    })

  } catch (error) {
    console.error('❌ API: Error in wallet sync:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
