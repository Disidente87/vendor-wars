import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface VendorUpdateData {
  name?: string
  description?: string
  zoneId?: string
  category?: string
  imageUrl?: string
  ownerFid: number // Required to verify ownership
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: VendorUpdateData = await request.json()
    
    const { name, description, zoneId, category, imageUrl, ownerFid } = body
    
    if (!ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Owner FID is required' },
        { status: 400 }
      )
    }

    // First, verify that the vendor exists and the user is the admin
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, owner_fid, name')
      .eq('id', id)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Check if the user is the admin of this vendor
    if (vendor.owner_fid !== ownerFid) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to edit this vendor. Only the creator can make changes.' },
        { status: 403 }
      )
    }

    // Validate zone if provided
    if (zoneId) {
      const { data: zone, error: zoneError } = await supabase
        .from('zones')
        .select('id')
        .eq('id', zoneId)
        .single()

      if (zoneError || !zone) {
        return NextResponse.json(
          { success: false, error: 'Invalid zone selected' },
          { status: 400 }
        )
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (zoneId !== undefined) updateData.zone_id = zoneId
    if (category !== undefined) updateData.category = category
    if (imageUrl !== undefined) updateData.image_url = imageUrl

    // Update vendor record
    const { data: updatedVendor, error: updateError } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating vendor:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update vendor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedVendor,
      message: 'Vendor updated successfully'
    })

  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const ownerFid = url.searchParams.get('ownerFid')

    if (!ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Admin FID is required' },
        { status: 400 }
      )
    }

    // Get vendor and verify ownership
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select(`
        id, name, description, category, image_url, zone_id, owner_fid,
        zones (id, name, description)
      `)
      .eq('id', id)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Check if the user is the admin of this vendor
    if (vendor.owner_fid !== parseInt(ownerFid)) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to edit this vendor' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vendor
    })

  } catch (error) {
    console.error('Error fetching vendor for edit:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}
