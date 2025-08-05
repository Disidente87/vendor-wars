import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { redis } from '@/lib/redis'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function syncTokensRedisDB() {
  console.log('🔄 Syncing tokens between Redis and Database...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 1. Get all users from database
    console.log('1️⃣ Fetching users from database...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid, battle_tokens')
      .order('fid')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }

    console.log(`✅ Found ${users?.length || 0} users in database`)
    console.log()

    // 2. Check Redis tokens for each user
    console.log('2️⃣ Checking Redis tokens for each user...')
    const syncResults = []

    for (const user of users || []) {
      const redisKey = `user:tokens:${user.fid}`
      const redisTokens = await redis.get(redisKey)
      const dbTokens = user.battle_tokens || 0
      const redisTokensNum = redisTokens ? parseInt(redisTokens.toString()) : 0

      syncResults.push({
        userFid: user.fid,
        dbTokens,
        redisTokens: redisTokensNum,
        needsSync: dbTokens !== redisTokensNum
      })

      console.log(`  User ${user.fid}:`)
      console.log(`    DB tokens: ${dbTokens}`)
      console.log(`    Redis tokens: ${redisTokensNum}`)
      console.log(`    Needs sync: ${dbTokens !== redisTokensNum ? 'YES' : 'NO'}`)
    }
    console.log()

    // 3. Ask user what to do
    console.log('3️⃣ Sync Options:')
    console.log('  A) Use database values (overwrite Redis)')
    console.log('  B) Use Redis values (overwrite database)')
    console.log('  C) Show differences only (no sync)')
    console.log()

    // For now, let's use database values (option A)
    console.log('🔄 Using database values (overwriting Redis)...')

    // 4. Sync Redis with database values
    let syncedCount = 0
    for (const result of syncResults) {
      if (result.needsSync) {
        const redisKey = `user:tokens:${result.userFid}`
        await redis.set(redisKey, result.dbTokens)
        await redis.expire(redisKey, 3600) // 1 hour cache
        syncedCount++
        console.log(`  ✅ Synced user ${result.userFid}: Redis = ${result.dbTokens}`)
      }
    }

    console.log()
    console.log(`✅ Sync complete! ${syncedCount} users synchronized`)

    // 5. Show summary
    console.log('\n📊 Summary:')
    const needsSync = syncResults.filter(r => r.needsSync)
    const inSync = syncResults.filter(r => !r.needsSync)
    
    console.log(`  Users in sync: ${inSync.length}`)
    console.log(`  Users needing sync: ${needsSync.length}`)
    
    if (needsSync.length > 0) {
      console.log('\n  Users that were synced:')
      needsSync.forEach(result => {
        console.log(`    ${result.userFid}: DB=${result.dbTokens} → Redis=${result.dbTokens}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

syncTokensRedisDB().catch(console.error) 