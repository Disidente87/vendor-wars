import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface VendorRegistrationData {
  name: string
  description: string
  zoneId: string
  category: string
  imageUrl: string
  ownerFid: number
}

export async function POST(request: NextRequest) {
  try {
    const body: VendorRegistrationData = await request.json()
    
    // Validate required fields
    const { name, description, zoneId, category, imageUrl, ownerFid } = body
    
    if (!name || !description || !zoneId || !category || !ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that the zone exists
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

    // Obtener el fid del usuario autenticado desde el header o cookie
    const ownerFidHeader = request.headers.get('x-farcaster-fid')
    const ownerFidValue = ownerFidHeader ? parseInt(ownerFidHeader) : ownerFid

    if (!ownerFidValue || isNaN(ownerFidValue)) {
      return NextResponse.json(
        { success: false, error: 'No se pudo determinar el usuario. Por favor inicia sesión con Farcaster.' },
        { status: 400 }
      )
    }

    // Validar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('fid, display_name')
      .eq('fid', ownerFidValue)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado. Por favor asegúrate de estar logueado con Farcaster.' },
        { status: 400 }
      )
    }

    // Generate vendor ID
    const vendorId = uuidv4();
    
    // Create vendor record
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        id: vendorId,
        name,
        description,
        zone_id: zoneId,
        category,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
        owner_fid: ownerFidValue,
        is_verified: false,
        coordinates: [19.4326, -99.1332], // Default coordinates, can be updated later
        total_battles: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        total_revenue: 0,
        average_rating: 0,
        review_count: 0,
        territory_defenses: 0,
        territory_conquests: 0,
        current_zone_rank: 0,
        total_votes: 0,
        verified_votes: 0
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

    return NextResponse.json({
      success: true,
      data: vendor,
      message: 'Vendor registered successfully'
    })

  } catch (error) {
    console.error('Error registering vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register vendor' },
      { status: 500 }
    )
  }
}