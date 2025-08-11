// /api/vendors/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PAYMENT_CONFIG } from '@/config/payment'

interface VendorRegistrationData {
  name: string
  description: string
  delegation: string
  category: string
  imageUrl: string
  ownerFid: number
  userAddress: string
  paymentAmount: string
  vendorId: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API route called')
    const body: VendorRegistrationData = await request.json()
    console.log('📝 Request body:', body)
    
    // Validate required fields
    const { name, description, delegation, category, imageUrl, ownerFid, userAddress, paymentAmount, vendorId } = body
    
    // Check each required field individually for better error messages
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!description) missingFields.push('description')
    if (!delegation) missingFields.push('delegation')
    if (!category) missingFields.push('category')
    if (!ownerFid) missingFields.push('ownerFid')
    if (!userAddress) missingFields.push('userAddress')
    if (!paymentAmount) missingFields.push('paymentAmount')
    if (!vendorId) missingFields.push('vendorId')
    
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

    // Validate payment and blockchain verification
    if (!userAddress || !paymentAmount) {
      return NextResponse.json(
        { success: false, error: 'Payment verification required for vendor registration' },
        { status: 400 }
      )
    }

    // Verify payment on blockchain
    const paymentVerification = await verifyPaymentOnBlockchain(userAddress, vendorId)
    if (!paymentVerification.success) {
      return NextResponse.json(
        { success: false, error: `Payment verification failed: ${paymentVerification.error}` },
        { status: 400 }
      )
    }

    // Validate payment amount (should be 50 $BATTLE tokens)
    const expectedAmount = PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT.toString()
    if (paymentAmount !== expectedAmount) {
      return NextResponse.json(
        { success: false, error: `Invalid payment amount. Expected ${expectedAmount} $BATTLE tokens, got ${paymentAmount}` },
        { status: 400 }
      )
    }

    // Use provided vendorId instead of generating new one
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      )
    }
    
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
        owner_address: userAddress,
        payment_amount: paymentAmount,
        payment_status: 'completed',
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
      message: `Vendor registered successfully in ${delegation} delegation`,
      payment: {
        amount: paymentAmount,
        status: 'completed',
        userAddress: userAddress
      }
    })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Cliente público para Base Sepolia
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
})

// ABI simplificado para el contrato VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  'event VendorRegistered(address indexed user, string vendorData, string vendorId, uint256 timestamp)',
  'function getVendorRegistration(address user) external view returns (string vendorData, string vendorId, uint256 timestamp, bool isActive)',
  'function getUserVendorCount(address user) external view returns (uint256 dailyCount, uint256 weeklyCount, uint256 lastRegistrationTime)'
] as const

// Verificar pago en blockchain
async function verifyPaymentOnBlockchain(
  userAddress: string,
  vendorId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('🔍 Verificando pago en blockchain para:', { userAddress, vendorId })

    // Verificar que el vendor esté registrado en el contrato
    const result = await publicClient.readContract({
      address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'getVendorRegistration',
      args: [userAddress as `0x${string}`]
    })

    const [vendorData, contractVendorId, timestamp, isActive] = result as [string, string, bigint, boolean]

    if (!isActive) {
      return {
        success: false,
        error: 'Vendor no encontrado o inactivo en el contrato'
      }
    }

    if (contractVendorId !== vendorId) {
      return {
        success: false,
        error: 'vendorId no coincide con el registrado en blockchain'
      }
    }

    // Verificar rate limiting
    const userStats = await publicClient.readContract({
      address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'getUserVendorCount',
      args: [userAddress as `0x${string}`]
    })

    const [dailyCount, weeklyCount, lastRegistrationTime] = userStats as [bigint, bigint, bigint]
    const currentTime = Math.floor(Date.now() / 1000)

    // Verificar límite diario
    if (Number(dailyCount) >= PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_DAY) {
      return {
        success: false,
        error: `Límite diario alcanzado. Máximo ${PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_DAY} vendors por día`
      }
    }

    // Verificar límite semanal
    if (Number(weeklyCount) >= PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_WEEK) {
      return {
        success: false,
        error: `Límite semanal alcanzado. Máximo ${PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_WEEK} vendors por semana`
      }
    }

    // Verificar cooldown
    const timeSinceLastRegistration = currentTime - Number(lastRegistrationTime)
    if (timeSinceLastRegistration < PAYMENT_CONFIG.RATE_LIMITS.COOLDOWN_PERIOD / 1000) {
      const remainingTime = Math.ceil((PAYMENT_CONFIG.RATE_LIMITS.COOLDOWN_PERIOD / 1000 - timeSinceLastRegistration) / 60)
      return {
        success: false,
        error: `Debes esperar ${remainingTime} minutos antes de registrar otro vendor`
      }
    }

    console.log('✅ Pago verificado exitosamente en blockchain')
    return {
      success: true,
      data: {
        registrationTime: Number(timestamp),
        dailyCount: Number(dailyCount),
        weeklyCount: Number(weeklyCount),
        lastRegistrationTime: Number(lastRegistrationTime)
      }
    }

  } catch (error) {
    console.error('❌ Error verificando pago en blockchain:', error)
    return {
      success: false,
      error: 'Error al verificar pago en blockchain. Verifica que la transacción esté confirmada.'
    }
  }
}