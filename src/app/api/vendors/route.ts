import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from '@/services/vendors'
import { FarcasterService } from '@/services/farcaster'
import { VendorCategory } from '@/types'
import { z } from 'zod'

const createVendorSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  imageUrl: z.string().url(),
  category: z.nativeEnum(VendorCategory),
  ownerFid: z.number(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const ownerFid = searchParams.get('ownerFid')
    const search = searchParams.get('search')

    if (search) {
      const vendors = await VendorService.searchVendors(search)
      return NextResponse.json({ success: true, data: vendors })
    }

    if (ownerFid) {
      const vendors = await VendorService.getVendorsByOwner(parseInt(ownerFid))
      return NextResponse.json({ success: true, data: vendors })
    }

    if (category) {
      const vendors = await VendorService.getVendorsByCategory(category as any)
      return NextResponse.json({ success: true, data: vendors })
    }

    const result = await VendorService.getAllVendors({ page, limit })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createVendorSchema.parse(body)

    // Get user from Farcaster
    const user = await FarcasterService.getUserByFid(validatedData.ownerFid)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has reached vendor limit
    const userVendorCount = await VendorService.getVendorCountByOwner(validatedData.ownerFid)
    if (userVendorCount >= 5) {
      return NextResponse.json(
        { success: false, error: 'Maximum number of vendors reached' },
        { status: 400 }
      )
    }

    const vendor = await VendorService.createVendor({
      name: validatedData.name,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl,
      category: validatedData.category,
      owner: user,
    })

    return NextResponse.json({ success: true, data: vendor })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
} 