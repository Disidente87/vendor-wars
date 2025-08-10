import { NextRequest, NextResponse } from 'next/server'
import { StreakService } from '@/services/streak'
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

    // Obtener el streak actualizado de la base de datos
    const currentStreak = await StreakService.getUserStreak(userFid)
    
    // Actualizar el usuario en la base de datos con el streak calculado
    await UserService.updateUser(parseInt(userFid), { voteStreak: currentStreak })

    return NextResponse.json({
      success: true,
      data: {
        streak: currentStreak,
        source: 'database',
        message: 'Streak calculated and updated from database',
        timestamp: new Date().toISOString()
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