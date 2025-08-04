import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
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
    const key = `${REDIS_KEYS.VOTE_LIMIT}:${userFid}:${vendorId}:${getCurrentDay()}`
    const currentVotes = await redis.get(key) || 0
    
    // Max 3 votes per vendor per day
    return (currentVotes as number) < 3
  },

  // Increment vote count for user-vendor pair
  async incrementVoteCount(userFid: string, vendorId: string): Promise<void> {
    const key = `${REDIS_KEYS.VOTE_LIMIT}:${userFid}:${vendorId}:${getCurrentDay()}`
    await redis.incr(key)
    // Expire at end of day
    await redis.expire(key, 86400) // 24 hours
  },

  // Check weekly vote limit
  async canVoteThisWeek(userFid: string): Promise<boolean> {
    const key = `${REDIS_KEYS.VOTE_LIMIT}:${userFid}:weekly:${getCurrentWeek()}`
    const weeklyVotes = await redis.get(key) || 0
    
    // Max 200 votes per week
    return (weeklyVotes as number) < 200
  },

  // Increment weekly vote count
  async incrementWeeklyVoteCount(userFid: string): Promise<void> {
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
    const key = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}`
    const streak = await redis.get(key) || 0
    return streak as number
  },

  // Increment vote streak
  async incrementStreak(userFid: string): Promise<number> {
    const key = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}`
    const newStreak = await redis.incr(key)
    // Expire after 2 days (if user doesn't vote tomorrow, streak breaks)
    await redis.expire(key, 172800)
    return newStreak
  },

  // Reset vote streak (when user misses a day)
  async resetStreak(userFid: string): Promise<void> {
    const key = `${REDIS_KEYS.VOTE_STREAKS}:${userFid}`
    await redis.del(key)
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

function getCurrentWeek(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7).toString()
}

export default redis 