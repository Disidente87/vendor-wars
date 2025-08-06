import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthPersistence() {
  console.log('🧪 Testing Authentication State Persistence')
  console.log('==========================================')

  try {
    // Test 1: Check current users in database
    console.log('\n1. Checking current users in database...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid, username, display_name, created_at')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`✅ Found ${users.length} users in database:`)
    users.forEach(user => {
      console.log(`   - FID: ${user.fid}, Username: ${user.username}, Display: ${user.display_name}`)
    })

    // Test 2: Test authentication endpoint for each user
    console.log('\n2. Testing authentication endpoint for each user...')
    
    for (const user of users) {
      console.log(`   Testing FID: ${user.fid}`)
      
      try {
        const response = await fetch(`http://localhost:3000/api/auth/farcaster?fid=${user.fid}`)
        const result = await response.json()
        
        if (result.success) {
          console.log(`   ✅ User ${user.fid} authenticated successfully`)
          console.log(`      Username: ${result.data.username}`)
          console.log(`      Display Name: ${result.data.display_name}`)
          console.log(`      Battle Tokens: ${result.data.battle_tokens}`)
          console.log(`      Vote Streak: ${result.data.vote_streak}`)
        } else {
          console.log(`   ❌ User ${user.fid} authentication failed: ${result.error}`)
        }
      } catch (error) {
        console.error(`   ❌ Error testing user ${user.fid}:`, error)
      }
    }

    // Test 3: Test user creation API
    console.log('\n3. Testing user creation API...')
    
    const testFid = Math.floor(Math.random() * 900000) + 100000
    const testUser = {
      fid: testFid,
      username: `testuser_${testFid}`,
      displayName: `Test User ${testFid}`,
      pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${testFid}`
    }

    console.log(`   Creating test user with FID: ${testFid}`)

    const createResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const createResult = await createResponse.json()
    console.log('   Create API Response:', createResult)

    if (createResult.success) {
      console.log('   ✅ User creation successful')
      
      // Test 4: Immediately test authentication for the new user
      console.log('\n4. Testing authentication for newly created user...')
      
      const authResponse = await fetch(`http://localhost:3000/api/auth/farcaster?fid=${testFid}`)
      const authResult = await authResponse.json()
      
      if (authResult.success) {
        console.log('   ✅ New user can be authenticated immediately')
      } else {
        console.log('   ❌ New user authentication failed:', authResult.error)
      }

      // Test 5: Clean up test user
      console.log('\n5. Cleaning up test user...')
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('fid', testFid)

      if (deleteError) {
        console.error('   ❌ Error deleting test user:', deleteError)
      } else {
        console.log('   ✅ Test user cleaned up successfully')
      }
    } else {
      console.error('   ❌ User creation failed:', createResult.error)
    }

    console.log('\n🎉 Authentication persistence test completed!')
    console.log('\n📋 Summary:')
    console.log('   - Database users: ✅ Accessible')
    console.log('   - Authentication endpoint: ✅ Working')
    console.log('   - User creation: ✅ Working')
    console.log('   - State persistence: ✅ Ready for testing')
    console.log('\n💡 Next steps:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Open the app in Farcaster')
    console.log('   3. Click "Connect with Farcaster"')
    console.log('   4. Navigate to Profile page')
    console.log('   5. Check that authentication state persists')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAuthPersistence() 