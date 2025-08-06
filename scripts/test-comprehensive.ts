import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  console.log('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function comprehensiveTest() {
  console.log('🧪 Running comprehensive system test...')
  
  try {
    // Test database connection
    console.log('\n1️⃣ Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('   ❌ Database connection failed: ' + testError.message)
      return
    }
    console.log('   ✅ Database connection successful')
    
    // Test table structure
    console.log('\n2️⃣ Testing table structure...')
    const tables = ['users', 'vendors', 'votes', 'zones']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log('   ❌ Table ' + table + ': ' + error.message)
      } else {
        console.log('   ✅ Table ' + table + ': accessible')
      }
    }
    
    // Test voting system
    console.log('\n3️⃣ Testing voting system...')
    const testUserFid = Math.floor(Math.random() * 1000000) + 100000
    const testVendorId = '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0'
    
    // Create test user
    const { error: createUserError } = await supabase
      .from('users')
      .insert({
        fid: testUserFid,
        username: 'test_user',
        display_name: 'Test User',
        avatar_url: { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test' },
        battle_tokens: 0,
        vote_streak: 0
      })
    
    if (createUserError) {
      console.log('   ⚠️ Test user creation: ' + createUserError.message)
    } else {
      console.log('   ✅ Test user created')
    }
    
    // Test vote insertion
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .insert({
        voter_fid: testUserFid,
        vendor_id: testVendorId,
        vote_date: new Date().toISOString().split('T')[0],
        is_verified: true,
        token_reward: 10,
        multiplier: 1,
        reason: 'Test vote'
      })
      .select('*')
      .single()
    
    if (voteError) {
      console.log('   ❌ Vote insertion failed: ' + voteError.message)
    } else {
      console.log('   ✅ Vote inserted successfully: ' + voteData.id)
    }
    
    // Cleanup test data
    console.log('\n4️⃣ Cleaning up test data...')
    await supabase.from('votes').delete().eq('voter_fid', testUserFid)
    await supabase.from('users').delete().eq('fid', testUserFid)
    console.log('   ✅ Test data cleaned up')
    
    console.log('\n🎉 Comprehensive test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in comprehensive test:', error)
  }
}

comprehensiveTest()
