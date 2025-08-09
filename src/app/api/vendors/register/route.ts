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
    console.log('📥 Received vendor registration data:', body)
    
    // Validate required fields
    const { name, description, zoneId, category, imageUrl, ownerFid } = body
    
    // Check each required field individually for better error messages
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!description) missingFields.push('description')
    if (!zoneId) missingFields.push('zoneId')
    if (!category) missingFields.push('category')
    if (!ownerFid) missingFields.push('ownerFid')
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields)
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
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
        coordinates: `(${19.4326}, ${-99.1332})` // PostgreSQL POINT format
        // Note: other fields have defaults in DB schema
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