// /api/vendors/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface VendorRegistrationData {
  name: string
  description: string
  delegation: string
  category: string
  imageUrl: string
  ownerFid: number
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API route called')
    const body: VendorRegistrationData = await request.json()
    console.log('📝 Request body:', body)
    
    // Validate required fields
    const { name, description, delegation, category, imageUrl, ownerFid } = body
    
    // Check each required field individually for better error messages
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!description) missingFields.push('description')
    if (!delegation) missingFields.push('delegation')
    if (!category) missingFields.push('category')
    if (!ownerFid) missingFields.push('ownerFid')
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields)
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not available - missing SERVICE_ROLE_KEY')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get zone by delegation using the function we created in the database
    console.log('🔍 Looking up zone for delegation:', delegation)
    
    const { data: zoneResult, error: zoneError } = await supabase
      .rpc('get_zone_by_delegation', { input_delegation_name: delegation })

    if (zoneError) {
      console.error('❌ Error calling get_zone_by_delegation:', zoneError)
      return NextResponse.json(
        { success: false, error: `Database error: ${zoneError.message}` },
        { status: 500 }
      )
    }

    if (!zoneResult) {
      console.error('❌ No zone found for delegation:', delegation)
      
      // Let's check what delegations are available
      const { data: availableDelegations, error: delegationsError } = await supabase
        .from('zone_delegations')
        .select('delegation_name, zones(name)')
        .order('delegation_name')
      
      if (delegationsError) {
        console.error('❌ Error fetching available delegations:', delegationsError)
        return NextResponse.json(
          { success: false, error: 'Invalid delegation selected. Please contact support.' },
          { status: 400 }
        )
      }
      
      const availableDelegationNames = availableDelegations?.map(d => d.delegation_name) || []
      console.log('📋 Available delegations:', availableDelegationNames)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid delegation selected: "${delegation}". Available delegations: ${availableDelegationNames.join(', ')}` 
        },
        { status: 400 }
      )
    }

    console.log('✅ Zone found for delegation:', { delegation, zoneId: zoneResult })

    const zoneId = zoneResult

    // Obtener el fid del usuario autenticado desde el header o cookie
    const ownerFidHeader = request.headers.get('x-farcaster-fid')
    const ownerFidValue = ownerFidHeader ? parseInt(ownerFidHeader) : ownerFid

    if (!ownerFidValue || isNaN(ownerFidValue)) {
      return NextResponse.json(
        { success: false, error: 'No se pudo determinar el usuario. Por favor inicia sesión con Farcaster.' },
        { status: 400 }
      )
    }

    // Validar que el usuario existe (use regular client for read operations)
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
    
    // Create vendor record using admin client to bypass RLS
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        id: vendorId,
        name,
        description,
        zone_id: zoneId,
        delegation,
        category,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
        owner_fid: ownerFidValue,
        is_verified: false,
        // Note: other fields have defaults in DB schema
      })
      .select()
      .single()

    if (vendorError) {
      console.error('💥 Error creating vendor:', vendorError)
      return NextResponse.json(
        { success: false, error: `Failed to create vendor: ${vendorError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Vendor created successfully:', vendor)
    
    return NextResponse.json({
      success: true,
      data: vendor,
      message: `Vendor registered successfully in ${delegation} delegation`
    })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}