// /api/vendors/register-with-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, encodeFunctionData } from 'viem'
import { readContract as readContractAction } from 'viem/actions'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount, signTransaction } from 'viem/accounts'
import { sendRawTransaction, waitForTransactionReceipt } from 'viem/actions'
import { getTransactionCount } from 'viem/actions'
import { PAYMENT_CONFIG } from '@/config/payment'
import { createClient } from '@supabase/supabase-js'
import { simulateContract } from 'viem/actions'

// ABI para el contrato VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'vendorData', type: 'string' },
      { name: 'vendorId', type: 'string' }
    ],
    name: 'registerVendor',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

// ABI para el token BATTLE
const BATTLE_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

interface VendorRegistrationRequest {
  userAddress: string
  vendorData: string
  vendorId: string
  paymentAmount: string
  signature: string // Firma del usuario para verificar que autoriza el pago
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Iniciando registro de vendor con pago...')
    
    const body: VendorRegistrationRequest = await request.json()
    const { userAddress, vendorData, vendorId, paymentAmount, signature } = body
    
    console.log('🔍 API: Body recibido:', { 
      userAddress, 
      vendorId, 
      paymentAmount, 
      signature: signature ? 'SÍ' : 'NO',
      vendorDataLength: vendorData?.length || 0
    })
    
    // Validar campos requeridos
    if (!userAddress || !vendorData || !vendorId || !paymentAmount || !signature) {
      const missingFields = []
      if (!userAddress) missingFields.push('userAddress')
      if (!vendorData) missingFields.push('vendorData')
      if (!vendorId) missingFields.push('vendorId')
      if (!paymentAmount) missingFields.push('paymentAmount')
      if (!signature) missingFields.push('signature')
      
      console.error('❌ API: Campos faltantes:', missingFields)
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validar que la dirección sea válida
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('❌ API: Dirección inválida:', userAddress)
      return NextResponse.json(
        { success: false, error: 'Invalid user address' },
        { status: 400 }
      )
    }
    
    // Nota: No verificamos unicidad del vendorId en la BD porque:
    // 1. El vendorId del frontend no es un UUID (es un string personalizado)
    // 2. La tabla vendors usa UUIDs como primary key
    // 3. El vendorId del frontend se usa solo para el contrato, no para la BD
    console.log('🔍 API: VendorId del frontend (para contrato):', vendorId)
    
    // Validar variables de entorno
    const privateKey = process.env.SERVER_PRIVATE_KEY
    const walletAddress = process.env.SERVER_WALLET_ADDRESS
    
