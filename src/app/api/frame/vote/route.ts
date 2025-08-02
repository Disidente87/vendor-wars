import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const voteSchema = z.object({
  vendorName: z.string(),
  zoneName: z.string(),
  userFid: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = voteSchema.parse(body)

    // En una implementación real, aquí procesarías el voto
    // Por ahora, solo simulamos el proceso
    
    const response = {
      success: true,
      message: `Vote recorded for ${validatedData.vendorName} in ${validatedData.zoneName}`,
      data: {
        vendorName: validatedData.vendorName,
        zoneName: validatedData.zoneName,
        tokensEarned: 10,
        timestamp: new Date().toISOString(),
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

    console.error('Error processing vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Endpoint para obtener información del frame de voto
  const { searchParams } = new URL(request.url)
  const vendorName = searchParams.get('vendor')
  const zoneName = searchParams.get('zone')

  if (!vendorName || !zoneName) {
    return NextResponse.json(
      { success: false, error: 'Missing vendor or zone parameters' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      vendorName,
      zoneName,
      currentVotes: Math.floor(Math.random() * 100) + 50, // Simulado
      zoneLeader: vendorName,
      timeRemaining: '2h 15m',
    }
  })
} 