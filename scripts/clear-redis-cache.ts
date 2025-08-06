import { Redis } from '@upstash/redis'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN!,
})

// Redis key prefixes for organization
const REDIS_KEYS = {
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

async function clearRedisCache() {
  console.log('🧹 Clearing Redis cache...')
  
  try {
    // Get all keys from Redis
    const allKeys = await redis.keys('*')
    console.log(`📊 Found ${allKeys.length} keys in Redis`)
    
    if (allKeys.length === 0) {
      console.log('✅ Redis is already empty')
      return
    }
    
    // Group keys by type for better reporting
    const keyGroups = {
      userTokens: allKeys.filter(key => key.includes(REDIS_KEYS.USER_TOKENS)),
      voteStreaks: allKeys.filter(key => key.includes(REDIS_KEYS.VOTE_STREAKS)),
      voteLimits: allKeys.filter(key => key.includes(REDIS_KEYS.VOTE_LIMIT)),
      rateLimits: allKeys.filter(key => key.includes(REDIS_KEYS.RATE_LIMIT)),
      photoHashes: allKeys.filter(key => key.includes(REDIS_KEYS.PHOTO_HASHES)),
      suspiciousActivity: allKeys.filter(key => key.includes(REDIS_KEYS.SUSPICIOUS_ACTIVITY)),
      territoryStatus: allKeys.filter(key => key.includes(REDIS_KEYS.TERRITORY_STATUS)),
      vendorStats: allKeys.filter(key => key.includes(REDIS_KEYS.VENDOR_STATS)),
      other: allKeys.filter(key => 
        !key.includes(REDIS_KEYS.USER_TOKENS) &&
        !key.includes(REDIS_KEYS.VOTE_STREAKS) &&
        !key.includes(REDIS_KEYS.VOTE_LIMIT) &&
        !key.includes(REDIS_KEYS.RATE_LIMIT) &&
        !key.includes(REDIS_KEYS.PHOTO_HASHES) &&
        !key.includes(REDIS_KEYS.SUSPICIOUS_ACTIVITY) &&
        !key.includes(REDIS_KEYS.TERRITORY_STATUS) &&
        !key.includes(REDIS_KEYS.VENDOR_STATS)
      )
    }
    
    // Report what we found
    console.log('\n📋 Redis Keys Found:')
    console.log(`   💰 User Tokens: ${keyGroups.userTokens.length}`)
    console.log(`   🔥 Vote Streaks: ${keyGroups.voteStreaks.length}`)
    console.log(`   🗳️ Vote Limits: ${keyGroups.voteLimits.length}`)
    console.log(`   ⏱️ Rate Limits: ${keyGroups.rateLimits.length}`)
    console.log(`   📸 Photo Hashes: ${keyGroups.photoHashes.length}`)
    console.log(`   🚨 Suspicious Activity: ${keyGroups.suspiciousActivity.length}`)
    console.log(`   🗺️ Territory Status: ${keyGroups.territoryStatus.length}`)
    console.log(`   📊 Vendor Stats: ${keyGroups.vendorStats.length}`)
    console.log(`   🔧 Other: ${keyGroups.other.length}`)
    
    // Show some examples of user tokens
    if (keyGroups.userTokens.length > 0) {
      console.log('\n💰 User Tokens Examples:')
      const sampleTokens = keyGroups.userTokens.slice(0, 5)
      for (const key of sampleTokens) {
        const tokens = await redis.get(key)
        console.log(`   ${key}: ${tokens} tokens`)
      }
      if (keyGroups.userTokens.length > 5) {
        console.log(`   ... and ${keyGroups.userTokens.length - 5} more`)
      }
    }
    
    // Confirm deletion
    console.log('\n⚠️ About to delete ALL keys from Redis')
    console.log('This will reset all user tokens, streaks, and cached data')
    
    // Delete all keys
    console.log('\n🗑️ Deleting all keys...')
    const deletedCount = await redis.del(...allKeys)
    
    console.log(`✅ Successfully deleted ${deletedCount} keys from Redis`)
    console.log('🎉 Redis cache cleared successfully!')
    
    // Verify Redis is empty
    const remainingKeys = await redis.keys('*')
    console.log(`📊 Remaining keys: ${remainingKeys.length}`)
    
  } catch (error) {
    console.error('❌ Error clearing Redis cache:', error)
    throw error
  }
}

async function resetUserTokensInDatabase() {
  console.log('\n🔄 Resetting user tokens in database...')
  
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase environment variables not found, skipping database reset')
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Reset all user tokens to 0 (only columns that exist)
    const { data, error } = await supabase
      .from('users')
      .update({ 
        battle_tokens: 0,
        vote_streak: 0
      })
      .neq('fid', 0) // Update all users except system users
    
    if (error) {
      console.error('❌ Error resetting user tokens in database:', error)
      return
    }
    
    console.log(`✅ Reset tokens for users in database`)
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error)
  }
}

async function main() {
  console.log('🚀 Starting Redis cache cleanup...\n')
  
  try {
    // Clear Redis cache
    await clearRedisCache()
    
    // Reset database tokens
    await resetUserTokensInDatabase()
    
    console.log('\n🎉 Complete cleanup finished!')
    console.log('All user tokens have been reset to 0')
    console.log('All Redis cache has been cleared')
    console.log('Users will start fresh on next login')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

main()
