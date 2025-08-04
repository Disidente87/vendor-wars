import { NextRequest, NextResponse } from 'next/server'
import { VotingService } from '@/services/voting'
import { tokenManager } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userFid, vendorId, voteType, photoUrl, gpsLocation, verificationConfidence } = body

    // Validate required fields
    if (!userFid || !vendorId || !voteType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userFid, vendorId, voteType' },
        { status: 400 }
      )
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

    // Register the vote
    const result = await VotingService.registerVote({
      userFid,
      vendorId,
      voteType,
      photoUrl,
      gpsLocation,
      verificationConfidence
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
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
    console.error('Error in vote registration:', error)
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
      // Get user's vote history
      const voteHistory = await VotingService.getUserVoteHistory(userFid, limit)
      return NextResponse.json({
        success: true,
        data: voteHistory
      })
    }

    if (vendorId) {
      // Get vendor's vote statistics
      const vendorStats = await VotingService.getVendorVoteStats(vendorId)
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
    console.error('Error fetching votes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 