import { NextRequest, NextResponse } from 'next/server'
import { BattleService } from '@/services/battles'
import { VendorService } from '@/services/vendors'
import { z } from 'zod'

const createBattleSchema = z.object({
  challengerId: z.string(),
  opponentId: z.string(),
  category: z.enum(['food', 'tech', 'fashion', 'health', 'entertainment', 'other']),
  description: z.string().min(10).max(500),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const vendorId = searchParams.get('vendorId')

    if (vendorId) {
      const battles = await BattleService.getBattlesByVendor(vendorId)
      return NextResponse.json({ success: true, data: battles })
    }

    if (category) {
      const battles = await BattleService.getBattlesByCategory(category)
      return NextResponse.json({ success: true, data: battles })
    }

    if (status === 'active') {
      const battles = await BattleService.getActiveBattles()
      return NextResponse.json({ success: true, data: battles })
    }

    if (status === 'completed') {
      const battles = await BattleService.getCompletedBattles()
      return NextResponse.json({ success: true, data: battles })
    }

    const result = await BattleService.getAllBattles({ page, limit })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching battles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch battles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBattleSchema.parse(body)

    // Get both vendors
    const challenger = await VendorService.getVendor(validatedData.challengerId)
    const opponent = await VendorService.getVendor(validatedData.opponentId)

    if (!challenger || !opponent) {
      return NextResponse.json(
        { success: false, error: 'One or both vendors not found' },
        { status: 404 }
      )
    }

    if (challenger.id === opponent.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot battle against yourself' },
        { status: 400 }
      )
    }

    if (challenger.category !== opponent.category) {
      return NextResponse.json(
        { success: false, error: 'Vendors must be in the same category' },
        { status: 400 }
      )
    }

    const battle = await BattleService.createBattle({
      challenger,
      opponent,
      category: validatedData.category,
      description: validatedData.description,
    })

    return NextResponse.json({ success: true, data: battle })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating battle:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create battle' },
      { status: 500 }
    )
  }
} 