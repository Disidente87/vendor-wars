import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserData(userFid: string) {
  console.log(`🔍 Checking data for user ${userFid}...`)
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('fid', parseInt(userFid))
      .single()

    if (error) {
      console.error('❌ Error fetching user:', error)
      return
    }

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('📊 User data:')
    console.log('')
    console.log(`FID: ${user.fid}`)
    console.log(`Username: ${user.username}`)
    console.log(`Display Name: ${user.display_name}`)
    console.log(`Avatar URL: ${user.avatar_url}`)
    console.log(`Battle Tokens: ${user.battle_tokens}`)
    console.log(`Vote Streak: ${user.vote_streak}`)
    console.log(`Created At: ${user.created_at}`)
    console.log(`Updated At: ${user.updated_at}`)
    
    // Check if avatar_url is a JSON object
    if (user.avatar_url && typeof user.avatar_url === 'object') {
      console.log('')
      console.log('🔍 Avatar URL is a JSON object:')
      console.log(JSON.stringify(user.avatar_url, null, 2))
      
      if (user.avatar_url.url) {
        console.log('')
        console.log('✅ Avatar URL found in JSON object:')
        console.log(`URL: ${user.avatar_url.url}`)
      }
    } else if (user.avatar_url && typeof user.avatar_url === 'string') {
      console.log('')
      console.log('✅ Avatar URL is a string:')
      console.log(`URL: ${user.avatar_url}`)
    } else {
      console.log('')
      console.log('❌ No avatar URL found')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function listAllUsersWithAvatars() {
  console.log('👥 Listing all users with avatar data...')
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('fid, username, display_name, avatar_url')
      .order('fid', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching users:', error)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('📭 No users found')
      return
    }
    
    console.log(`📊 Found ${users.length} users:`)
    console.log('')
    console.log('FID\t\tUsername\t\tDisplay Name\t\tAvatar URL')
    console.log('---\t\t--------\t\t------------\t\t----------')
    
    users.forEach(user => {
      let avatarInfo = 'No avatar'
      if (user.avatar_url) {
        if (typeof user.avatar_url === 'object' && user.avatar_url.url) {
          avatarInfo = user.avatar_url.url
        } else if (typeof user.avatar_url === 'string') {
          avatarInfo = user.avatar_url
        } else {
          avatarInfo = 'Invalid format'
        }
      }
      
      console.log(`${user.fid}\t\t${user.username || 'N/A'}\t\t${user.display_name || 'N/A'}\t\t${avatarInfo}`)
    })
    
  } catch (error) {
    console.error('❌ Error listing users:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🚀 User Data Check Tool')
    console.log('')
    console.log('Usage:')
    console.log('  npm run check:user <userFid>     - Check specific user data')
    console.log('  npm run check:user --list        - List all users with avatars')
    console.log('')
    console.log('Examples:')
    console.log('  npm run check:user 497866        - Check user 497866')
    console.log('  npm run check:user --list        - Show all users')
    return
  }
  
  if (args[0] === '--list') {
    await listAllUsersWithAvatars()
    return
  }
  
  const userFid = args[0]
  
  if (!userFid || isNaN(parseInt(userFid))) {
    console.error('❌ Invalid user FID. Please provide a valid number.')
    return
  }
  
  await checkUserData(userFid)
}

main()
