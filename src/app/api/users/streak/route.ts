import { NextRequest, NextResponse } from 'next/server'
import { StreakService } from '@/services/streak'

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

    // Obtener el streak directamente de la base de datos (fuente de verdad)
    const streak = await StreakService.getUserStreak(userFid)

    return NextResponse.json({
      success: true,
      data: {
        userFid,
        streak,
        source: 'database',
        timestamp: new Date().toISOString()
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