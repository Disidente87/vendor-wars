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
    const { userFid, walletAddress } = body

    // Validate required fields
    if (!userFid || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userFid, walletAddress' },
        { status: 400 }
      )
    }

    console.log(`🔄 API: Syncing balance for user ${userFid} with address ${walletAddress}`)

    // Clean wallet address - handle legacy formats
    let cleanWalletAddress: string
    
    if (Array.isArray(walletAddress)) {
      // Legacy array format
      cleanWalletAddress = walletAddress[0]
    } else if (typeof walletAddress === 'string') {
      // Check if it's a JSON string (legacy) or direct string (new format)
      try {
        const parsed = JSON.parse(walletAddress)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Legacy JSON string format
          cleanWalletAddress = parsed[0]
        } else {
          // Direct string format (new)
          cleanWalletAddress = walletAddress
        }
      } catch {
        // Direct string format (new)
        cleanWalletAddress = walletAddress
      }
    } else {
      cleanWalletAddress = walletAddress
    }
    
    console.log(`🔧 API: Cleaned wallet address: ${cleanWalletAddress}`)

    // Get server token service
    const serverTokenService = getServerBattleTokenService()

    // Get real balance from blockchain
    console.log(`🔄 API: Fetching balance from blockchain...`)
    const blockchainBalance = await serverTokenService.getRecipientBalance(cleanWalletAddress)
    const realBalance = Math.floor(Number(blockchainBalance.formatted))
    
    console.log(`💰 API: Blockchain balance: ${blockchainBalance.formatted} BATTLE`)
    console.log(`💰 API: Rounded balance: ${realBalance} BATTLE`)

    // Update user's battle_tokens in database with real blockchain balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        battle_tokens: realBalance,
        updated_at: new Date().toISOString()
      })
      .eq('fid', parseInt(userFid))

    if (updateError) {
      console.error('❌ API: Error updating user balance:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update balance in database' },
        { status: 500 }
      )
    }

    console.log(`✅ API: Updated user balance to match blockchain: ${realBalance} BATTLE tokens`)

    return NextResponse.json({
      success: true,
      balance: realBalance,
      blockchainBalance: blockchainBalance.formatted,
      message: `Balance synchronized: ${realBalance} BATTLE tokens`
    })

  } catch (error) {
    console.error('❌ API: Error syncing balance:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
