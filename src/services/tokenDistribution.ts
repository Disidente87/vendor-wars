import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getBattleTokenService } from './battleToken'
import { getServerBattleTokenService } from './serverBattleToken'
import { parseEther } from 'viem'
import { TokenError } from '@/types/contracts'

// Function to get Supabase client
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export interface PendingTokenDistribution {
  id: string
  userFid: string
  walletAddress?: string
  tokens: number
  voteId: string
  vendorId: string
  createdAt: string
  distributedAt?: string
  transactionHash?: string
  status: 'pending' | 'distributed' | 'failed'
  errorMessage?: string
}

export interface TokenDistributionResult {
  success: boolean
  tokensDistributed: number
  transactionHash?: string
  error?: string
}

export class TokenDistributionService {
  private static supabase: SupabaseClient | null = null
  private static battleTokenService: ReturnType<typeof getBattleTokenService> | null = null

  private static getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = getSupabaseClient()
    }
    return this.supabase
  }

  private static getBattleTokenService() {
    if (!this.battleTokenService) {
      this.battleTokenService = getBattleTokenService()
    }
    return this.battleTokenService
  }

  /**
   * Distribute BATTLE tokens to a user after voting
   * If user has wallet connected, distribute immediately
   * If not, store pending distribution for later
   */
  static async distributeVotingReward(
    userFid: string,
    tokens: number,
    voteId: string,
    vendorId: string
  ): Promise<TokenDistributionResult> {
    try {
      console.log(`🎁 Distributing ${tokens} BATTLE tokens to user ${userFid} for vote ${voteId}`)

      // 1. Get user's wallet address from database
      const { data: user, error: userError } = await this.getSupabaseClient()
        .from('users')
        .select('fid, wallet_address')
        .eq('fid', parseInt(userFid))
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'User not found'
        }
      }

      // 2. Check if user has wallet connected
      if (user.wallet_address) {
        // Clean wallet address - handle legacy formats (array, JSON string) and new string format
        let cleanWalletAddress: string
        
        if (Array.isArray(user.wallet_address)) {
          // Legacy array format
          cleanWalletAddress = user.wallet_address[0]
        } else if (typeof user.wallet_address === 'string') {
          // Check if it's a JSON string (legacy) or direct string (new format)
          try {
            const parsed = JSON.parse(user.wallet_address)
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Legacy JSON string format
              cleanWalletAddress = parsed[0]
            } else {
              // Direct string format (new)
              cleanWalletAddress = user.wallet_address
            }
          } catch {
            // Direct string format (new)
            cleanWalletAddress = user.wallet_address
          }
        } else {
          cleanWalletAddress = user.wallet_address
        }
        
        console.log(`✅ User ${userFid} has wallet connected: ${cleanWalletAddress}`)
        return await this.distributeToWallet(cleanWalletAddress, tokens, userFid, voteId, vendorId)
      } else {
        console.log(`⏳ User ${userFid} has no wallet connected, storing pending distribution`)
        return await this.storePendingDistribution(userFid, tokens, voteId, vendorId)
      }

    } catch (error) {
      console.error('Error in distributeVotingReward:', error)
      return {
        success: false,
        tokensDistributed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Distribute tokens directly to user's wallet
   */
  private static async distributeToWallet(
    walletAddress: string,
    tokens: number,
    userFid: string,
    voteId: string,
    vendorId: string
  ): Promise<TokenDistributionResult> {
    try {
      // Convert tokens to wei (assuming tokens are in whole units)
      const tokensInWei = parseEther(tokens.toString())

      // Update the vote record with distribution info
      const { error: updateError } = await this.getSupabaseClient()
        .from('votes')
        .update({
          distribution_status: 'pending'
        })
        .eq('id', voteId)

      if (updateError) {
        console.error('Error updating vote record:', updateError)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'Failed to update vote record'
        }
      }

      // Execute REAL smart contract distribution
      const serverTokenService = getServerBattleTokenService()
      
      console.log(`🚀 Executing REAL blockchain distribution of ${tokens} BATTLE tokens to ${walletAddress}`)
      
      // Check recipient balance before distribution
      const beforeBalance = await serverTokenService.getRecipientBalance(walletAddress)
      console.log(`💰 Recipient balance before: ${beforeBalance.formatted} BATTLE`)
      
      // Execute real blockchain transaction
      const distributionResult = await serverTokenService.distributeTokens(walletAddress, tokens)
      
      if (!distributionResult.success) {
        throw new Error(distributionResult.error || 'Token distribution failed')
      }
      
      const transactionHash = distributionResult.transactionHash!
      console.log(`✅ REAL distribution successful!`)
      console.log(`📄 Transaction hash: ${transactionHash}`)
      console.log(`⛽ Gas used: ${distributionResult.gasUsed}`)
      
      // Verify the distribution by checking balance after
      const afterBalance = await serverTokenService.getRecipientBalance(walletAddress)
      console.log(`💰 Recipient balance after: ${afterBalance.formatted} BATTLE`)
      console.log(`📈 Balance increased by: ${Number(afterBalance.formatted) - Number(beforeBalance.formatted)} BATTLE`)
      await this.getSupabaseClient()
        .from('votes')
        .update({
          distribution_status: 'distributed',
          distributed_at: new Date().toISOString(),
          transaction_hash: transactionHash
        })
        .eq('id', voteId)

      return {
        success: true,
        tokensDistributed: tokens,
        transactionHash
      }

    } catch (error) {
      console.error('❌ Error distributing tokens to wallet:', error)
      
      // Update vote record with error
      await this.getSupabaseClient()
        .from('votes')
        .update({
          distribution_status: 'failed',
          distribution_error: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', voteId)

      return {
        success: false,
        tokensDistributed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Store pending distribution for users without wallet
   */
  private static async storePendingDistribution(
    userFid: string,
    tokens: number,
    voteId: string,
    vendorId: string
  ): Promise<TokenDistributionResult> {
    try {
      // Update the vote record to mark as pending
      const { error } = await this.getSupabaseClient()
        .from('votes')
        .update({
          distribution_status: 'pending'
        })
        .eq('id', voteId)

      if (error) {
        console.error('Error storing pending distribution:', error)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'Failed to store pending distribution'
        }
      }

      console.log(`✅ Pending distribution stored for vote: ${voteId}`)
      return {
        success: true,
        tokensDistributed: 0, // Not distributed yet
        error: 'Tokens stored for later distribution'
      }

    } catch (error) {
      console.error('Error storing pending distribution:', error)
      return {
        success: false,
        tokensDistributed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process pending distributions when user connects wallet
   */
  static async processPendingDistributions(userFid: string, walletAddress: string): Promise<TokenDistributionResult> {
    try {
      console.log(`🔄 Processing pending distributions for user ${userFid} with wallet ${walletAddress}`)

      // Get all pending distributions for this user
      const { data: pendingVotes, error } = await this.getSupabaseClient()
        .from('votes')
        .select('*')
        .eq('voter_fid', parseInt(userFid))
        .eq('distribution_status', 'pending')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching pending distributions:', error)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'Failed to fetch pending distributions'
        }
      }

      if (!pendingVotes || pendingVotes.length === 0) {
        console.log(`ℹ️ No pending distributions found for user ${userFid}`)
        return {
          success: true,
          tokensDistributed: 0
        }
      }

      console.log(`📦 Found ${pendingVotes.length} pending distributions`)

      let totalDistributed = 0
      let failedCount = 0

      // Process each pending distribution
      for (const vote of pendingVotes) {
        try {
          // Distribute tokens
          const result = await this.distributeToWallet(
            walletAddress,
            vote.token_reward,
            userFid,
            vote.id,
            vote.vendor_id
          )

          if (result.success) {
            totalDistributed += result.tokensDistributed
            console.log(`✅ Distributed ${vote.token_reward} tokens for vote ${vote.id}`)
          } else {
            failedCount++
            console.error(`❌ Failed to distribute tokens for vote ${vote.id}:`, result.error)
          }

        } catch (error) {
          failedCount++
          console.error(`❌ Error processing distribution ${vote.id}:`, error)
        }
      }

      console.log(`🎉 Processed ${pendingVotes.length} distributions: ${totalDistributed} tokens distributed, ${failedCount} failed`)

      return {
        success: true,
        tokensDistributed: totalDistributed
      }

    } catch (error) {
      console.error('Error processing pending distributions:', error)
      return {
        success: false,
        tokensDistributed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get user's pending token distributions
   */
  static async getPendingDistributions(userFid: string): Promise<PendingTokenDistribution[]> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('votes')
        .select(`
          *,
          users!inner(wallet_address)
        `)
        .eq('voter_fid', parseInt(userFid))
        .eq('distribution_status', 'pending')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching pending distributions:', error)
        return []
      }

      // Transform votes to PendingTokenDistribution format
      return (data || []).map(vote => ({
        id: vote.id,
        userFid: vote.voter_fid.toString(),
        walletAddress: vote.users?.wallet_address,
        tokens: vote.token_reward,
        voteId: vote.id,
        vendorId: vote.vendor_id,
        createdAt: vote.created_at,
        distributedAt: vote.distributed_at,
        transactionHash: vote.transaction_hash,
        status: vote.distribution_status as 'pending' | 'distributed' | 'failed',
        errorMessage: vote.distribution_error
      }))
    } catch (error) {
      console.error('Error getting pending distributions:', error)
      return []
    }
  }

  /**
   * Get user's total distributed tokens
   */
  static async getTotalDistributedTokens(userFid: string): Promise<number> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('votes')
        .select('token_reward')
        .eq('voter_fid', parseInt(userFid))
        .eq('distribution_status', 'distributed')

      if (error) {
        console.error('Error fetching distributed tokens:', error)
        return 0
      }

      return data?.reduce((total, vote) => total + vote.token_reward, 0) || 0
    } catch (error) {
      console.error('Error getting total distributed tokens:', error)
      return 0
    }
  }

  /**
   * Update user's wallet address and process pending distributions
   */
  static async updateUserWallet(userFid: string, walletAddress: string): Promise<TokenDistributionResult> {
    try {
      console.log(`🔗 Updating wallet address for user ${userFid}: ${walletAddress}`)

      // Update user's wallet address (store as string, not array)
      const { error: updateError } = await this.getSupabaseClient()
        .from('users')
        .update({ wallet_address: walletAddress })
        .eq('fid', parseInt(userFid))

      if (updateError) {
        console.error('Error updating user wallet:', updateError)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'Failed to update wallet address'
        }
      }

      // Process any pending distributions
      return await this.processPendingDistributions(userFid, walletAddress)

    } catch (error) {
      console.error('Error updating user wallet:', error)
      return {
        success: false,
        tokensDistributed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
