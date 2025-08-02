import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const battleResultSchema = z.object({
  winner: z.string(),
  loser: z.string(),
  zoneName: z.string(),
  totalVotes: z.number().optional(),
  duration: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = battleResultSchema.parse(body)

    // En una implementación real, aquí procesarías el resultado de la batalla
    // Por ahora, solo simulamos el proceso
    
    const response = {
      success: true,
      message: `Battle result recorded: ${validatedData.winner} defeated ${validatedData.loser} in ${validatedData.zoneName}`,
      data: {
        winner: validatedData.winner,
        loser: validatedData.loser,
        zoneName: validatedData.zoneName,
        totalVotes: validatedData.totalVotes || Math.floor(Math.random() * 500) + 100,
        duration: validatedData.duration || '24h',
        timestamp: new Date().toISOString(),
        territoryChange: true,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing battle result:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process battle result' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Endpoint para obtener información del frame de resultado de batalla
  const { searchParams } = new URL(request.url)
  const battleId = searchParams.get('battleId')

  if (!battleId) {
    return NextResponse.json(
      { success: false, error: 'Missing battle ID parameter' },
      { status: 400 }
    )
  }

  // Simulamos datos de una batalla
  const mockBattleData = {
    battleId,
    winner: 'Tacos El Güero',
    loser: 'Pupusas Doña María',
    zoneName: 'Zona Norte',
    totalVotes: 342,
    duration: '24h',
    winnerVotes: 198,
    loserVotes: 144,
    territoryChange: true,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    success: true,
    data: mockBattleData
  })
} 