import { NextRequest, NextResponse } from 'next/server'
import { streakManager } from '@/lib/redis'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userFid = searchParams.get('userFid')

    if (!userFid) {
      return NextResponse.json(
        { success: false, error: 'userFid parameter is required' },
        { status: 400 }
      )
    }

    // Try to get from cache first
    let streak = await streakManager.getVoteStreak(userFid)

    // If not in cache, fetch from database
    if (streak === 0) {
      const { data: user, error } = await supabase
        .from('users')
        .select('vote_streak')
        .eq('fid', userFid)
        .single()

      if (error) {
        console.error('Error fetching user streak:', error)
        streak = 0
      } else {
        streak = user?.vote_streak || 0
        // Cache the result
        await streakManager.incrementStreak(userFid)
        // Reset to actual value
        if (streak === 0) {
          await streakManager.resetStreak(userFid)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userFid,
        streak
      }
    })

  } catch (error) {
    console.error('Error fetching vote streak:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 