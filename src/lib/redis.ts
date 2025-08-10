import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN!,
})

// Redis key prefixes for organization
export const REDIS_KEYS = {
  // Rate limiting
  RATE_LIMIT: 'rate_limit',
  VOTE_LIMIT: 'vote_limit',
  
  // Caching
  USER_TOKENS: 'user_tokens',
  VENDOR_STATS: 'vendor_stats',
  TERRITORY_STATUS: 'territory_status',
  
  // Sessions
  VOTE_SESSION: 'vote_session',
  VERIFICATION_SESSION: 'verification_session',
  
  // Real-time updates
  TERRITORY_UPDATES: 'territory_updates',
  VOTE_STREAKS: 'vote_streaks',
  
  // Anti-fraud
  PHOTO_HASHES: 'photo_hashes',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity'
} as const

// Rate limiting functions
export const rateLimiter = {
  // Check if user can vote for a specific vendor
  async canVoteForVendor(userFid: string, vendorId: string): Promise<boolean> {
    // REMOVED RESTRICTION: Allow unlimited votes per vendor per day for testing
    return true
  },

  // Increment vote count for user-vendor pair
  async incrementVoteCount(userFid: string, vendorId: string): Promise<void> {
    // REMOVED RESTRICTION: Still track for analytics but don't limit
    const key = `${REDIS_KEYS.VOTE_LIMIT}:${userFid}:${vendorId}:${getCurrentDay()}`
    await redis.incr(key)
    // Expire at end of day
    await redis.expire(key, 86400) // 24 hours
  },

  // Check weekly vote limit
  async canVoteThisWeek(userFid: string): Promise<boolean> {
    // REMOVED RESTRICTION: Allow unlimited votes per week for testing
    return true
  },

  // Increment weekly vote count
  async incrementWeeklyVoteCount(userFid: string): Promise<void> {
    // REMOVED RESTRICTION: Still track for analytics but don't limit
    const key = `${REDIS_KEYS.VOTE_LIMIT}:${userFid}:weekly:${getCurrentWeek()}`
    await redis.incr(key)
    // Expire at end of week
    await redis.expire(key, 604800) // 7 days
  }
}

// Token management functions
export const tokenManager = {
  // Get user's current token balance
  async getUserTokens(userFid: string): Promise<number> {
    const key = `${REDIS_KEYS.USER_TOKENS}:${userFid}`
    const tokens = await redis.get(key)
    
    if (tokens === null) {
      // Cache miss, fetch from database
      // This will be implemented when we connect to the database
      return 0
    }
    
    return tokens as number
  },

  // Update user's token balance
  async updateUserTokens(userFid: string, amount: number): Promise<void> {
    const key = `${REDIS_KEYS.USER_TOKENS}:${userFid}`
    await redis.set(key, amount)
    // Cache for 1 hour
    await redis.expire(key, 3600)
  },

  // Add tokens to user balance
  async addTokens(userFid: string, amount: number): Promise<number> {
    const key = `${REDIS_KEYS.USER_TOKENS}:${userFid}`
    const newBalance = await redis.incrby(key, amount)
    await redis.expire(key, 3600) // 1 hour cache
    return newBalance
  }
}

