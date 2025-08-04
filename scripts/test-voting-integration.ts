import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testVotingIntegration() {
  console.log('🧪 Testing Voting System Integration...\n')

  try {
    // 1. Test database connection and tables
    console.log('1. Checking database tables...')
    
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .limit(1)
    
    if (vendorsError) {
      console.error('❌ Error accessing vendors table:', vendorsError)
      return
    }
    
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1)
    
    if (votesError) {
      console.error('❌ Error accessing votes table:', votesError)
      return
    }
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError)
      return
    }
    
    console.log('✅ Database tables accessible')
    
    // 2. Test API endpoints
    console.log('\n2. Testing API endpoints...')
    
    try {
      // Test votes endpoint
      const voteResponse = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: vendors[0]?.id || '1',
          voterFid: '12345',
          isVerified: false
        }),
      })
      
      if (voteResponse.ok) {
        const voteResult = await voteResponse.json()
        console.log('✅ Votes API working:', voteResult.success ? 'Success' : 'Error')
      } else {
        console.log('⚠️  Votes API not accessible (server might not be running)')
      }
      
      // Test tokens balance endpoint
      const balanceResponse = await fetch('http://localhost:3000/api/tokens/balance?fid=12345')
      
      if (balanceResponse.ok) {
        const balanceResult = await balanceResponse.json()
        console.log('✅ Tokens balance API working:', balanceResult.success ? 'Success' : 'Error')
      } else {
        console.log('⚠️  Tokens balance API not accessible (server might not be running)')
      }
    } catch (error) {
      console.log('⚠️  API endpoints not accessible (server not running)')
      console.log('   Start the server with: npm run dev')
    }
    
    // 3. Test Redis configuration
    console.log('\n3. Testing Redis configuration...')
    
    try {
      const { Redis } = await import('@upstash/redis')
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      
      await redis.set('test', 'value')
      const testValue = await redis.get('test')
      
      if (testValue === 'value') {
        console.log('✅ Redis connection working')
      } else {
        console.log('❌ Redis test failed')
      }
    } catch (error) {
      console.log('⚠️  Redis not configured or not accessible')
    }
    
    // 4. Check existing data
    console.log('\n4. Checking existing data...')
    
    const { data: allVendors } = await supabase
      .from('vendors')
      .select('id, name, is_verified')
    
    const { data: allVotes } = await supabase
      .from('votes')
      .select('*')
    
    const { data: allUsers } = await supabase
      .from('users')
      .select('fid, username')
    
    console.log(`📊 Vendors: ${allVendors?.length || 0}`)
    console.log(`📊 Votes: ${allVotes?.length || 0}`)
    console.log(`📊 Users: ${allUsers?.length || 0}`)
    
    // 5. Test voting logic
    console.log('\n5. Testing voting logic...')
    
    if (allVendors && allVendors.length > 0 && allUsers && allUsers.length > 0) {
      const testVendor = allVendors[0]
      const testUser = allUsers[0]
      
      console.log(`Testing vote for vendor: ${testVendor.name} (${testVendor.id})`)
      console.log(`Test user: ${testUser.username} (${testUser.fid})`)
      
      // Simulate a vote
      const { data: newVote, error: voteInsertError } = await supabase
        .from('votes')
        .insert({
          vendor_id: testVendor.id,
          voter_fid: testUser.fid,
          battle_id: '00000000-0000-0000-0000-000000000000', // Use default battle ID
          is_verified: false,
          token_reward: 10,
          created_at: new Date().toISOString()
        })
        .select()
      
      if (voteInsertError) {
        console.log('❌ Vote insertion failed:', voteInsertError.message)
      } else {
        console.log('✅ Test vote inserted successfully')
        
        // Clean up test vote
        await supabase
          .from('votes')
          .delete()
          .eq('id', newVote[0].id)
        
        console.log('✅ Test vote cleaned up')
      }
    }
    
    console.log('\n🎉 Voting system integration test completed!')
    console.log('\nNext steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Test voting through the UI')
    console.log('3. Verify token balance updates')
    console.log('4. Check rate limiting and anti-fraud measures')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testVotingIntegration() 