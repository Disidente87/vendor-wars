import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN!,
})

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetUserTokens(userFid: string) {
  console.log(`🔄 Resetting tokens for user ${userFid}...`)
  
  try {
    // 1. Clear Redis cache for this user
    console.log('🧹 Clearing Redis cache...')
    
    const redisKeys = [
      `user_tokens:${userFid}`,
      `vote_streaks:${userFid}`,
      `vote_streaks:${userFid}:${getCurrentDay()}`,
      `vote_streaks:${userFid}:${getYesterday()}`,
      `vote_limit:${userFid}:weekly:${getCurrentWeek()}`,
    ]
    
    // Get all vote limit keys for this user
    const voteLimitPattern = `vote_limit:${userFid}:*`
    const voteLimitKeys = await redis.keys(voteLimitPattern)
    redisKeys.push(...voteLimitKeys)
    
    if (redisKeys.length > 0) {
      const deletedCount = await redis.del(...redisKeys)
      console.log(`✅ Deleted ${deletedCount} Redis keys for user ${userFid}`)
    } else {
      console.log('✅ No Redis keys found for this user')
    }
    
    // 2. Reset database tokens
    console.log('🔄 Resetting database tokens...')
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        battle_tokens: 0,
        vote_streak: 0
      })
      .eq('fid', parseInt(userFid))
    
    if (error) {
      console.error('❌ Error resetting user tokens in database:', error)
      return false
    }
    
    console.log(`✅ Reset tokens for user ${userFid} in database`)
    
    // 3. Verify the reset
    console.log('🔍 Verifying reset...')
    
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('fid, username, battle_tokens, vote_streak')
      .eq('fid', parseInt(userFid))
      .single()
    
    if (fetchError) {
      console.error('❌ Error fetching user data:', fetchError)
      return false
    }
    
    console.log('📊 User data after reset:')
    console.log(`   FID: ${userData.fid}`)
    console.log(`   Username: ${userData.username}`)
    console.log(`   Battle Tokens: ${userData.battle_tokens}`)
    console.log(`   Vote Streak: ${userData.vote_streak}`)
    
    // Check Redis
    const redisTokens = await redis.get(`user_tokens:${userFid}`)
    console.log(`   Redis Tokens: ${redisTokens || 'not set'}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error resetting user tokens:', error)
    return false
  }
}

async function listAllUsers() {
  console.log('👥 Listing all users in database...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('fid, username, battle_tokens, vote_streak')
      .order('fid', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching users:', error)
      return
    }
    
    if (!data || data.length === 0) {
      console.log('📭 No users found in database')
      return
    }
    
    console.log(`📊 Found ${data.length} users:`)
    console.log('')
    console.log('FID\t\tUsername\t\tTokens\tStreak')
    console.log('---\t\t--------\t\t-----\t------')
    
    data.forEach(user => {
      console.log(`${user.fid}\t\t${user.username || 'N/A'}\t\t${user.battle_tokens}\t${user.vote_streak}`)
    })
    
  } catch (error) {
    console.error('❌ Error listing users:', error)
  }
}

function getCurrentDay(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterday(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

function getCurrentWeek(): string {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  return startOfWeek.toISOString().split('T')[0]
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🚀 User Token Reset Tool')
    console.log('')
    console.log('Usage:')
    console.log('  npm run reset:user <userFid>     - Reset tokens for specific user')
    console.log('  npm run reset:user --list        - List all users')
    console.log('')
    console.log('Examples:')
    console.log('  npm run reset:user 497866        - Reset tokens for user 497866')
    console.log('  npm run reset:user --list        - Show all users')
    return
  }
  
  if (args[0] === '--list') {
    await listAllUsers()
    return
  }
  
  const userFid = args[0]
  
  if (!userFid || isNaN(parseInt(userFid))) {
    console.error('❌ Invalid user FID. Please provide a valid number.')
    return
  }
  
  console.log(`🚀 Resetting tokens for user ${userFid}...\n`)
  
  const success = await resetUserTokens(userFid)
  
  if (success) {
    console.log('\n🎉 User tokens reset successfully!')
    console.log('The user will start fresh on next login.')
  } else {
    console.log('\n❌ Failed to reset user tokens.')
    process.exit(1)
  }
}

main()
