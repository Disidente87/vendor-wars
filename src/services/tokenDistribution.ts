import { createClient } from '@supabase/supabase-js'
import { getBattleTokenService } from './battleToken'
import { parseEther } from 'viem'

// Function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
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
  private static supabase = getSupabaseClient()
  private static battleTokenService = getBattleTokenService()

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
      const { data: user, error: userError } = await this.supabase
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
        console.log(`✅ User ${userFid} has wallet connected: ${user.wallet_address}`)
        return await this.distributeToWallet(user.wallet_address, tokens, userFid, voteId, vendorId)
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

      // Create distribution record first
      const { data: distribution, error: insertError } = await this.supabase
        .from('token_distributions')
        .insert({
          user_fid: parseInt(userFid),
          wallet_address: walletAddress,
          tokens: tokens,
          vote_id: voteId,
          vendor_id: vendorId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Error creating distribution record:', insertError)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'Failed to create distribution record'
        }
      }

      // TODO: Call smart contract to distribute tokens
      // For now, we'll simulate the distribution
      console.log(`🚀 Simulating distribution of ${tokens} BATTLE to ${walletAddress}`)
      
      // Update distribution record as successful
      await this.supabase
        .from('token_distributions')
        .update({
          status: 'distributed',
          distributed_at: new Date().toISOString(),
          transaction_hash: `simulated_${Date.now()}`
        })
        .eq('id', distribution.id)

      return {
        success: true,
        tokensDistributed: tokens,
        transactionHash: `simulated_${Date.now()}`
      }

    } catch (error) {
      console.error('Error distributing to wallet:', error)
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
      const { data: distribution, error } = await this.supabase
        .from('token_distributions')
        .insert({
          user_fid: parseInt(userFid),
          tokens: tokens,
          vote_id: voteId,
          vendor_id: vendorId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error storing pending distribution:', error)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'Failed to store pending distribution'
        }
      }

      console.log(`✅ Pending distribution stored with ID: ${distribution.id}`)
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
      const { data: pendingDistributions, error } = await this.supabase
        .from('token_distributions')
        .select('*')
        .eq('user_fid', parseInt(userFid))
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching pending distributions:', error)
        return {
          success: false,
          tokensDistributed: 0,
          error: 'Failed to fetch pending distributions'
        }
      }

      if (!pendingDistributions || pendingDistributions.length === 0) {
        console.log(`ℹ️ No pending distributions found for user ${userFid}`)
        return {
          success: true,
          tokensDistributed: 0
        }
      }

      console.log(`📦 Found ${pendingDistributions.length} pending distributions`)

      let totalDistributed = 0
      let failedCount = 0

      // Process each pending distribution
      for (const distribution of pendingDistributions) {
        try {
          // Update wallet address
          await this.supabase
            .from('token_distributions')
            .update({ wallet_address: walletAddress })
            .eq('id', distribution.id)

          // Distribute tokens
          const result = await this.distributeToWallet(
            walletAddress,
            distribution.tokens,
            userFid,
            distribution.vote_id,
            distribution.vendor_id
          )

          if (result.success) {
            totalDistributed += result.tokensDistributed
            console.log(`✅ Distributed ${distribution.tokens} tokens for vote ${distribution.vote_id}`)
          } else {
            failedCount++
            console.error(`❌ Failed to distribute tokens for vote ${distribution.vote_id}:`, result.error)
          }

        } catch (error) {
          failedCount++
          console.error(`❌ Error processing distribution ${distribution.id}:`, error)
        }
      }

      console.log(`🎉 Processed ${pendingDistributions.length} distributions: ${totalDistributed} tokens distributed, ${failedCount} failed`)

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
      const { data, error } = await this.supabase
        .from('token_distributions')
        .select('*')
        .eq('user_fid', parseInt(userFid))
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching pending distributions:', error)
        return []
      }

      return data || []
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
      const { data, error } = await this.supabase
        .from('token_distributions')
        .select('tokens')
        .eq('user_fid', parseInt(userFid))
        .eq('status', 'distributed')

      if (error) {
        console.error('Error fetching distributed tokens:', error)
        return 0
      }

      return data?.reduce((total, record) => total + record.tokens, 0) || 0
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

      // Update user's wallet address
      const { error: updateError } = await this.supabase
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
