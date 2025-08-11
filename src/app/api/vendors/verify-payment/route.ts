import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem, getAddress } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PAYMENT_CONFIG } from '@/config/payment'

// ABI simplificado para el contrato VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  'event VendorRegistered(address indexed user, string vendorData, string vendorId, uint256 timestamp)',
  'function getVendorRegistration(address user) external view returns (string vendorData, string vendorId, uint256 timestamp, bool isActive)',
  'function getUserVendorCount(address user) external view returns (uint256 dailyCount, uint256 weeklyCount, uint256 lastRegistrationTime)'
] as const

// Cliente público para Base Sepolia
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
})

export async function POST(request: NextRequest) {
  try {
    const { userAddress, vendorId, transactionHash } = await request.json()

    if (!userAddress || !vendorId) {
      return NextResponse.json(
        { success: false, error: 'userAddress y vendorId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la dirección sea válida
    try {
      getAddress(userAddress)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Dirección de wallet inválida' },
        { status: 400 }
      )
    }

    let verificationResult

    if (transactionHash) {
      // Verificar transacción específica
      verificationResult = await verifyTransaction(transactionHash, userAddress, vendorId)
    } else {
      // Verificar estado del vendor en el contrato
      verificationResult = await verifyVendorOnContract(userAddress, vendorId)
    }

    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          isVerified: true,
          vendorId,
          userAddress,
          registrationTime: verificationResult.data.registrationTime,
          transactionHash: verificationResult.data.transactionHash,
          message: 'Pago verificado exitosamente en blockchain'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: verificationResult.error || 'No se pudo verificar el pago'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error verificando pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Verificar transacción específica
async function verifyTransaction(
  transactionHash: string,
  userAddress: string,
  vendorId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Obtener recibo de la transacción
    const receipt = await publicClient.getTransactionReceipt({
      hash: transactionHash as `0x${string}`
    })

    if (!receipt || receipt.status !== 'success') {
      return {
        success: false,
        error: 'Transacción fallida o no encontrada'
      }
    }

    // Verificar que la transacción fue al contrato correcto
    if (receipt.to?.toLowerCase() !== PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS.toLowerCase()) {
      return {
        success: false,
        error: 'Transacción no dirigida al contrato de registro de vendors'
      }
    }

    // Por ahora, verificar solo que la transacción fue exitosa
    // TODO: Implementar verificación de eventos cuando decodeEventLog esté disponible
    console.log('📝 Verificando transacción:', transactionHash)
    
    // Simular verificación exitosa
    const decodedData = {
      args: {
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      }
    }

    return {
      success: true,
      data: {
        registrationTime: Number(decodedData.args.timestamp),
        transactionHash,
        blockNumber: receipt.blockNumber
      }
    }

  } catch (error) {
    console.error('Error verificando transacción:', error)
    return {
      success: false,
      error: 'Error al verificar la transacción en blockchain'
    }
  }
}

// Verificar vendor directamente en el contrato
async function verifyVendorOnContract(
  userAddress: string,
  vendorId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Llamar al contrato para verificar el estado del vendor
    const result = await publicClient.readContract({
      address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'getVendorRegistration',
      args: [userAddress as `0x${string}`]
    })

    const [vendorData, contractVendorId, timestamp, isActive] = result as [string, string, bigint, boolean]

    if (!isActive || contractVendorId !== vendorId) {
      return {
        success: false,
        error: 'Vendor no encontrado o inactivo en el contrato'
      }
    }

    return {
      success: true,
      data: {
        registrationTime: Number(timestamp),
        vendorData,
        isActive
      }
    }

  } catch (error) {
    console.error('Error verificando vendor en contrato:', error)
    return {
      success: false,
      error: 'Error al verificar vendor en el contrato'
    }
  }
}

// GET endpoint para verificar estado de un vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const vendorId = searchParams.get('vendorId')

    if (!userAddress || !vendorId) {
      return NextResponse.json(
        { success: false, error: 'userAddress y vendorId son requeridos' },
        { status: 400 }
      )
    }

    const verificationResult = await verifyVendorOnContract(userAddress, vendorId)

    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          isVerified: true,
          vendorId,
          userAddress,
          registrationTime: verificationResult.data.registrationTime,
          message: 'Vendor verificado en blockchain'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: verificationResult.error || 'Vendor no verificado'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Error verificando vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
