import { supabase } from '@/lib/supabase'
import { rateLimiter, tokenManager, streakManager, fraudDetection } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'

// Map of vendor IDs to their battle IDs (created by the script)
const VENDOR_BATTLE_MAP: Record<string, string> = {
  '772cdbda-2cbb-4c67-a73a-3656bf02a4c1': '034ce452-3409-4fa2-86ae-40f4293b0c60', // Pupusas María
  '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0': '14e8042f-46a5-4174-837b-be35f01486e6', // Tacos El Rey
  '525c09b3-dc92-409b-a11d-896bcf4d15b2': '31538f18-f74a-4783-b1b6-d26dfdaa920b', // Café Aroma
  '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1': '4f87c3c6-0d38-4e84-afc1-60b52b363bab', // Pizza Napoli
  'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28': '006703c7-379c-41ee-95f2-d2a56d44f332'  // Sushi Express
}

// Function to get battle ID for a vendor
function getVendorBattleId(vendorId: string): string {
  return VENDOR_BATTLE_MAP[vendorId] || '216b4979-c7e4-44db-a002-98860913639c' // fallback to existing battle
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
  /**
   * Register a vote for a vendor
   */
  static async registerVote(voteData: VoteData): Promise<VoteResult> {
    try {
      const { userFid, vendorId, voteType, photoUrl, gpsLocation, verificationConfidence } = voteData

      // 2. Anti-fraud checks for verified votes
      if (voteType === 'verified' && photoUrl) {
        const photoHash = await this.generatePhotoHash(photoUrl)
        const isDuplicate = await fraudDetection.isPhotoHashDuplicate(photoHash)
        
        if (isDuplicate) {
          await fraudDetection.trackSuspiciousActivity(userFid, 'duplicate_photo')
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

      // 5. Create vote record in database
      const voteId = uuidv4()
      
      // Get battle ID for this vendor
      const battleId = getVendorBattleId(vendorId)
      
      // Always include battle_id since it's NOT NULL
      const voteRecord: any = {
        id: voteId,
        voter_fid: userFid,
        vendor_id: vendorId,
        battle_id: battleId,
        is_verified: voteType === 'verified',
        token_reward: tokenCalculation.totalTokens,
        multiplier: 1,
        reason: `${voteType === 'verified' ? 'Verified' : 'Regular'} vote for vendor`,
        attestation_id: null, // Will be set if verified vote
        created_at: new Date().toISOString()
      }

      // Insert the vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert(voteRecord)

      if (voteError) {
        console.error('Error creating vote:', voteError)
        return {
          success: false,
          tokensEarned: 0,
          newBalance: 0,
          streakBonus: 0,
          territoryBonus: 0,
          error: 'Failed to register vote'
        }
      }

      // 6. Create attestation if verified vote
      let attestationId: string | null = null
      if (voteType === 'verified' && photoUrl) {
        attestationId = uuidv4()
        await supabase
          .from('attestations')
          .insert({
            id: attestationId,
            user_fid: userFid,
            vendor_id: vendorId,
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
            },
            created_at: new Date().toISOString()
          })

        // Update vote with attestation ID
        await supabase
          .from('votes')
          .update({ attestation_id: attestationId })
          .eq('id', voteId)
      }

      // 8. Update user tokens in Redis and database
      const newBalance = await tokenManager.addTokens(userFid, tokenCalculation.totalTokens)
      
      // Also update database
      await supabase
        .from('users')
        .update({ battle_tokens: newBalance })
        .eq('fid', userFid)

      // 9. Update vote streak
      const newStreak = await streakManager.incrementStreak(userFid)
      
      // Also update vote streak in database
      await supabase
        .from('users')
        .update({ vote_streak: newStreak })
        .eq('fid', userFid)

      // 10. Update vendor stats (this will be batched later)
      await this.updateVendorStats(vendorId, voteType === 'verified')

      return {
        success: true,
        voteId,
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
   */
  static async calculateTokens(userFid: string, vendorId: string, voteType: 'regular' | 'verified'): Promise<TokenCalculation> {
    // Base tokens
    const baseTokens = voteType === 'verified' ? 30 : 10

    // Check if this is the first vote of the day for this vendor
    const isFirstVoteOfDay = await this.isFirstVoteOfDay(userFid, vendorId)
    const actualBaseTokens = isFirstVoteOfDay ? baseTokens : Math.floor(baseTokens / 2)

    // Streak bonus
    const currentStreak = await streakManager.getVoteStreak(userFid)
    const streakBonus = Math.min(currentStreak, 10) // Max +10 from streak

    // Territory bonus (simplified for now)
    const territoryBonus = 0 // Will be calculated in territory service

    const totalTokens = actualBaseTokens + streakBonus + territoryBonus

    // REMOVED WEEKLY CAP: Allow unlimited token earning for testing
    const weeklyCapRemaining = 999999 // Effectively unlimited

    return {
      baseTokens: actualBaseTokens,
      streakBonus,
      territoryBonus,
      totalTokens, // No longer capped by weekly limit
      weeklyCapRemaining
    }
  }

  /**
   * Get user's vote history
   */
  static async getUserVoteHistory(userFid: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        *,
        vendors!inner (
          id,
          name,
          category,
          image_url
        ),
        zones!inner (
          id,
          name
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
  }

  /**
   * Get vendor's vote statistics
   */
  static async getVendorVoteStats(vendorId: string): Promise<any> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('vendor_id', vendorId)

    if (error) {
      console.error('Error fetching vendor stats:', error)
      return null
    }

    const totalVotes = data?.length || 0
    const verifiedVotes = data?.filter(vote => vote.is_verified).length || 0
    const totalTokens = data?.reduce((sum, vote) => sum + (vote.token_reward || 0), 0) || 0

    return {
      totalVotes,
      verifiedVotes,
      totalTokens,
      verificationRate: totalVotes > 0 ? (verifiedVotes / totalVotes) * 100 : 0
    }
  }

  /**
   * Check if this is the first vote of the day for user-vendor pair
   */
  private static async isFirstVoteOfDay(userFid: string, vendorId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', userFid)
      .eq('vendor_id', vendorId)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`)
      .limit(1)

    if (error) {
      console.error('Error checking first vote of day:', error)
      return true // Assume first vote if error
    }

    return !data || data.length === 0
  }

  /**
   * Get weekly tokens earned by user
   */
  private static async getWeeklyTokensEarned(userFid: string): Promise<number> {
    const weekStart = this.getWeekStart()
    
    const { data, error } = await supabase
      .from('votes')
      .select('token_reward')
      .eq('voter_fid', userFid)
      .gte('created_at', weekStart)

    if (error) {
      console.error('Error fetching weekly tokens:', error)
      return 0
    }

    return data?.reduce((sum, vote) => sum + (vote.token_reward || 0), 0) || 0
  }

  /**
   * Update vendor statistics (simplified)
   */
  private static async updateVendorStats(vendorId: string, isVerified: boolean): Promise<void> {
    // This will be implemented with proper territory calculations
    // For now, just log the update
    console.log(`Vendor ${vendorId} received ${isVerified ? 'verified' : 'regular'} vote`)
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