import { createPublicClient, http, parseEther, formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import type { 
  BattleTokenContract, 
  TokenBalance, 
  TokenDistributionStats,
  DistributionRequest
} from '@/types/contracts'
import { 
  TokenError,
  InsufficientBalanceError,
  UnauthorizedError
} from '@/types/contracts'

// Contract ABI - Basic ERC20 functions + custom functions from the decompiled contract
const BATTLE_TOKEN_ABI = [
  // ERC20 Standard Functions
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'uint8', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'owner' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'spender' }
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'value' }
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'value' }
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { type: 'address', name: 'spender' },
      { type: 'uint256', name: 'value' }
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable'
  },
  // Minting (Owner only)
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  // Burning
  {
    type: 'function',
    name: 'burn',
    inputs: [{ type: 'uint256', name: 'value' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'burnFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'uint256', name: 'value' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  // Distribution function (Owner only)
  {
    type: 'function',
    name: 'distributeTokens',
    inputs: [
      { type: 'address[]', name: 'recipients' },
      { type: 'uint256[]', name: 'amounts' },
      { type: 'string', name: 'metadata' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  // Emergency functions (Owner only)
  {
    type: 'function',
    name: 'emergencyWithdraw',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  // Ownership
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ type: 'address', name: 'newOwner' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  // EIP-2612 Permit
  {
    type: 'function',
    name: 'permit',
    inputs: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'spender' },
      { type: 'uint256', name: 'value' },
      { type: 'uint256', name: 'deadline' },
      { type: 'uint8', name: 'v' },
      { type: 'bytes32', name: 'r' },
      { type: 'bytes32', name: 's' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'nonces',
    inputs: [{ type: 'address', name: 'owner' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  // Custom function from decompiled contract
  {
    type: 'function',
    name: 'getDistributionStats',
    inputs: [],
    outputs: [
      { type: 'uint256', name: 'totalSupply' },
      { type: 'uint256', name: 'ownerBalance' },
      { type: 'uint256', name: 'availableForDistribution' }
    ],
    stateMutability: 'view'
  },
  // Events
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { type: 'address', name: 'from', indexed: true },
      { type: 'address', name: 'to', indexed: true },
      { type: 'uint256', name: 'value', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { type: 'address', name: 'owner', indexed: true },
      { type: 'address', name: 'spender', indexed: true },
      { type: 'uint256', name: 'value', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      { type: 'address', name: 'previousOwner', indexed: true },
      { type: 'address', name: 'newOwner', indexed: true }
    ]
  },
  {
    type: 'event',
    name: 'TokensDistributed',
    inputs: [
      { type: 'uint256', name: 'recipientCount', indexed: false },
      { type: 'uint256', name: 'totalAmount', indexed: false },
      { type: 'string', name: 'metadata', indexed: false }
    ]
  }
] as const

// Contract configuration
const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS as string,
  chainId: baseSepolia.id,
  name: 'Battle Token',
  symbol: 'BATTLE',
  decimals: 18
}

// Validate contract configuration
function validateContractConfig() {
  if (!CONTRACT_CONFIG.address) {
    throw new Error('NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS is not configured')
  }
}

// Create public client for read operations
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
})

export class BattleTokenService {
  private contractAddress: string

  constructor() {
    validateContractConfig()
    this.contractAddress = CONTRACT_CONFIG.address
  }

  // Read operations (no wallet required)
  async getName(): Promise<string> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'name'
      })
      return result
    } catch (error) {
      throw new TokenError(`Failed to get token name: ${error}`)
    }
  }

  async getSymbol(): Promise<string> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'symbol'
      })
      return result
    } catch (error) {
      throw new TokenError(`Failed to get token symbol: ${error}`)
    }
  }

  async getDecimals(): Promise<number> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'decimals'
      })
      return result
    } catch (error) {
      throw new TokenError(`Failed to get token decimals: ${error}`)
    }
  }

  async getTotalSupply(): Promise<bigint> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'totalSupply'
      })
      return result
    } catch (error) {
      throw new TokenError(`Failed to get total supply: ${error}`)
    }
  }

  async getBalance(address: string): Promise<bigint> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      })
      return result
    } catch (error) {
      throw new TokenError(`Failed to get balance for ${address}: ${error}`)
    }
  }

  async getAllowance(owner: string, spender: string): Promise<bigint> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, spender as `0x${string}`]
      })
      return result
    } catch (error) {
      throw new TokenError(`Failed to get allowance: ${error}`)
    }
  }

  async getOwner(): Promise<string> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'owner'
      })
      return result
    } catch (error) {
      throw new TokenError(`Failed to get contract owner: ${error}`)
    }
  }

  async getDistributionStats(): Promise<TokenDistributionStats> {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'getDistributionStats'
      })
      
      const [totalSupply, ownerBalance, availableForDistribution] = result
      
      return {
        totalSupply,
        ownerBalance,
        availableForDistribution,
        formatted: {
          totalSupply: formatEther(totalSupply),
          ownerBalance: formatEther(ownerBalance),
          availableForDistribution: formatEther(availableForDistribution)
        }
      }
    } catch (error) {
      throw new TokenError(`Failed to get distribution stats: ${error}`)
    }
  }

  async getUserDistributionAmount(user: string): Promise<bigint> {
    try {
      // This would need to be implemented based on the actual contract storage
      // For now, returning 0 as placeholder
      return 0n
    } catch (error) {
      throw new TokenError(`Failed to get user distribution amount: ${error}`)
    }
  }

  // Utility functions
  formatBalance(balance: bigint): string {
    return formatEther(balance)
  }

  parseAmount(amount: string): bigint {
    return parseEther(amount)
  }

  async getTokenBalance(address: string): Promise<TokenBalance> {
    const balance = await this.getBalance(address)
    const symbol = await this.getSymbol()
    
    return {
      balance,
      formatted: this.formatBalance(balance),
      symbol
    }
  }

  // Validation functions
  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  validateAmount(amount: string): boolean {
    try {
      const parsed = parseFloat(amount)
      return parsed > 0 && !isNaN(parsed)
    } catch {
      return false
    }
  }
}

// Export singleton instance (lazy-loaded)
let _battleTokenService: BattleTokenService | null = null

export function getBattleTokenService(): BattleTokenService {
  if (!_battleTokenService) {
    _battleTokenService = new BattleTokenService()
  }
  return _battleTokenService
}

// For backward compatibility - will be initialized when needed
// export const battleTokenService = getBattleTokenService()

// Export contract configuration
export { CONTRACT_CONFIG, BATTLE_TOKEN_ABI }
