import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from '@/services/vendors'
import { z } from 'zod'

const updateVendorSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().min(10).max(500).optional(),
  imageUrl: z.string().url().optional(),
  category: z.enum(['food', 'tech', 'fashion', 'health', 'entertainment', 'other']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await VendorService.getVendor(params.id)
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: vendor })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateVendorSchema.parse(body)
    const ownerFid = body.ownerFid

    if (!ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Owner FID is required' },
        { status: 400 }
      )
    }

    const vendor = await VendorService.getVendor(params.id)
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    if (vendor.owner.fid !== ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updatedVendor = await VendorService.updateVendor(params.id, validatedData)
    
    if (!updatedVendor) {
      return NextResponse.json(
        { success: false, error: 'Failed to update vendor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedVendor })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerFid = searchParams.get('ownerFid')

    if (!ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Owner FID is required' },
        { status: 400 }
      )
    }

    const success = await VendorService.deleteVendor(params.id, parseInt(ownerFid))
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
} 