import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { rateLimiter, tokenManager, streakManager, fraudDetection } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'
import { VendorCategory } from '@/types'
import * as crypto from 'crypto'
import { TokenDistributionService } from './tokenDistribution'

// Function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Mock vendors data for fallback when Supabase is not available
const MOCK_VENDORS = [
  {
    id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
    name: 'Pupusas María',
    category: VendorCategory.PUPUSAS,
    zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b'
  },
  {
    id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
    name: 'Tacos El Rey',
    category: VendorCategory.TACOS,
    zone_id: '61bace3e-ae39-4bb5-997b-1737122e8849'
  },
  {
    id: '525c09b3-dc92-409b-a11d-896bcf4d15b2',
    name: 'Café Aroma',
    category: VendorCategory.BEBIDAS,
    zone_id: '100b486d-5859-4ab1-9112-2d4bbabcba46'
  },
  {
    id: '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1',
    name: 'Pizza Napoli',
    category: VendorCategory.OTROS,
    zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b'
  },
  {
    id: 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28',
    name: 'Sushi Express',
    category: VendorCategory.OTROS,
    zone_id: '61bace3e-ae39-4bb5-997b-1737122e8849'
  }
]

// Simplified voting system - no battle IDs needed

// Function to get vendor from mock data when Supabase is not available
function getMockVendor(vendorId: string) {
  return MOCK_VENDORS.find(vendor => vendor.id === vendorId)
}

// Mock Redis functions for fallback
const mockRedis = {
  async addTokens(userFid: string, tokens: number): Promise<number> {
    console.log(`💰 Mock Redis: Adding ${tokens} tokens to user ${userFid}`)
    return 100 + tokens // Mock balance
  },
  
  async getVoteStreak(userFid: string): Promise<number> {
    console.log(`🔥 Mock Redis: Getting vote streak for user ${userFid}`)
    return Math.floor(Math.random() * 5) + 1 // Random streak 1-5
  },
  
  async incrementStreak(userFid: string): Promise<number> {
    console.log(`🔥 Mock Redis: Incrementing streak for user ${userFid}`)
    return Math.floor(Math.random() * 5) + 2 // Random streak 2-6
  },
  
  async isPhotoHashDuplicate(photoHash: string): Promise<boolean> {
    console.log(`📸 Mock Redis: Checking photo hash ${photoHash}`)
    return false // Assume not duplicate
  },
  
  async trackSuspiciousActivity(userFid: string, activity: string): Promise<void> {
    console.log(`🚨 Mock Redis: Tracking suspicious activity ${activity} for user ${userFid}`)
  }
}

export interface VoteData {
  userFid: string
  vendorId: string
  voteType: 'regular' | 'verified'
  photoUrl?: string
  gpsLocation?: { lat: number; lng: number }
  verificationConfidence?: number
}

export interface VoteResult {
  success: boolean
  voteId?: string
  tokensEarned: number
  newBalance: number
  streakBonus: number
  territoryBonus: number
  error?: string
}

export interface TokenCalculation {
  baseTokens: number
  streakBonus: number
  territoryBonus: number
  totalTokens: number
  weeklyCapRemaining: number
}

export class VotingService {
  private static supabase: SupabaseClient | null = null

  /**
   * Initialize Supabase client if not already done
   */
  private static ensureSupabaseClient() {
    if (!this.supabase) {
      console.log('🔧 Initializing Supabase client...')
      this.supabase = getSupabaseClient()
      console.log('✅ Supabase client initialized')
    } else {
      console.log('✅ Supabase client already initialized')
    }
  }

  /**
   * Reset Supabase client (useful for debugging connection issues)
   */
  private static resetSupabaseClient() {
    console.log('🔄 Resetting Supabase client...')
    this.supabase = null
    this.ensureSupabaseClient()
    console.log('✅ Supabase client reset complete')
  }

