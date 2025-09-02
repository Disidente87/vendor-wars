import { NextRequest, NextResponse } from 'next/server'
import { VotingService } from '@/services/voting'
import { UserService } from '@/services/users'
import { tokenManager } from '@/lib/redis'

const _tokenManager = tokenManager

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userFid, vendorId, voteType, photoUrl, gpsLocation, verificationConfidence, farcasterUser } = body

    // Validate required fields
    if (!userFid || !vendorId || !voteType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userFid, vendorId, voteType' },
        { status: 400 }
      )
    }

    // Create or update user in database for leaderboards
    if (farcasterUser) {
      try {
        console.log('🔍 Upserting user for vote:', userFid, farcasterUser.username)
        const upsertedUser = await UserService.upsertUserFromFarcaster(userFid, farcasterUser)
        console.log('✅ User upserted successfully:', upsertedUser.username, upsertedUser.pfpUrl)
      } catch (error) {
        console.warn('Failed to upsert user, continuing with vote:', error)
      }
    }

    // Validate vote type
    if (!['regular', 'verified'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type. Must be "regular" or "verified"' },
        { status: 400 }
      )
    }

    // Validate verified vote requirements
    if (voteType === 'verified' && !photoUrl) {
      return NextResponse.json(
        { success: false, error: 'Photo URL is required for verified votes' },
        { status: 400 }
      )
    }

    console.log('🗳️ Processing vote:', { userFid, vendorId, voteType })

    // Register the vote using the corrected VotingService
    const result = await VotingService.registerVote({
      userFid,
      vendorId,
      voteType,
      photoUrl,
      gpsLocation,
      verificationConfidence
    })

    if (!result.success) {
      console.error('❌ Vote registration failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    console.log('✅ Vote registered successfully:', result)

    // Dispatch custom event for profile refresh (if in browser environment)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vote-success', {
        detail: {
          voteId: result.voteId,
          tokensEarned: result.tokensEarned,
          vendorId: vendorId
        }
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        voteId: result.voteId,
        tokensEarned: result.tokensEarned,
        newBalance: result.newBalance,
        streakBonus: result.streakBonus,
        territoryBonus: result.territoryBonus
      },
      message: 'Vote registered successfully!'
    })

  } catch (error) {
    console.error('❌ Error in vote registration:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userFid = searchParams.get('userFid')
    const vendorId = searchParams.get('vendorId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (userFid) {
      // Get user's vote history using the corrected VotingService
      console.log('📜 Fetching vote history for user:', userFid)
      const voteHistory = await VotingService.getUserVoteHistory(userFid, limit)
      
      console.log('✅ Vote history fetched:', voteHistory.length, 'votes')
      
      return NextResponse.json({
        success: true,
        data: voteHistory
      })
    }

    if (vendorId) {
      // Get vendor's vote statistics using the corrected VotingService
      console.log('📊 Fetching vendor stats for:', vendorId)
      const vendorStats = await VotingService.getVendorVoteStats(vendorId)
      
      console.log('✅ Vendor stats fetched:', vendorStats)
      
      return NextResponse.json({
        success: true,
        data: vendorStats
      })
    }

    return NextResponse.json(
      { success: false, error: 'Must provide userFid or vendorId parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Error fetching votes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 