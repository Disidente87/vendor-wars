import { NextRequest, NextResponse } from 'next/server'
import { streakManager } from '@/lib/redis'
import { UserService } from '@/services/users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userFid } = body

    if (!userFid) {
      return NextResponse.json(
        { success: false, error: 'User FID is required' },
        { status: 400 }
      )
    }

    // Check and reset streak if needed
    await streakManager.checkAndResetStreakIfNeeded(userFid.toString())
    
    // Get current streak
    const currentStreak = await streakManager.getVoteStreak(userFid.toString())
    
    // Update user in database with current streak
    await UserService.updateUser(parseInt(userFid), { voteStreak: currentStreak })

    return NextResponse.json({
      success: true,
      data: {
        streak: currentStreak,
        message: 'Streak checked and updated'
      }
    })

  } catch (error) {
    console.error('Error checking streak:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check streak' },
      { status: 500 }
    )
  }
} 