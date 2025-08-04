import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface VendorRegistrationData {
  name: string
  description: string
  zone: string
  category: string
  logo: string
  ownerFid?: string
  ownerName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VendorRegistrationData = await request.json()
    
    // Validate required fields
    const { name, description, zone, category, logo, ownerFid, ownerName } = body
    
    if (!name || !description || !zone || !category || !logo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate vendor ID
    const vendorId = uuidv4()
    
    // Create vendor record
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        id: vendorId,
        name,
        description,
        zone,
        category,
        logo,
        owner_fid: ownerFid || null,
        owner_name: ownerName || null,
        is_verified: false, // Start as unverified
        created_at: new Date().toISOString(),
        stats: {
          totalVotes: 0,
          verifiedVotes: 0,
          winRate: 0,
          totalBattles: 0
        }
      })
      .select()
      .single()

    if (vendorError) {
      console.error('Error creating vendor:', vendorError)
      return NextResponse.json(
        { success: false, error: 'Failed to create vendor' },
        { status: 500 }
      )
    }

    // If owner is provided, create user record if it doesn't exist
    if (ownerFid && ownerName) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('fid', ownerFid)
        .single()

      if (!existingUser) {
        await supabase
          .from('users')
          .insert({
            id: uuidv4(),
            fid: ownerFid,
            name: ownerName,
            battle_tokens: 0,
            credibility_score: 0,
            verified_purchases: 0,
            credibility_tier: 'bronze'
          })
      }
    }

    return NextResponse.json({
      success: true,
      data: vendor,
      message: 'Vendor registered successfully. Verification required for full access.'
    })

  } catch (error) {
    console.error('Error in vendor registration:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 