  /**
   * Safe Redis operation with fallback to mock
   */
  private static async safeRedisOperation<T>(
    operation: () => Promise<T>,
    fallback: () => T | Promise<T>
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.warn('⚠️ Redis not available, using mock data')
      return await fallback()
    }
  }

  /**
   * Register a vote for a vendor
   */
  static async registerVote(voteData: VoteData): Promise<VoteResult> {
    try {
      const { userFid, vendorId, voteType, photoUrl, gpsLocation, verificationConfidence } = voteData
      
      console.log('🗳️ Starting vote registration for:', {
        userFid,
        vendorId,
        voteType,
        hasPhoto: !!photoUrl
      })

      // 1. Validate vendor exists first - try Supabase, fallback to mock data
      let vendor = null
      let vendorError = null

      try {
        this.ensureSupabaseClient()
        const { data, error } = await this.supabase!
          .from('vendors')
          .select('id, name')
          .eq('id', vendorId)
          .single()

        vendor = data
        vendorError = error
        
        if (vendor) {
          console.log('✅ Found vendor in Supabase:', vendor.name)
        } else if (error) {
          console.log('⚠️ Supabase error:', error.message)
        }
      } catch (error) {
        console.warn('⚠️ Supabase connection failed, trying to reset client...')
        // Try to reset the client and try again
        try {
          this.resetSupabaseClient()
          const { data, error: retryError } = await this.supabase!
            .from('vendors')
            .select('id, name')
            .eq('id', vendorId)
            .single()

          vendor = data
          vendorError = retryError
          
          if (vendor) {
            console.log('✅ Found vendor in Supabase after reset:', vendor.name)
          } else if (retryError) {
            console.log('⚠️ Supabase still failing after reset:', retryError.message)
          }
        } catch (retryError) {
          console.warn('⚠️ Supabase still not available after reset, using mock data')
          vendorError = retryError
        }
      }

      // If Supabase failed or vendor not found, try mock data
      if (vendorError || !vendor) {
        console.log('🔍 Trying to find vendor in mock data:', vendorId)
        vendor = getMockVendor(vendorId)
        
        if (!vendor) {
          console.error('❌ Vendor not found in Supabase or mock data:', vendorId)
          console.log('Available mock vendors:', MOCK_VENDORS.map(v => v.id))
          return {
            success: false,
            tokensEarned: 0,
            newBalance: 0,
            streakBonus: 0,
            territoryBonus: 0,
            error: 'Vendor not found'
          }
        }
        console.log('✅ Using mock vendor:', vendor.name)
      }

      // 2. Anti-fraud checks for verified votes
      if (voteType === 'verified' && photoUrl) {
        const photoHash = await this.generatePhotoHash(photoUrl)
        const isDuplicate = await this.safeRedisOperation(
          () => fraudDetection.isPhotoHashDuplicate(photoHash),
          () => mockRedis.isPhotoHashDuplicate(photoHash)
        )
        
        if (isDuplicate) {
          await this.safeRedisOperation(
            () => fraudDetection.trackSuspiciousActivity(userFid, 'duplicate_photo'),
            () => mockRedis.trackSuspiciousActivity(userFid, 'duplicate_photo')
          )
          return {
            success: false,
            tokensEarned: 0,
            newBalance: 0,
            streakBonus: 0,
            territoryBonus: 0,
            error: 'Photo has been used before. Please take a new photo.'
          }
        }
      }

      // 3. Calculate tokens
      const tokenCalculation = await this.calculateTokens(userFid, vendorId, voteType)

      // REMOVED WEEKLY CAP CHECK: Allow unlimited token earning for testing
      // 4. Check weekly token cap
      // if (tokenCalculation.totalTokens > tokenCalculation.weeklyCapRemaining) {
      //   return {
      //     success: false,
      //     tokensEarned: 0,
      //     newBalance: 0,
      //     streakBonus: 0,
      //     territoryBonus: 0,
      //     error: 'Weekly token earning limit reached'
      //   }
      // }

      // 5. Check daily vote limit for this vendor and determine vote number
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

      let todayVotesCount = 0
      try {
        const { data: todayVotes, error: checkError } = await this.supabase!
          .from('votes')
          .select('id, vote_date, token_reward')
          .eq('voter_fid', userFid)
          .eq('vendor_id', vendorId)
          .eq('vote_date', today)

        todayVotesCount = todayVotes ? todayVotes.length : 0

        if (todayVotesCount >= 3) {
          console.log('⚠️ User has already voted 3 times for this vendor today')
          return {
            success: false,
            tokensEarned: 0,
            newBalance: 0,
            streakBonus: 0,
            territoryBonus: 0,
            error: 'You have already voted 3 times for this vendor today. Come back tomorrow to vote again!'
          }
        }
        

        
        if (checkError) {
          console.error('Error checking daily vote count:', checkError)
          // Continue with vote insertion if we can't check
        }
      } catch (error) {
        console.warn('⚠️ Could not check daily vote count, proceeding with insertion')
      }

      // 6. Create vote record in database (only if Supabase is available)
      
      console.log(`🗳️ Vote #${todayVotesCount + 1} for user ${userFid}, vendor ${vendorId}`)
      
      // Create vote record without ID - let Supabase generate it automatically
      const voteRecord: any = {
        voter_fid: parseInt(userFid), // Ensure it's a number
        vendor_id: vendorId,
        vote_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        is_verified: voteType === 'verified',
        token_reward: tokenCalculation.totalTokens,
        multiplier: 1,
        reason: `${voteType === 'verified' ? 'Verified' : 'Regular'} vote for vendor`
      }

      // Try to insert vote in Supabase and get the generated ID
      let actualVoteId: string | undefined
      try {
        const { data: insertedVote, error: voteError } = await this.supabase!
          .from('votes')
          .insert(voteRecord)
          .select('id')
          .single()

        if (voteError) {
          console.error('Error creating vote in Supabase:', voteError)
          
          // Check if it's a foreign key violation
          if (voteError.message && voteError.message.includes('foreign key')) {
            return {
              success: false,
              tokensEarned: 0,
              newBalance: 0,
              streakBonus: 0,
              territoryBonus: 0,
              error: 'Vendor not found or invalid user. Please try again.'
            }
          }
          
          // Generic database error
          return {
            success: false,
            tokensEarned: 0,
            newBalance: 0,
            streakBonus: 0,
            territoryBonus: 0,
            error: 'Database error occurred. Please try again.'
          }
        } else {
          actualVoteId = insertedVote?.id
          console.log('✅ Vote recorded in Supabase with ID:', actualVoteId)
        }
      } catch (error) {
        console.error('❌ Supabase not available for vote recording')
        // Fail the vote if Supabase is not available
        return {
          success: false,
          tokensEarned: 0,
          newBalance: 0,
          streakBonus: 0,
          territoryBonus: 0,
          error: 'Database not available. Please try again later.'
        }
      }

      // 7. Create attestation if verified vote (only if Supabase is available)
      let attestationId: string | null = null
      if (voteType === 'verified' && photoUrl) {
        try {
          const { data: attestationData, error: attestationError } = await this.supabase!
            .from('attestations')
            .insert({
              user_fid: parseInt(userFid), // Ensure it's a number
              vendor_id: vendorId,
              vote_id: actualVoteId,
              photo_hash: await this.generatePhotoHash(photoUrl),
              photo_url: photoUrl,
              gps_location: gpsLocation ? `(${gpsLocation.lat},${gpsLocation.lng})` : null,
              verification_confidence: verificationConfidence || 0.8,
              status: 'pending',
              processing_time: 0,
              metadata: {
                device: 'web',
                timestamp: new Date().toISOString(),
                location_accuracy: 'medium'
              }
            })
            .select('id')
            .single()

          if (attestationError) {
            console.error('Error creating attestation:', attestationError)
          } else {
            attestationId = attestationData?.id
            console.log('✅ Attestation created with ID:', attestationId)
          }
        } catch (error) {
          console.warn('⚠️ Supabase not available for attestation, continuing with mock data')
        }
      }

      // 8. Update user tokens in Redis and database (ONLY if vote was successful)
      const newBalance = await this.safeRedisOperation(
        () => tokenManager.addTokens(userFid, tokenCalculation.totalTokens),
        () => mockRedis.addTokens(userFid, tokenCalculation.totalTokens)
      )
      
      // Also update database if available
      try {
        await this.supabase!
          .from('users')
          .update({ battle_tokens: newBalance })
          .eq('fid', parseInt(userFid))
      } catch (error) {
        console.warn('⚠️ Supabase not available for user update, continuing with Redis only')
      }

      // 8.5. Distribute BATTLE tokens for voting reward
      if (actualVoteId) {
        try {
          console.log(`🎁 Distributing ${tokenCalculation.totalTokens} BATTLE tokens for vote ${actualVoteId}`)
          const distributionResult = await TokenDistributionService.distributeVotingReward(
            userFid,
            tokenCalculation.totalTokens,
            actualVoteId,
            vendorId
          )
          
          if (distributionResult.success) {
            console.log(`✅ BATTLE tokens distributed successfully: ${distributionResult.tokensDistributed} tokens`)
            if (distributionResult.transactionHash) {
              console.log(`🔗 Transaction hash: ${distributionResult.transactionHash}`)
            }
          } else {
            console.warn(`⚠️ BATTLE token distribution failed: ${distributionResult.error}`)
          }
        } catch (error) {
          console.error('❌ Error distributing BATTLE tokens:', error)
          // Don't fail the vote if token distribution fails
        }
      }

      // 9. Update vote streak (ONLY if vote was successful)
      const newStreak = await this.safeRedisOperation(
        () => streakManager.incrementStreak(userFid),
        () => mockRedis.incrementStreak(userFid)
      )
      
      // Also update vote streak in database if available
      try {
        await this.supabase!
          .from('users')
          .update({ vote_streak: newStreak })
          .eq('fid', parseInt(userFid))
      } catch (error) {
        console.warn('⚠️ Supabase not available for streak update, continuing with Redis only')
      }

      // 10. Update vendor stats (ONLY if vote was successful)
      await this.updateVendorStats(vendorId, voteType === 'verified')

      return {
        success: true,
        voteId: actualVoteId,
        tokensEarned: tokenCalculation.totalTokens,
        newBalance,
        streakBonus: tokenCalculation.streakBonus,
        territoryBonus: tokenCalculation.territoryBonus
      }

    } catch (error) {
      console.error('Error in registerVote:', error)
      return {
        success: false,
        tokensEarned: 0,
        newBalance: 0,
        streakBonus: 0,
        territoryBonus: 0,
        error: 'Internal server error'
      }
    }
  }

  /**
   * Calculate tokens for a vote according to PRD rules
   * - First vote per vendor per day: 10 BATTLE (or 30 if verified)
   * - Subsequent votes same vendor: 5 BATTLE (or 15 if verified)
   * - Voting streak bonus: +1 BATTLE per consecutive day (max +10)
   */
  static async calculateTokens(userFid: string, vendorId: string, voteType: 'regular' | 'verified'): Promise<TokenCalculation> {
    // Check if this is the first vote of the day for this vendor
    const isFirstVoteOfDay = await this.isFirstVoteOfDay(userFid, vendorId)
    
    // Base tokens according to PRD
    let baseTokens: number
    if (voteType === 'verified') {
      baseTokens = isFirstVoteOfDay ? 30 : 15 // 3x multiplier for verified votes
    } else {
      baseTokens = isFirstVoteOfDay ? 10 : 5 // Regular votes
    }

    // Streak bonus: +1 BATTLE per consecutive day (max +10)
    const currentStreak = await this.safeRedisOperation(
      () => streakManager.getVoteStreak(userFid),
      () => mockRedis.getVoteStreak(userFid)
    )
    const streakBonus = Math.min(currentStreak, 10) // Max +10 from streak

    // Territory bonus (simplified for now - will be implemented with battle system)
    const territoryBonus = 0

    const totalTokens = baseTokens + streakBonus + territoryBonus

    // Weekly cap according to PRD: Max 200 BATTLE per user per week from voting
    const weeklyTokensEarned = await this.getWeeklyTokensEarned(userFid)
    const weeklyCapRemaining = Math.max(0, 200 - weeklyTokensEarned)

    return {
      baseTokens,
      streakBonus,
      territoryBonus,
      totalTokens: Math.min(totalTokens, weeklyCapRemaining), // Respect weekly cap
      weeklyCapRemaining
    }
  }

  /**
   * Get user's vote history
   */
  static async getUserVoteHistory(userFid: string, limit: number = 50): Promise<any[]> {
    try {
      this.ensureSupabaseClient()
      const { data, error } = await this.supabase!
        .from('votes')
        .select(`
          *,
          vendors (
            id,
            name,
            category,
            image_url
          )
        `)
        .eq('voter_fid', userFid)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching vote history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.warn('⚠️ Supabase not available for vote history, returning empty array')
      return []
    }
  }

  /**
   * Get vendor's vote statistics
   */
  static async getVendorVoteStats(vendorId: string): Promise<any> {
    try {
      this.ensureSupabaseClient()
      const { data, error } = await this.supabase!
        .from('votes')
        .select(`
          *,
          users (
            fid,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vendor stats:', error)
        return null
      }

      const totalVotes = data?.length || 0
      const verifiedVotes = data?.filter(vote => vote.is_verified).length || 0
      const totalTokens = data?.reduce((sum: number, vote: any) => sum + (vote.token_reward || 0), 0) || 0

      return {
        totalVotes,
        verifiedVotes,
        totalTokens,
        verificationRate: totalVotes > 0 ? (verifiedVotes / totalVotes) * 100 : 0,
        votes: data || [] // Include the actual votes with user data
      }
    } catch (error) {
      console.warn('⚠️ Supabase not available for vendor stats, returning mock data')
      // Return mock stats for the vendor
      const mockVendor = getMockVendor(vendorId)
      if (mockVendor) {
        return {
          totalVotes: Math.floor(Math.random() * 100) + 50,
          verifiedVotes: Math.floor(Math.random() * 50) + 20,
          totalTokens: Math.floor(Math.random() * 1000) + 500,
          verificationRate: Math.floor(Math.random() * 30) + 40,
          votes: []
        }
      }
      return null
    }
  }

  /**
   * Check if this is the first vote of the day for user-vendor pair
   */
  private static async isFirstVoteOfDay(userFid: string, vendorId: string): Promise<boolean> {
    try {
      this.ensureSupabaseClient()
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await this.supabase!
        .from('votes')
        .select('id')
        .eq('voter_fid', userFid)
        .eq('vendor_id', vendorId)
        .eq('vote_date', today)
        .limit(1)

      if (error) {
        console.error('Error checking first vote of day:', error)
        return true // Assume first vote if error
      }

      return !data || data.length === 0
    } catch (error) {
      console.warn('⚠️ Supabase not available for first vote check, assuming first vote')
      return true // Assume first vote if Supabase is not available
    }
  }

  /**
   * Get weekly tokens earned by user
   */
  private static async getWeeklyTokensEarned(userFid: string): Promise<number> {
    try {
      this.ensureSupabaseClient()
      const weekStart = this.getWeekStart()
      
      const { data, error } = await this.supabase!
        .from('votes')
        .select('token_reward')
        .eq('voter_fid', userFid)
        .gte('created_at', weekStart)

      if (error) {
        console.error('Error fetching weekly tokens:', error)
        return 0
      }

      return data?.reduce((sum: number, vote: any) => sum + (vote.token_reward || 0), 0) || 0
    } catch (error) {
      console.warn('⚠️ Supabase not available for weekly tokens, returning 0')
      return 0
    }
  }

  /**
   * Update vendor statistics in the vendors table
   */
  private static async updateVendorStats(vendorId: string, isVerified: boolean): Promise<void> {
    try {
      this.ensureSupabaseClient()
      
      // Get current vendor stats
      const { data: currentVendor, error: fetchError } = await this.supabase!
        .from('vendors')
        .select('total_votes, verified_votes')
        .eq('id', vendorId)
        .single()

      if (fetchError) {
        console.error('Error fetching current vendor stats:', fetchError)
        // Try to update with default values if we can't fetch current stats
        const { error: updateError } = await this.supabase!
          .from('vendors')
          .update({
            total_votes: 1,
            verified_votes: isVerified ? 1 : 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', vendorId)

        if (updateError) {
          console.error('Error updating vendor stats with defaults:', updateError)
        } else {
          console.log(`✅ Updated vendor ${vendorId} stats with defaults: total_votes=1, verified_votes=${isVerified ? 1 : 0}`)
        }
        return
      }

      // Calculate new stats
      const newTotalVotes = (currentVendor.total_votes || 0) + 1
      const newVerifiedVotes = (currentVendor.verified_votes || 0) + (isVerified ? 1 : 0)

      // Update vendor stats
      const { error: updateError } = await this.supabase!
        .from('vendors')
        .update({
          total_votes: newTotalVotes,
          verified_votes: newVerifiedVotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (updateError) {
        console.error('Error updating vendor stats:', updateError)
      } else {
        console.log(`✅ Updated vendor ${vendorId} stats: total_votes=${newTotalVotes}, verified_votes=${newVerifiedVotes}`)
      }
    } catch (error) {
      console.error('Error updating vendor stats:', error)
    }
  }

  /**
   * Generate photo hash for anti-fraud
   */
  private static async generatePhotoHash(photoUrl: string): Promise<string> {
    // Simple hash for now - in production, use proper image hashing
    return Buffer.from(photoUrl).toString('base64').substring(0, 32)
  }

  /**
   * Get week start date
   */
  private static getWeekStart(): string {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }
} 