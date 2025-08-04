import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface VendorVerificationData {
  vendorId: string
  businessLicense?: string
  locationPhoto?: string
  socialMedia?: string
  receipt?: string
  communityVouch?: string
  ownerFid: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VendorVerificationData = await request.json()
    
    const { 
      vendorId, 
      businessLicense, 
      locationPhoto, 
      socialMedia, 
      receipt, 
      communityVouch,
      ownerFid 
    } = body

    if (!vendorId || !ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID and owner FID are required' },
        { status: 400 }
      )
    }

    // Check if vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Validate that the requester is the owner
    if (vendor.owner_fid !== ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Only the vendor owner can request verification' },
        { status: 403 }
      )
    }

    // Count verification proofs
    const proofs = [businessLicense, locationPhoto, socialMedia, receipt, communityVouch]
      .filter(proof => proof && proof.trim() !== '')
    
    if (proofs.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 forms of verification proof are required' },
        { status: 400 }
      )
    }

    // Create verification record
    const verificationId = crypto.randomUUID()
    
    const { error: verificationError } = await supabase
      .from('vendor_verifications')
      .insert({
        id: verificationId,
        vendor_id: vendorId,
        owner_fid: ownerFid,
        business_license: businessLicense || null,
        location_photo: locationPhoto || null,
        social_media: socialMedia || null,
        receipt: receipt || null,
        community_vouch: communityVouch || null,
        status: 'pending', // pending, approved, rejected
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewer_notes: null
      })

    if (verificationError) {
      console.error('Error creating verification:', verificationError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit verification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        verificationId,
        status: 'pending',
        message: 'Verification submitted successfully. Review process takes up to 48 hours.'
      }
    })

  } catch (error) {
    console.error('Error in vendor verification:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Admin endpoint to approve/reject verifications
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { verificationId, status, reviewerNotes, adminFid } = body

    if (!verificationId || !status || !adminFid) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update verification status
    const { error: verificationError } = await supabase
      .from('vendor_verifications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewerNotes || null,
        reviewer_fid: adminFid
      })
      .eq('id', verificationId)

    if (verificationError) {
      console.error('Error updating verification:', verificationError)
      return NextResponse.json(
        { success: false, error: 'Failed to update verification' },
        { status: 500 }
      )
    }

    // If approved, update vendor verification status
    if (status === 'approved') {
      const { data: verification } = await supabase
        .from('vendor_verifications')
        .select('vendor_id')
        .eq('id', verificationId)
        .single()

      if (verification) {
        await supabase
          .from('vendors')
          .update({ is_verified: true })
          .eq('id', verification.vendor_id)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${status} successfully`
    })

  } catch (error) {
    console.error('Error updating verification:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 