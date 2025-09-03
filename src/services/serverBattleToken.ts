import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

// Contract ABI - Only the functions we need for server-side operations
const BATTLE_TOKEN_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable", 
    "type": "function"
  },
  {
    "inputs": [
      { "name": "recipients", "type": "address[]" },
      { "name": "amounts", "type": "uint256[]" }
    ],
    "name": "distributeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface DistributionResult {
  success: boolean
  transactionHash?: string
  error?: string
  gasUsed?: bigint
  tokensDistributed?: number
}

export class ServerBattleTokenService {
  private walletClient: any
  private publicClient: any
  private contractAddress!: string
  private account: any

  constructor() {
    this.validateConfig()
    this.setupClients()
  }

  private validateConfig() {
    const contractAddress = process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS
    const privateKey = process.env.SERVER_PRIVATE_KEY

    if (!contractAddress) {
      throw new Error('NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS not configured')
    }

    if (!privateKey) {
      throw new Error('SERVER_PRIVATE_KEY not configured for token distribution')
    }

    if (!privateKey.startsWith('0x')) {
      throw new Error('SERVER_PRIVATE_KEY must start with 0x')
    }

    this.contractAddress = contractAddress as `0x${string}`
  }

  private setupClients() {
    // Create account from private key
    this.account = privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as `0x${string}`)

