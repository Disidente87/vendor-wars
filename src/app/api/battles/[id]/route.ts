import { NextRequest, NextResponse } from 'next/server'
import { BattleService } from '@/services/battles'
import { z } from 'zod'
import type { User } from '@/types'

const voteSchema = z.object({
  voterFid: z.number(),
  votedForId: z.string(),
  reason: z.string().optional(),
})

export async function GET(
  request: NextRequest
) {
  const id = request.nextUrl.pathname.split('/').pop()
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Battle ID is required' },
      { status: 400 }
    )
  }
  try {
    const battle = await BattleService.getBattle(id)
    
    if (!battle) {
      return NextResponse.json(
        { success: false, error: 'Battle not found' },
        { status: 404 }
      )
    }

    const stats = await BattleService.getBattleStats(id)
    const votes = await BattleService.getVotesForBattle(id)

    return NextResponse.json({ 
      success: true, 
      data: { 
        battle, 
        stats, 
        votes 
      } 
    })
  } catch (error) {
    console.error('Error fetching battle:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch battle' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest
) {
  const id = request.nextUrl.pathname.split('/').pop()
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Battle ID is required' },
      { status: 400 }
    )
  }
  try {
    const body = await request.json()
    const action = body.action

    if (action === 'vote') {
      const voteData = voteSchema.parse(body)
      
      // Get voter from Farcaster (this would need to be implemented)
      const voter: User = {
        fid: voteData.voterFid,
        username: 'user',
        displayName: 'User',
        pfpUrl: '',
        followerCount: 0,
        followingCount: 0,
        bio: '',
        verifiedAddresses: [],
        battleTokens: 100,
        credibilityScore: 50,
        verifiedPurchases: 0,
        credibilityTier: 'bronze',
        voteStreak: 0,
        weeklyVoteCount: 0,
        weeklyTerritoryBonus: 0,
      }

      const battle = await BattleService.getBattle(id)
      if (!battle) {
        return NextResponse.json(
          { success: false, error: 'Battle not found' },
          { status: 404 }
        )
      }

      const votedFor = battle.challenger.id === voteData.votedForId 
        ? battle.challenger 
        : battle.opponent.id === voteData.votedForId 
        ? battle.opponent 
        : null

      if (!votedFor) {
        return NextResponse.json(
          { success: false, error: 'Invalid vendor to vote for' },
          { status: 400 }
        )
      }

      const vote = await BattleService.vote({
        battleId: id,
        voter,
        votedFor,
        reason: voteData.reason,
      })

      if (!vote) {
        return NextResponse.json(
          { success: false, error: 'Failed to vote. You may have already voted or be in cooldown.' },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true, data: vote })
    }

    if (action === 'complete') {
      const completedBattle = await BattleService.completeBattle(id)
      
      if (!completedBattle) {
        return NextResponse.json(
          { success: false, error: 'Failed to complete battle' },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true, data: completedBattle })
    }

    if (action === 'cancel') {
      const requesterFid = body.requesterFid
      
      if (!requesterFid) {
        return NextResponse.json(
          { success: false, error: 'Requester FID is required' },
          { status: 400 }
        )
      }

      const cancelledBattle = await BattleService.cancelBattle(id, requesterFid)
      
      if (!cancelledBattle) {
        return NextResponse.json(
          { success: false, error: 'Failed to cancel battle' },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true, data: cancelledBattle })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing battle action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process battle action' },
      { status: 500 }
    )
  }
} 