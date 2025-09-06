import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'
import { createPublicClient, http, encodeFunctionData } from 'viem'
import { readContract as readContractAction } from 'viem/actions'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount, signTransaction } from 'viem/accounts'
import { sendRawTransaction, waitForTransactionReceipt } from 'viem/actions'
import { getTransactionCount } from 'viem/actions'
import { PAYMENT_CONFIG } from '@/config/payment'
import { simulateContract } from 'viem/actions'

// ABI para el contrato VendorRegistration (reutilizamos el mismo contrato)
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


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendorId, content, userAddress, paymentAmount, reviewData, ownerFid } = body

    // Validate required fields
    if (!vendorId || !content || !userAddress || !paymentAmount || !ownerFid) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate payment amount (should be 15 $BATTLE tokens)
    const expectedAmount = PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString()
    if (paymentAmount !== expectedAmount) {
      return NextResponse.json(
        { success: false, error: `Invalid payment amount. Expected ${expectedAmount} $BATTLE tokens, got ${paymentAmount}` },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Review must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'Review must be less than 500 characters' },
        { status: 400 }
      )
    }

    // Get user profile from database using the provided ownerFid
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }
    
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('users')
      .select('fid, username, display_name, avatar_url')
      .eq('fid', ownerFid)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 400 }
      )
    }

    // User profile found, proceed with review creation

    // Check if user has already reviewed this vendor
    const { data: existingReview, error: existingReviewError } = await supabaseAdmin
      .from('vendor_reviews')
      .select('id')
      .eq('vendor_id', vendorId)
      .eq('user_fid', ownerFid)
      .single()

    if (existingReview && !existingReviewError) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this vendor' },
        { status: 400 }
      )
    }

    // Validar variables de entorno para blockchain
    const privateKey = process.env.SERVER_PRIVATE_KEY
    const walletAddress = process.env.SERVER_WALLET_ADDRESS
    
    if (!privateKey) {
      console.error('❌ SERVER_PRIVATE_KEY no configurada')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: SERVER_PRIVATE_KEY not set' },
        { status: 500 }
      )
    }
    
    if (!walletAddress) {
      console.error('❌ SERVER_WALLET_ADDRESS no configurada')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: SERVER_WALLET_ADDRESS not set' },
        { status: 500 }
      )
    }

    // Crear cliente Viem
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
    })
    
    // Preparar datos de la transacción
    const amountInWei = BigInt(paymentAmount) * BigInt(10 ** 18) // Convertir a wei
    
    // Verificar que el usuario tiene saldo suficiente
    console.log('🔍 Verificando saldo del usuario...')
    try {
      const balanceData = await readContractAction(publicClient, {
        address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      })
      
      console.log('🔍 Saldo BATTLE del usuario:', balanceData.toString())
      
      if (balanceData < amountInWei) {
        return NextResponse.json(
          { success: false, error: 'Insufficient BATTLE tokens' },
          { status: 400 }
        )
      }
      
      console.log('✅ Saldo BATTLE suficiente')
    } catch (balanceError) {
      console.error('❌ Error verificando saldo:', balanceError)
      return NextResponse.json(
        { success: false, error: 'Error checking BATTLE balance' },
        { status: 500 }
      )
    }

    // Preparar datos del review para la blockchain
    const reviewDataForBlockchain = JSON.stringify({
      vendorId,
      content: content.trim(),
      userFid: ownerFid,
      timestamp: Date.now()
    })

    // Generar ID único para el review (combinando vendorId, userFid y timestamp)
    const uniqueReviewId = `review_${vendorId}_${ownerFid}_${Date.now()}`

    // Preparar la transacción
    console.log('🔍 Preparando transacción para review...')
    console.log('🔍 Unique review ID:', uniqueReviewId)
    
    const transactionData = encodeFunctionData({
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'registerVendor',
      args: [userAddress as `0x${string}`, amountInWei, reviewDataForBlockchain, uniqueReviewId]
    })
    
    console.log('🔍 Transaction data length:', transactionData.length)
    
    const transaction = {
      to: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
      data: transactionData,
      gas: 1000000n,
      maxFeePerGas: 500000000n, // 0.5 Gwei
      maxPriorityFeePerGas: 100000000n // 0.1 Gwei
    }
    
    // Obtener nonce de la cuenta
    const nonce = await getTransactionCount(publicClient, { address: walletAddress as `0x${string}` })
    console.log('🔍 Nonce de la cuenta:', nonce)
    
    // Firmar la transacción
    console.log('🔍 Firmando transacción...')
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    
    const signedTransaction = await signTransaction({
      transaction: {
        ...transaction,
        nonce,
        chainId: baseSepolia.id
      },
      privateKey: privateKey as `0x${string}`
    })
    
    console.log('✅ Transacción firmada')
    
    // Enviar transacción
    console.log('🔍 Enviando transacción...')
    const hash = await sendRawTransaction(publicClient, { serializedTransaction: signedTransaction })
    console.log('✅ Transacción enviada, hash:', hash)
    
    // Esperar confirmación
    console.log('⏳ Esperando confirmación...')
    const receipt = await waitForTransactionReceipt(publicClient, { hash })
    console.log('✅ Transacción confirmada en bloque:', receipt.blockNumber)
    
    if (receipt.status === 'success') {
      console.log('✅ Transacción exitosa, guardando review en BD...')
      
      // Crear review record en la base de datos
      const { data: review, error: reviewError } = await supabaseAdmin
        .from('vendor_reviews')
        .insert({
          vendor_id: vendorId,
          user_fid: ownerFid,
          content: content.trim(),
          tokens_paid: parseInt(paymentAmount),
          payment_transaction_hash: hash,
          review_data: reviewData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (reviewError) {
        console.error('Error creating review:', reviewError)
        return NextResponse.json(
          { success: false, error: 'Failed to create review' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: review.id,
          transactionHash: hash,
          message: 'Review submitted successfully and tokens burned',
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed.toString()
        }
      })
    } else {
      console.error('❌ Transacción falló en blockchain')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction failed on blockchain',
          details: 'The smart contract reverted the transaction',
          transactionHash: hash
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in review submission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
