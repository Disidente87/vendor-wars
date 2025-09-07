import { createPublicClient, http, parseEther, formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import { readContract as readContractAction } from 'viem/actions'
import { VENDOR_WARS_EXTENDED_ABI, type VendorInfo, type Territory, type Vote, type GeneralStats } from '@/contracts/VendorWarsExtendedABI'
import { PAYMENT_CONFIG } from '@/config/payment'

// Configuración del contrato VendorWarsExtended
const CONTRACT_CONFIG = {
  address: PAYMENT_CONFIG.VENDOR_WARS_EXTENDED.ADDRESS as `0x${string}`,
  chainId: baseSepolia.id
}

// Validar configuración del contrato
function validateContractConfig() {
  if (!CONTRACT_CONFIG.address || CONTRACT_CONFIG.address === '0x0000000000000000000000000000000000000000') {
    throw new Error('VENDOR_WARS_EXTENDED_CONTRACT_ADDRESS not configured or deployed')
  }
}

export class VendorWarsExtendedService {
  private contractAddress: string
  private publicClient: ReturnType<typeof createPublicClient>

  constructor() {
    validateContractConfig()
    this.contractAddress = CONTRACT_CONFIG.address
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(PAYMENT_CONFIG.VENDOR_WARS_EXTENDED.NETWORK.RPC_URL)
    }) as any
  }

  // ============ REVIEW FUNCTIONS ============

  /**
   * Verifica si el contrato está pausado
   */
  async isPaused(): Promise<boolean> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'paused'
      })
      return result as boolean
    } catch (error) {
      console.error('Error checking if contract is paused:', error)
      throw new Error('Failed to check contract pause status')
    }
  }

  /**
   * Verifica si un usuario tiene saldo suficiente para submitir un review
   */
  async hasSufficientBalanceForReview(userAddress: string): Promise<boolean> {
    try {
      const requiredAmount = parseEther(PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString())
      
      const balance = await readContractAction(this.publicClient, {
        address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
        abi: [
          {
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function'
          }
        ],
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      })

      return (balance as bigint) >= requiredAmount
    } catch (error) {
      console.error('Error checking balance for review:', error)
      throw new Error('Failed to check user balance')
    }
  }

  /**
   * Verifica el allowance del usuario para el contrato
   */
  async getAllowance(userAddress: string): Promise<bigint> {
    try {
      const allowance = await readContractAction(this.publicClient, {
        address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
        abi: [
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
        ],
        functionName: 'allowance',
        args: [userAddress as `0x${string}`, this.contractAddress as `0x${string}`]
      })

      return allowance as bigint
    } catch (error) {
      console.error('Error checking allowance:', error)
      throw new Error('Failed to check token allowance')
    }
  }

  /**
   * Verifica si el usuario tiene allowance suficiente para submitir un review
   */
  async hasSufficientAllowanceForReview(userAddress: string): Promise<boolean> {
    try {
      const requiredAmount = parseEther(PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString())
      const allowance = await this.getAllowance(userAddress)
      return allowance >= requiredAmount
    } catch (error) {
      console.error('Error checking allowance for review:', error)
      throw new Error('Failed to check token allowance')
    }
  }

  // ============ VENDOR FUNCTIONS ============

  /**
   * Obtiene información de un vendor
   */
  async getVendorInfo(vendorId: string): Promise<VendorInfo | null> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getVendorInfoExtended',
        args: [vendorId]
      })

      const [
        user,
        amount,
        timestamp,
        vendorData,
        zoneId,
        isVerified,
        verifier,
        verificationTime,
        exists,
        totalVotes,
        territoryScore
      ] = result as [
        string,
        bigint,
        bigint,
        string,
        string,
        boolean,
        string,
        bigint,
        boolean,
        bigint,
        bigint
      ]

      return {
        user,
        amount,
        timestamp,
        vendorData,
        zoneId,
        isVerified,
        verifier,
        verificationTime,
        totalVotes,
        territoryScore,
        exists
      }
    } catch (error) {
      console.error('Error getting vendor info:', error)
      return null
    }
  }

  /**
   * Verifica si un vendor existe
   */
  async vendorExists(vendorId: string): Promise<boolean> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'vendorExists',
        args: [vendorId]
      })
      return result as boolean
    } catch (error) {
      console.error('Error checking if vendor exists:', error)
      return false
    }
  }

  /**
   * Obtiene el total de votos de un vendor
   */
  async getVendorTotalVotes(vendorId: string): Promise<bigint> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getVendorTotalVotes',
        args: [vendorId]
      })
      return result as bigint
    } catch (error) {
      console.error('Error getting vendor total votes:', error)
      return 0n
    }
  }

  // ============ TERRITORY FUNCTIONS ============

  /**
   * Obtiene información de un territorio
   */
  async getTerritory(zoneId: string): Promise<Territory | null> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getTerritory',
        args: [zoneId]
      })

      const territory = result as Territory
      return territory
    } catch (error) {
      console.error('Error getting territory:', error)
      return null
    }
  }

  /**
   * Obtiene el total de votos de una zona
   */
  async getZoneTotalVotes(zoneId: string): Promise<bigint> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getZoneTotalVotes',
        args: [zoneId]
      })
      return result as bigint
    } catch (error) {
      console.error('Error getting zone total votes:', error)
      return 0n
    }
  }

  // ============ STATISTICS FUNCTIONS ============

  /**
   * Obtiene estadísticas generales del contrato
   */
  async getGeneralStats(): Promise<GeneralStats | null> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getGeneralStats'
      })

      const [totalTokensBurned, totalVendorsRegistered, totalVotes] = result as [
        bigint,
        bigint,
        bigint
      ]

      return {
        totalTokensBurned,
        totalVendorsRegistered,
        totalVotes
      }
    } catch (error) {
      console.error('Error getting general stats:', error)
      return null
    }
  }

  /**
   * Obtiene el total de tokens quemados
   */
  async getTotalTokensBurned(): Promise<bigint> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getTotalTokensBurned'
      })
      return result as bigint
    } catch (error) {
      console.error('Error getting total tokens burned:', error)
      return 0n
    }
  }

  /**
   * Obtiene el total de vendors registrados
   */
  async getTotalVendorsRegistered(): Promise<bigint> {
    try {
      const result = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getTotalVendorsRegistered'
      })
      return result as bigint
    } catch (error) {
      console.error('Error getting total vendors registered:', error)
      return 0n
    }
  }

  // ============ RATE LIMITING FUNCTIONS ============

  /**
   * Obtiene el contador diario de operaciones de un usuario
   */
  async getDailyOperationCount(userAddress: string): Promise<bigint> {
    try {
      const currentDay = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getCurrentDay'
      })

      const count = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getDailyVendorCount',
        args: [userAddress as `0x${string}`, currentDay as bigint] as any
      })

      return count as bigint
    } catch (error) {
      console.error('Error getting daily operation count:', error)
      return 0n
    }
  }

  /**
   * Obtiene el contador semanal de operaciones de un usuario
   */
  async getWeeklyOperationCount(userAddress: string): Promise<bigint> {
    try {
      const currentWeek = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getCurrentWeek'
      })

      const count = await readContractAction(this.publicClient, {
        address: this.contractAddress as `0x${string}`,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'getWeeklyVendorCount',
        args: [userAddress as `0x${string}`, currentWeek as bigint] as any
      })

      return count as bigint
    } catch (error) {
      console.error('Error getting weekly operation count:', error)
      return 0n
    }
  }

  // ============ UTILITY FUNCTIONS ============

  /**
   * Formatea un monto de tokens para mostrar
   */
  formatTokenAmount(amount: bigint, decimals: number = 18): string {
    try {
      const numericAmount = Number(amount) / Math.pow(10, decimals)
      return numericAmount.toFixed(2)
    } catch (error) {
      return '0.00'
    }
  }

  /**
   * Convierte un monto a wei
   */
  parseTokenAmount(amount: string | number, decimals: number = 18): bigint {
    try {
      const numericAmount = Number(amount) * Math.pow(10, decimals)
      return BigInt(Math.floor(numericAmount))
    } catch (error) {
      return 0n
    }
  }

  /**
   * Obtiene la dirección del contrato
   */
  getContractAddress(): string {
    return this.contractAddress
  }

  /**
   * Obtiene el cliente público
   */
  getPublicClient() {
    return this.publicClient
  }
}

// Instancia singleton del servicio
export const vendorWarsExtendedService = new VendorWarsExtendedService()