    // Create public client for reading
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })

    // Create wallet client for writing
    this.walletClient = createWalletClient({
      account: this.account,
      chain: baseSepolia,
      transport: http()
    })

    console.log(`🔐 Server wallet initialized: ${this.account.address}`)
  }

  /**
   * Distribute tokens to a single address using real blockchain transaction
   */
  async distributeTokens(
    recipientAddress: string, 
    tokenAmount: number
  ): Promise<DistributionResult> {
    try {
      console.log(`🚀 Starting real token distribution to ${recipientAddress}`)
      console.log(`💰 Amount: ${tokenAmount} BATTLE tokens`)

      // Convert tokens to wei (18 decimals)
      const amountInWei = parseEther(tokenAmount.toString())

      // Check server wallet balance first
      const serverBalance = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [this.account.address]
      })

      const serverBalanceFormatted = formatEther(serverBalance as bigint)
      console.log(`💰 Server wallet balance: ${serverBalanceFormatted} BATTLE`)

      if (serverBalance < amountInWei) {
        throw new Error(`Insufficient server balance. Have: ${serverBalanceFormatted}, Need: ${tokenAmount}`)
      }

      // Get current gas price and add buffer to avoid "underpriced" errors
      const gasPrice = await this.publicClient.getGasPrice()
      const bufferedGasPrice = gasPrice * 120n / 100n // 20% buffer
      
      console.log(`⛽ Gas price: ${formatEther(gasPrice)} ETH`)
      console.log(`⛽ Buffered gas price: ${formatEther(bufferedGasPrice)} ETH`)

      // Execute the transfer transaction
      console.log(`📡 Executing blockchain transaction...`)
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`, amountInWei],
        gasPrice: bufferedGasPrice
      })

      console.log(`📄 Transaction submitted: ${hash}`)

      // Wait for transaction confirmation
      console.log(`⏳ Waiting for transaction confirmation...`)
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000 // 60 second timeout
      })

      if (receipt.status === 'success') {
        console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`)
        console.log(`⛽ Gas used: ${receipt.gasUsed}`)

        return {
          success: true,
          transactionHash: hash,
          gasUsed: receipt.gasUsed,
          tokensDistributed: tokenAmount
        }
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status}`)
      }

    } catch (error) {
      console.error('❌ Token distribution failed:', error)
      
      // Check if this is a "replacement transaction underpriced" error
      // This often happens when a transaction succeeds but the error is reported
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during distribution'
      
      if (errorMessage.includes('replacement transaction underpriced')) {
        console.warn('⚠️ Got "replacement transaction underpriced" error, but transaction may have succeeded')
        
        // Try to verify if the transaction actually succeeded by checking balance
        try {
          const recipientBalance = await this.getRecipientBalance(recipientAddress)
          console.log(`🔍 Checking recipient balance after error: ${recipientBalance.formatted} BATTLE`)
          
          // If we can't verify, we'll assume it failed and let the retry logic handle it
          return {
            success: false,
            error: 'Transaction may have succeeded despite error. Please retry if needed.'
          }
        } catch (balanceError) {
          console.error('❌ Could not verify balance after error:', balanceError)
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Batch distribute tokens to multiple addresses
   */
  async batchDistributeTokens(
    distributions: Array<{ address: string; amount: number }>
  ): Promise<DistributionResult> {
    try {
      console.log(`🚀 Starting batch token distribution to ${distributions.length} recipients`)

      const recipients = distributions.map(d => d.address as `0x${string}`)
      const amounts = distributions.map(d => parseEther(d.amount.toString()))
      const totalTokens = distributions.reduce((sum, d) => sum + d.amount, 0)

      console.log(`💰 Total amount: ${totalTokens} BATTLE tokens`)

      // Check server wallet balance
      const serverBalance = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [this.account.address]
      })

      const serverBalanceFormatted = formatEther(serverBalance as bigint)
      console.log(`💰 Server wallet balance: ${serverBalanceFormatted} BATTLE`)

      const totalAmountInWei = parseEther(totalTokens.toString())
      if (serverBalance < totalAmountInWei) {
        throw new Error(`Insufficient server balance. Have: ${serverBalanceFormatted}, Need: ${totalTokens}`)
      }

      // Get current gas price and add buffer to avoid "underpriced" errors
      const gasPrice = await this.publicClient.getGasPrice()
      const bufferedGasPrice = gasPrice * 120n / 100n // 20% buffer
      
      console.log(`⛽ Gas price: ${formatEther(gasPrice)} ETH`)
      console.log(`⛽ Buffered gas price: ${formatEther(bufferedGasPrice)} ETH`)

      // Execute the batch distribution transaction
      console.log(`📡 Executing batch blockchain transaction...`)
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'distributeTokens',
        args: [recipients, amounts],
        gasPrice: bufferedGasPrice
      })

      console.log(`📄 Batch transaction submitted: ${hash}`)

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000
      })

      if (receipt.status === 'success') {
        console.log(`✅ Batch transaction confirmed! Block: ${receipt.blockNumber}`)
        console.log(`⛽ Gas used: ${receipt.gasUsed}`)

        return {
          success: true,
          transactionHash: hash,
          gasUsed: receipt.gasUsed,
          tokensDistributed: totalTokens
        }
      } else {
        throw new Error(`Batch transaction failed with status: ${receipt.status}`)
      }

    } catch (error) {
      console.error('❌ Batch token distribution failed:', error)
      
      // Check if this is a "replacement transaction underpriced" error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during batch distribution'
      
      if (errorMessage.includes('replacement transaction underpriced')) {
        console.warn('⚠️ Got "replacement transaction underpriced" error in batch distribution, but transaction may have succeeded')
        
        // For batch operations, it's harder to verify individual balances
        // We'll let the retry logic handle this
        return {
          success: false,
          error: 'Batch transaction may have succeeded despite error. Please retry if needed.'
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Get server wallet balance
   */
  async getServerBalance(): Promise<{ balance: bigint; formatted: string }> {
    const balance = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [this.account.address]
    })

    return {
      balance: balance as bigint,
      formatted: formatEther(balance as bigint)
    }
  }

  /**
   * Get recipient balance
   */
  async getRecipientBalance(address: string): Promise<{ balance: bigint; formatted: string }> {
    const balance = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`]
    })

    return {
      balance: balance as bigint,
      formatted: formatEther(balance as bigint)
    }
  }
}

// Singleton pattern for server service
let _serverBattleTokenService: ServerBattleTokenService | null = null

export function getServerBattleTokenService(): ServerBattleTokenService {
  if (!_serverBattleTokenService) {
    _serverBattleTokenService = new ServerBattleTokenService()
  }
  return _serverBattleTokenService
}