// Vote streak management
export const streakManager = {
  // Get user's current vote streak
  async getVoteStreak(userFid: string): Promise<number> {
    try {
      const key = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}`
      const streak = await redis.get(key)
      return streak ? parseInt(streak as string) : 0
    } catch (error) {
      console.warn('⚠️ Redis error getting vote streak, returning 0:', error)
      return 0
    }
  },

  // Increment vote streak (only once per day)
  async incrementStreak(userFid: string): Promise<number> {
    try {
      const today = getCurrentDay()
      const yesterday = getYesterday()
      const dailyKey = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}:${today}`
      const yesterdayKey = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}:${yesterday}`
      const streakKey = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}`
      
      // Check if user already voted today
      const alreadyVotedToday = await redis.exists(dailyKey)
      
      if (alreadyVotedToday) {
        // User already voted today, just return current streak
        const currentStreak = await redis.get(streakKey)
        return currentStreak ? parseInt(currentStreak as string) : 0
      }
      
      // Check if user voted yesterday
      const votedYesterday = await redis.exists(yesterdayKey)
      
      if (!votedYesterday) {
        // User didn't vote yesterday, reset streak to 1
        await redis.set(streakKey, 1)
        await redis.setex(dailyKey, 86400, '1') // Mark today as voted (24 hours)
        await redis.expire(streakKey, 172800) // Expire streak after 2 days
        return 1
      }
      
      // User voted yesterday, increment streak and mark today as voted
      const newStreak = await redis.incr(streakKey)
      await redis.setex(dailyKey, 86400, '1') // Mark today as voted (24 hours)
      await redis.expire(streakKey, 172800) // Expire streak after 2 days
      
      return newStreak
    } catch (error) {
      console.warn('⚠️ Redis error incrementing streak, returning 0:', error)
      return 0
    }
  },

  // Reset vote streak (when user misses a day)
  async resetStreak(userFid: string): Promise<void> {
    try {
      const key = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}`
      await redis.del(key)
    } catch (error) {
      console.warn('⚠️ Redis error resetting streak:', error)
    }
  },

  // Check if user missed a day and reset streak if needed
  async checkAndResetStreakIfNeeded(userFid: string): Promise<void> {
    try {
      const today = getCurrentDay()
      const yesterday = getYesterday()
      const dailyKey = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}:${today}`
      const yesterdayKey = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}:${yesterday}`
      
      // If user didn't vote today and didn't vote yesterday, reset streak
      const votedToday = await redis.exists(dailyKey)
      const votedYesterday = await redis.exists(yesterdayKey)
      
      if (!votedToday && !votedYesterday) {
        await this.resetStreak(userFid)
      }
    } catch (error) {
      console.warn('⚠️ Redis error checking and resetting streak:', error)
    }
  }
}

// Territory caching
export const territoryCache = {
  // Cache territory status
  async cacheTerritoryStatus(zoneId: string, data: any): Promise<void> {
    const key = `${REDIS_KEYS.TERRITORY_STATUS}:${zoneId}`
    await redis.setex(key, 60, JSON.stringify(data)) // 1 minute cache
  },

  // Get cached territory status
  async getTerritoryStatus(zoneId: string): Promise<any | null> {
    const key = `${REDIS_KEYS.TERRITORY_STATUS}:${zoneId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data as string) : null
  },

  // Invalidate territory cache
  async invalidateTerritoryCache(zoneId: string): Promise<void> {
    const key = `${REDIS_KEYS.TERRITORY_STATUS}:${zoneId}`
    await redis.del(key)
  }
}

// Anti-fraud functions
export const fraudDetection = {
  // Check if photo hash has been used before
  async isPhotoHashDuplicate(photoHash: string): Promise<boolean> {
    const key = `${REDIS_KEYS.PHOTO_HASHES}:${photoHash}`
    const exists = await redis.exists(key)
    
    if (!exists) {
      // Store hash for future checks
      await redis.setex(key, 86400, '1') // 24 hours
    }
    
    return exists === 1
  },

  // Track suspicious activity
  async trackSuspiciousActivity(userFid: string, activity: string): Promise<void> {
    const key = `${REDIS_KEYS.SUSPICIOUS_ACTIVITY}:${userFid}`
    await redis.lpush(key, JSON.stringify({
      activity,
      timestamp: Date.now()
    }))
    await redis.ltrim(key, 0, 99) // Keep last 100 activities
    await redis.expire(key, 86400) // 24 hours
  }
}

// Utility functions
function getCurrentDay(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterday(): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

function getCurrentWeek(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7).toString()
}

export default redis 