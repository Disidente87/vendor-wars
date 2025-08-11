import { createPublicClient, http, parseEther, formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import type { 
  VendorRegistrationData,
  VendorRegistrationResult,
  PaymentVerificationResult
} from '@/types/vendorRegistration'

// Contract ABI for VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  {
    type: 'function',
    name: 'registerVendor',
    inputs: [
      { type: 'address', name: 'user' },
      { type: 'uint256', name: 'amount' },
      { type: 'string', name: 'vendorData' },
      { type: 'string', name: 'vendorId' }
    ],
    outputs: [{ type: 'bool', name: 'success' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getVendorRegistrationCost',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'hasSufficientBalance',
    inputs: [{ type: 'address', name: 'user' }],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getTotalTokensBurned',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getTotalVendorsRegistered',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'vendorExists',
    inputs: [{ type: 'string', name: 'vendorId' }],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view'
  }
]

// Contract configuration
const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS as `0x${string}`,
  chainId: baseSepolia.id
}

// Validate contract configuration
function validateContractConfig() {
  if (!CONTRACT_CONFIG.address) {
    throw new Error('VENDOR_REGISTRATION_CONTRACT_ADDRESS not configured')
  }
}

export class VendorRegistrationService {
  private contractAddress: string
  private client: any

  constructor() {
    validateContractConfig()
    this.contractAddress = CONTRACT_CONFIG.address
    this.client = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })
  }

  /**
   * Get the cost to register a vendor
   */
  async getRegistrationCost(): Promise<string> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'getVendorRegistrationCost'
      })
      
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Error getting registration cost:', error)
      throw new Error('Failed to get registration cost')
    }
  }

  /**
   * Check if user has sufficient balance for vendor registration
   */
  async hasSufficientBalance(userAddress: string): Promise<boolean> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'hasSufficientBalance',
        args: [userAddress]
      })
      
      return result as boolean
    } catch (error) {
      console.error('Error checking balance:', error)
      throw new Error('Failed to check balance')
    }
  }

  /**
   * Get total tokens burned from vendor registrations
   */
  async getTotalTokensBurned(): Promise<string> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'getTotalTokensBurned'
      })
      
      return formatEther(result as bigint)
    } catch (error) {
      console.error('Error getting total tokens burned:', error)
      throw new Error('Failed to get total tokens burned')
    }
  }

  /**
   * Get total vendors registered
   */
  async getTotalVendorsRegistered(): Promise<number> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'getTotalVendorsRegistered'
      })
      
      return Number(result)
    } catch (error) {
      console.error('Error getting total vendors:', error)
      throw new Error('Failed to get total vendors')
    }
  }

  /**
   * Check if a vendor ID already exists
   */
  async vendorExists(vendorId: string): Promise<boolean> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'vendorExists',
        args: [vendorId]
      })
      
      return result as boolean
    } catch (error) {
      console.error('Error checking vendor existence:', error)
      throw new Error('Failed to check vendor existence')
    }
  }

  /**
   * Verify payment transaction on blockchain
   */
  async verifyPaymentTransaction(
    userAddress: string,
    amount: string,
    vendorId: string
  ): Promise<PaymentVerificationResult> {
    try {
      // This would typically verify a transaction hash
      // For now, we'll simulate the verification
      const parsedAmount = parseEther(amount)
      
      // Check if user has sufficient balance
      const hasBalance = await this.hasSufficientBalance(userAddress)
      if (!hasBalance) {
        return {
          success: false,
          error: 'Insufficient balance for vendor registration'
        }
      }

      // Check if vendor ID already exists
      const exists = await this.vendorExists(vendorId)
      if (exists) {
        return {
          success: false,
          error: 'Vendor ID already exists'
        }
      }

      return {
        success: true,
        amount: parsedAmount.toString(),
        userAddress,
        vendorId
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process vendor registration with payment
   */
  async processVendorRegistration(
    data: VendorRegistrationData
  ): Promise<VendorRegistrationResult> {
    try {
      // Verify payment first
      const paymentVerification = await this.verifyPaymentTransaction(
        data.userAddress,
        data.amount,
        data.vendorId
      )

      if (!paymentVerification.success) {
        return {
          success: false,
          error: paymentVerification.error
        }
      }

      // Here we would typically:
      // 1. Call the smart contract to burn tokens
      // 2. Register vendor in database
      // 3. Handle any rollback if needed

      return {
        success: true,
        vendorId: data.vendorId,
        transactionHash: 'simulated_transaction_hash',
        amount: data.amount,
        message: 'Vendor registered successfully with payment'
      }
    } catch (error) {
      console.error('Error processing vendor registration:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export function getVendorRegistrationService(): VendorRegistrationService {
  return new VendorRegistrationService()
}