    if (!privateKey) {
      console.error('❌ API: SERVER_PRIVATE_KEY no configurada')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: SERVER_PRIVATE_KEY not set' },
        { status: 500 }
      )
    }
    
    if (!walletAddress) {
      console.error('❌ API: SERVER_WALLET_ADDRESS no configurada')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: SERVER_WALLET_ADDRESS not set' },
        { status: 500 }
      )
    }
    
    console.log('✅ API: Variables de entorno validadas')
    
    // Crear cliente Viem
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
    })
    
    // Preparar datos de la transacción
    const amountInWei = BigInt(paymentAmount) * BigInt(10 ** 18) // Convertir a wei
    
    // Verificar que el usuario tiene saldo suficiente
    console.log('🔍 API: Verificando saldo del usuario...')
    try {
      const balanceData = await readContractAction(publicClient, {
        address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      })
      
      console.log('🔍 API: Saldo BATTLE del usuario:', balanceData.toString())
      
      if (balanceData < amountInWei) {
        return NextResponse.json(
          { success: false, error: 'Insufficient BATTLE tokens' },
          { status: 400 }
        )
      }
      
      console.log('✅ API: Saldo BATTLE suficiente')
    } catch (balanceError) {
      console.error('❌ API: Error verificando saldo:', balanceError)
      return NextResponse.json(
        { success: false, error: 'Error checking BATTLE balance' },
        { status: 500 }
      )
    }
    
    // Verificar que el contrato existe y no está pausado
    console.log('🔍 API: Verificando estado del contrato...')
    try {
      const bytecode = await publicClient.getBytecode({ 
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}` 
      })
      
      if (!bytecode || bytecode === '0x') {
        console.error('❌ API: Contrato VendorRegistration no encontrado')
        return NextResponse.json(
          { success: false, error: 'Smart contract not found' },
          { status: 500 }
        )
      }
      
      console.log('✅ API: Contrato encontrado')
    
    // Simular la transacción para capturar posibles errores
    console.log('🔍 API: Simulando transacción...')
    try {
      await simulateContract(publicClient, {
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'registerVendor',
        args: [userAddress as `0x${string}`, amountInWei, vendorData, vendorId],
        account: walletAddress as `0x${string}`
      })
      console.log('✅ API: Simulación exitosa')
    } catch (simulationError: any) {
      console.error('❌ API: Error en simulación:', simulationError)
      let errorMessage = 'Transaction would fail'
      
      // Extraer mensaje de error específico
      if (simulationError?.message) {
        if (simulationError.message.includes('Insufficient balance')) {
          errorMessage = 'Saldo insuficiente de tokens BATTLE'
        } else if (simulationError.message.includes('allowance')) {
          errorMessage = 'Necesitas aprobar que el contrato gaste tus tokens BATTLE primero'
        } else if (simulationError.message.includes('Cannot burn tokens from user')) {
          errorMessage = 'No se pueden quemar tokens del usuario. Necesitas aprobar que el contrato gaste tus tokens BATTLE primero'
        } else if (simulationError.message.includes('Vendor already exists')) {
          errorMessage = 'Este vendor ya existe en la blockchain. El ID del vendor debe ser único. Por favor, intenta de nuevo.'
        } else if (simulationError.message.includes('Daily limit exceeded')) {
          errorMessage = 'Has alcanzado el límite diario de registros'
        } else if (simulationError.message.includes('Cooldown period not met')) {
          errorMessage = 'Debes esperar antes de registrar otro vendor'
        } else {
          errorMessage = simulationError.message
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: simulationError?.message || 'Unknown simulation error'
        },
        { status: 400 }
      )
    }
  } catch (contractError) {
    console.error('❌ API: Error verificando contrato:', contractError)
    return NextResponse.json(
      { success: false, error: 'Smart contract not found' },
      { status: 500 }
    )
  }
    
    // Preparar la transacción
    console.log('🔍 API: Preparando transacción...')
    
    const transactionData = encodeFunctionData({
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'registerVendor',
      args: [userAddress as `0x${string}`, amountInWei, vendorData, vendorId]
    })
    
    console.log('🔍 API: Transaction data length:', transactionData.length)
    
    const transaction = {
      to: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
      data: transactionData,
      gas: 1000000n,
      maxFeePerGas: 500000000n, // 0.5 Gwei
      maxPriorityFeePerGas: 100000000n // 0.1 Gwei
    }
    
    // Obtener nonce de la cuenta
    const nonce = await getTransactionCount(publicClient, { address: walletAddress as `0x${string}` })
    console.log('🔍 API: Nonce de la cuenta:', nonce)
    
    // Firmar la transacción
    console.log('🔍 API: Firmando transacción...')
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    
    const signedTransaction = await signTransaction({
      transaction: {
        ...transaction,
        nonce,
        chainId: baseSepolia.id
      },
      privateKey: privateKey as `0x${string}`
    })
    
    console.log('✅ API: Transacción firmada')
    
    // Enviar transacción
    console.log('🔍 API: Enviando transacción...')
    const hash = await sendRawTransaction(publicClient, { serializedTransaction: signedTransaction })
    console.log('✅ API: Transacción enviada, hash:', hash)
    
    // Esperar confirmación
    console.log('⏳ API: Esperando confirmación...')
    const receipt = await waitForTransactionReceipt(publicClient, { hash })
    console.log('✅ API: Transacción confirmada en bloque:', receipt.blockNumber)
    
    if (receipt.status === 'success') {
      console.log('✅ API: Transacción exitosa')
      
      // Generar UUID real para la base de datos
      const { v4: uuidv4 } = await import('uuid')
      const dbVendorId = uuidv4()
      
      // Guardar vendor en la base de datos
      try {
        console.log('💾 API: Guardando vendor en base de datos...')
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        // Parsear vendorData para obtener información completa
        const fullVendorData = JSON.parse(vendorData)
        console.log('🔍 API: Datos completos del vendor:', fullVendorData)
        console.log('🔍 API: ownerFid específico:', fullVendorData.ownerFid)
        console.log('🔍 API: Tipo de ownerFid:', typeof fullVendorData.ownerFid)
        console.log('🔍 API: delegation específica:', fullVendorData.delegation)
        
        // Buscar la zona por delegación
        console.log('🔍 API: Buscando zona para delegación:', fullVendorData.delegation)
        
        const { data: zoneResult, error: zoneError } = await supabase
          .rpc('get_zone_by_delegation', { input_delegation_name: fullVendorData.delegation })

        console.log('🔍 API: Resultado de get_zone_by_delegation:', { zoneResult, zoneError })

        if (zoneError) {
          console.error('❌ API: Error al buscar zona:', zoneError)
          return NextResponse.json(
            { 
              success: false, 
              error: 'Error al buscar zona',
              details: zoneError.message
            },
            { status: 500 }
          )
        }

        if (!zoneResult) {
          console.error('❌ API: No se encontró zona para delegación:', fullVendorData.delegation)
          
          // Mostrar delegaciones disponibles
          const { data: availableDelegations, error: delegationsError } = await supabase
            .from('zone_delegations')
            .select('delegation_name, zones(name)')
            .order('delegation_name')
          
          if (delegationsError) {
            console.error('❌ API: Error al obtener delegaciones disponibles:', delegationsError)
            return NextResponse.json(
              { 
                success: false, 
                error: 'Delegación inválida. Contacta soporte.'
              },
              { status: 400 }
            )
          }
          
          const availableDelegationNames = availableDelegations?.map(d => d.delegation_name) || []
          console.log('📋 API: Delegaciones disponibles:', availableDelegationNames)
          
          return NextResponse.json(
            { 
              success: false, 
              error: `Delegación inválida: "${fullVendorData.delegation}". Delegaciones disponibles: ${availableDelegationNames.join(', ')}`
            },
            { status: 400 }
          )
        }

        const zoneId = zoneResult  // ✅ Usar directamente el resultado como en el endpoint que funciona
        console.log('✅ API: Zona encontrada para delegación:', fullVendorData.delegation, '->', zoneId)
        
        // Validar que ownerFid no sea null o undefined
        if (!fullVendorData.ownerFid) {
          console.error('❌ API: ownerFid es null o undefined:', fullVendorData.ownerFid)
          return NextResponse.json(
            { 
              success: false, 
              error: 'FID del propietario es requerido para registrar el vendor'
            },
            { status: 400 }
          )
        }
        
        // Convertir ownerFid a número si viene como string
        const ownerFid = typeof fullVendorData.ownerFid === 'string' 
          ? parseInt(fullVendorData.ownerFid, 10) 
          : fullVendorData.ownerFid
        
        if (isNaN(ownerFid)) {
          console.error('❌ API: ownerFid no es un número válido:', fullVendorData.ownerFid)
          return NextResponse.json(
            { 
              success: false, 
              error: 'FID del propietario debe ser un número válido'
            },
            { status: 400 }
          )
        }
        
        console.log('✅ API: ownerFid validado y convertido:', ownerFid)
        console.log('✅ API: delegation a guardar:', fullVendorData.delegation)
        
        // Insertar el vendor con datos completos
        const { data: newVendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            id: dbVendorId,
            name: fullVendorData.name,
            description: fullVendorData.description,
            image_url: fullVendorData.imageUrl,
            category: fullVendorData.category,
            delegation: fullVendorData.delegation,
            zone_id: zoneId,
            owner_fid: ownerFid,
            is_verified: false,
            total_battles: 0,
            wins: 0,
            losses: 0,
            win_rate: 0,
            // total_revenue: parseFloat(paymentAmount), // Comentado temporalmente - verificar schema
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
          console.error('❌ API: Error al guardar vendor en BD:', vendorError)
        } else {
          console.log('✅ API: Vendor guardado en BD:', newVendor?.id)
        }
      } catch (dbError) {
        console.error('❌ API: Error general al guardar en BD:', dbError)
      }
      
      return NextResponse.json({
        success: true,
        data: {
          transactionHash: hash,
          vendorId: dbVendorId,
          originalVendorId: vendorId,
          userAddress,
          amount: paymentAmount,
          message: 'Vendor registered successfully on blockchain',
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed.toString()
        }
      })
    } else {
      console.error('❌ API: Transacción falló en blockchain')
      console.error('🔍 API: Detalles del receipt:', {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        logs: receipt.logs
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction failed on blockchain',
          details: 'The smart contract reverted the transaction. This could be due to business logic restrictions.',
          transactionHash: hash
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ API: Error en registro de vendor:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
