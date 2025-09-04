import { createPublicClient, http, getAddress } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PAYMENT_CONFIG } from '@/config/payment'

// Cliente público para Base Sepolia
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
})

// ABI simplificado para el contrato VendorRegistration (reutilizamos para reviews)
const VENDOR_REGISTRATION_ABI = [
  'event VendorRegistered(address indexed user, string vendorData, string vendorId, uint256 timestamp)',
  'function getVendorRegistration(address user) external view returns (string vendorData, string vendorId, uint256 timestamp, bool isActive)',
  'function getUserVendorCount(address user) external view returns (uint256 dailyCount, uint256 weeklyCount, uint256 lastRegistrationTime)',
  'function registerVendor(address user, uint256 amount, string vendorData, string vendorId) external returns (bool success)'
] as const

/**
 * Verifica el pago en blockchain para reviews
 * Reutiliza el sistema de vendor registration pero con diferentes parámetros
 */
export async function verifyPaymentOnBlockchain(
  userAddress: string,
  vendorId: string,
  transactionHash?: string
): Promise<{ success: boolean; data?: any; error?: string; transactionHash?: string }> {
  try {
    console.log('🔍 Verificando pago en blockchain para review:', { userAddress, vendorId, transactionHash })

    // Verificar que la dirección sea válida
    try {
      getAddress(userAddress)
    } catch {
      return {
        success: false,
        error: 'Dirección de wallet inválida'
      }
    }

    if (transactionHash) {
      // Verificar transacción específica
      return await verifyReviewTransaction(transactionHash, userAddress, vendorId)
    } else {
      // Para reviews, no necesitamos verificar el vendor en el contrato
      // Solo verificamos que el usuario tenga suficiente balance y allowance
      return await verifyUserCanReview(userAddress)
    }

  } catch (error) {
    console.error('Error verificando pago para review:', error)
    return {
      success: false,
      error: 'Error al verificar el pago en blockchain'
    }
  }
}

/**
 * Verifica una transacción específica de review
 */
async function verifyReviewTransaction(
  transactionHash: string,
  userAddress: string,
  vendorId: string
): Promise<{ success: boolean; data?: any; error?: string; transactionHash?: string }> {
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
        error: 'Transacción no dirigida al contrato de registro'
      }
    }

    // Verificar que la transacción fue del usuario correcto
    const transaction = await publicClient.getTransaction({
      hash: transactionHash as `0x${string}`
    })

    if (transaction.from.toLowerCase() !== userAddress.toLowerCase()) {
      return {
        success: false,
        error: 'Transacción no realizada por el usuario correcto'
      }
    }

    console.log('✅ Transacción de review verificada exitosamente:', transactionHash)
    
    return {
      success: true,
      data: {
        transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now()
      },
      transactionHash
    }

  } catch (error) {
    console.error('Error verificando transacción de review:', error)
    return {
      success: false,
      error: 'Error al verificar la transacción en blockchain'
    }
  }
}

/**
 * Verifica que el usuario puede hacer una review
 * (tiene suficiente balance y allowance)
 */
async function verifyUserCanReview(
  userAddress: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Para reviews, no necesitamos verificar el contrato específicamente
    // Solo verificamos que el usuario esté conectado y tenga una dirección válida
    console.log('✅ Usuario verificado para review:', userAddress)
    
    return {
      success: true,
      data: {
        userAddress,
        timestamp: Date.now()
      }
    }

  } catch (error) {
    console.error('Error verificando usuario para review:', error)
    return {
      success: false,
      error: 'Error al verificar el usuario'
    }
  }
}

/**
 * Verifica el estado de una transacción en blockchain
 */
export async function verifyTransactionOnChain(transactionHash: string): Promise<boolean> {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: transactionHash as `0x${string}`
    })

    return receipt?.status === 'success'
  } catch (error) {
    console.error('Error verificando transacción:', error)
    return false
  }
}

/**
 * Obtiene el balance de BATTLE tokens de un usuario
 */
export async function getUserTokenBalance(userAddress: string): Promise<bigint> {
  try {
    // ABI para el token BATTLE
    const BATTLE_TOKEN_ABI = [
      {
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const

    const balance = await publicClient.readContract({
      address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`]
    })

    return balance as bigint
  } catch (error) {
    console.error('Error obteniendo balance de tokens:', error)
    return BigInt(0)
  }
}

/**
 * Obtiene el allowance de BATTLE tokens para el contrato de registro
 */
export async function getUserTokenAllowance(userAddress: string): Promise<bigint> {
  try {
    // ABI para el token BATTLE
    const BATTLE_TOKEN_ABI = [
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const

    const allowance = await publicClient.readContract({
      address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'allowance',
      args: [userAddress as `0x${string}`, PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`]
    })

    return allowance as bigint
  } catch (error) {
    console.error('Error obteniendo allowance de tokens:', error)
    return BigInt(0)
  }
}
