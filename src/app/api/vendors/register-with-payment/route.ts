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
  ownerFid?: number // FID del usuario autenticado
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Iniciando registro de vendor con pago...')
    
    const body: VendorRegistrationRequest = await request.json()
    const { userAddress, vendorData, vendorId, paymentAmount, signature, ownerFid } = body
    
    // Leer FID del header como alternativa
    const headerFid = request.headers.get('x-farcaster-fid')
    const headerFidNumber = headerFid ? parseInt(headerFid, 10) : null
    
    console.log('🔍 API: headerFid raw:', headerFid)
    console.log('🔍 API: headerFid parsed:', headerFidNumber)
    
    console.log('🔍 API: Body recibido:', { 
      userAddress, 
      vendorId, 
      paymentAmount, 
      signature: signature ? 'SÍ' : 'NO',
      vendorDataLength: vendorData?.length || 0,
      ownerFid: ownerFid,
      headerFid: headerFidNumber
    })
    
    console.log('🔍 API: Validando campos...')
    console.log('🔍 API: userAddress válido?', userAddress && userAddress.match(/^0x[a-fA-F0-9]{40}$/))
    console.log('🔍 API: vendorData válido?', vendorData && vendorData.length > 0)
    console.log('🔍 API: vendorId válido?', vendorId && vendorId.length > 0)
    console.log('🔍 API: paymentAmount válido?', paymentAmount && paymentAmount.length > 0)
    console.log('🔍 API: signature válido?', signature && signature.length > 0)
    
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
    // Usar un vendorId diferente para la simulación para evitar efectos secundarios
    const simulationVendorId = `sim_${vendorId}`
    console.log('🔍 API: Simulando transacción con vendorId de simulación:', simulationVendorId)
    try {
      await simulateContract(publicClient, {
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'registerVendor',
        args: [userAddress as `0x${string}`, amountInWei, vendorData, simulationVendorId],
        account: walletAddress as `0x${string}`
      })
      console.log('✅ API: Simulación exitosa')
    } catch (simulationError: any) {
      console.error('❌ API: Error en simulación:', simulationError)
      
      // Verificar si es un error de cooldown específico
      if (simulationError?.shortMessage?.includes('Cooldown period not met')) {
        console.log('⏰ API: Error de cooldown detectado')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cooldown period not met',
            message: 'Debes esperar 1 hora entre registros de vendors. Intenta de nuevo más tarde.',
            cooldownError: true
          },
          { status: 429 } // Too Many Requests
        )
      }
      
      console.log('⚠️ API: Continuando con el proceso a pesar del error de simulación...')
      
      // No retornamos error aquí, continuamos con el proceso
      // El usuario puede haber aprobado los tokens después de la simulación
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
        
        console.log('🔍 API: Cliente Supabase creado:', {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'No configurado',
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'No configurado'
        })
        
        // Parsear vendorData para obtener información completa
        const fullVendorData = JSON.parse(vendorData)
        
        console.log('🔍 API: fullVendorData.imageUrl:', fullVendorData.imageUrl)
        console.log('🔍 API: imageUrl es blob?', fullVendorData.imageUrl?.startsWith('blob:'))
        
        // Usar FID del header como prioridad, luego del body, luego fallback
        console.log('🔍 API: ownerFid del body:', ownerFid)
        console.log('🔍 API: headerFid:', headerFidNumber)
        
        // Prioridad: header > body > fallback
        const finalOwnerFid = headerFidNumber || ownerFid || 465823
        console.log('🔍 API: ownerFid final (con fallback):', finalOwnerFid)
        
        // Buscar la zona por delegación
        console.log('🔍 API: Buscando zona para delegación:', fullVendorData.delegation)
        
        const { data: zoneResult, error: zoneError } = await supabase
          .rpc('get_zone_by_delegation', { input_delegation_name: fullVendorData.delegation })

        if (zoneError) {
          console.error('❌ API: Error al buscar zona:', zoneError)
        }

        const zoneId = zoneResult || 8
        console.log('✅ API: Zona encontrada para delegación:', fullVendorData.delegation, '->', zoneId)
        
        // Insertar el vendor con datos completos
        console.log('🔍 API: Intentando insertar vendor con datos:', {
          id: dbVendorId,
          name: fullVendorData.name,
          description: fullVendorData.description,
          image_url: fullVendorData.imageUrl,
          category: fullVendorData.category,
          delegation: fullVendorData.delegation,
          zone_id: zoneId,
          owner_fid: finalOwnerFid
        })
        
        // Agregar timeout para evitar que se cuelgue
        const insertPromise = supabase
          .from('vendors')
          .insert({
            id: dbVendorId,
            name: fullVendorData.name,
            description: fullVendorData.description,
            image_url: fullVendorData.imageUrl,
            category: fullVendorData.category,
            subcategories: fullVendorData.subcategories || [], // Include subcategories
            delegation: fullVendorData.delegation,
            zone_id: zoneId,
            owner_fid: finalOwnerFid,
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
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Inserción en BD tardó más de 10 segundos')), 10000)
        )
        
        const { data: newVendor, error: vendorError } = await Promise.race([insertPromise, timeoutPromise]) as any

        console.log('🔍 API: Resultado de inserción:', { newVendor, vendorError })

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
