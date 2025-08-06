import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function clearRedisCache() {
  console.log('🔄 Clearing Redis cache...\n')

  // Check if Redis environment variables are available
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    console.log('⚠️  Redis environment variables not found')
    console.log('   UPSTASH_REDIS_REST_URL:', redisUrl ? '✅ Set' : '❌ Missing')
    console.log('   UPSTASH_REDIS_REST_TOKEN:', redisToken ? '✅ Set' : '❌ Missing')
    console.log()
    console.log('📝 To clear Redis cache manually:')
    console.log('   1. Go to your Upstash Redis dashboard')
    console.log('   2. Navigate to the "Data Browser" section')
    console.log('   3. Delete keys that start with:')
    console.log('      - user:tokens:* (user token balances)')
    console.log('      - vote_streaks:* (vote streaks)')
    console.log('      - rate_limit:* (rate limiting data)')
    console.log()
    console.log('🔄 Alternative: Restart your application to clear the cache')
    return
  }

  try {
    // Import Redis dynamically to avoid issues with missing env vars
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })

    console.log('1️⃣ Connecting to Redis...')
    
    // Get all keys
    const keys = await redis.keys('*')
    console.log(`✅ Found ${keys.length} keys in Redis`)
    
    if (keys.length === 0) {
      console.log('✅ Redis cache is already empty')
      return
    }

    console.log('\n2️⃣ Keys found:')
    keys.forEach(key => console.log(`   ${key}`))
    
    console.log('\n3️⃣ Clearing all keys...')
    let deletedCount = 0
    
    for (const key of keys) {
      await redis.del(key)
      deletedCount++
      console.log(`   ✅ Deleted: ${key}`)
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} keys`)
    console.log('🎉 Redis cache cleared!')

  } catch (error) {
    console.error('❌ Error clearing Redis cache:', error)
    console.log('\n📝 Manual steps to clear Redis:')
    console.log('   1. Go to your Upstash Redis dashboard')
    console.log('   2. Navigate to the "Data Browser" section')
    console.log('   3. Delete all keys or restart your application')
  }
}

clearRedisCache().catch(console.error) 