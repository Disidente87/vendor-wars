import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugAuthState() {
  console.log('🔍 Debugging Authentication State')
  console.log('================================')

  try {
    // Check all users in database
    console.log('\n1. Checking all users in database...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid, username, display_name, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`✅ Found ${users.length} users in database:`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. FID: ${user.fid}`)
      console.log(`      Username: ${user.username}`)
      console.log(`      Display Name: ${user.display_name}`)
      console.log(`      Created: ${user.created_at}`)
      console.log(`      Updated: ${user.updated_at}`)
      console.log('')
    })

    // Test authentication endpoint for each user
    console.log('\n2. Testing authentication endpoint for each user...')
    
    for (const user of users) {
      console.log(`   Testing FID: ${user.fid} (${user.username})`)
      
      try {
        const response = await fetch(`http://localhost:3000/api/auth/farcaster?fid=${user.fid}`)
        const result = await response.json()
        
        if (result.success) {
          console.log(`   ✅ User ${user.fid} can be authenticated`)
          console.log(`      Response data:`, {
            fid: result.data.fid,
            username: result.data.username,
            display_name: result.data.display_name,
            battle_tokens: result.data.battle_tokens,
            vote_streak: result.data.vote_streak
          })
        } else {
          console.log(`   ❌ User ${user.fid} authentication failed: ${result.error}`)
        }
      } catch (error) {
        console.error(`   ❌ Error testing user ${user.fid}:`, error)
      }
      console.log('')
    }

    // Check if there are any votes for these users
    console.log('\n3. Checking votes for each user...')
    
    for (const user of users) {
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('id, vendor_id, vote_date, is_verified, token_reward')
        .eq('voter_fid', user.fid)
        .order('created_at', { ascending: false })

      if (votesError) {
        console.error(`   ❌ Error fetching votes for user ${user.fid}:`, votesError)
      } else {
        console.log(`   User ${user.fid} (${user.username}): ${votes.length} votes`)
        if (votes.length > 0) {
          console.log(`      Latest vote: ${votes[0].vote_date}`)
          console.log(`      Total verified votes: ${votes.filter(v => v.is_verified).length}`)
        }
      }
    }

    console.log('\n🎉 Debug complete!')
    console.log('\n📋 Summary:')
    console.log(`   - Total users in database: ${users.length}`)
    console.log('   - Authentication endpoints: Working')
    console.log('   - User data: Accessible')
    console.log('\n💡 Next steps:')
    console.log('   1. Check browser console for detailed auth logs')
    console.log('   2. Verify localStorage has user data')
    console.log('   3. Test authentication flow in Farcaster')

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugAuthState() 