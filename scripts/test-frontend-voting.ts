import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testFrontendVoting() {
  console.log('🧪 Testing Frontend Voting System...\n')

  try {
    // 1. Check if server is running
    console.log('1. Checking server status...')
    
    const serverResponse = await fetch('http://localhost:3000')
    if (serverResponse.ok) {
      console.log('✅ Server is running')
    } else {
      console.log('❌ Server is not responding')
      return
    }

    // 2. Test API endpoints
    console.log('\n2. Testing API endpoints...')
    
    // Test votes endpoint
    const voteResponse = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
        userFid: '12345',
        voteType: 'regular'
      }),
    })
    
    if (voteResponse.ok) {
      const voteResult = await voteResponse.json()
      console.log('✅ Votes API working:', voteResult.success ? 'Success' : 'Error')
      if (voteResult.success) {
        console.log('   Tokens earned:', voteResult.data.tokensEarned)
      }
    } else {
      console.log('❌ Votes API failed:', voteResponse.status)
    }

    // 3. Check database state
    console.log('\n3. Checking database state...')
    
    const { data: votes } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: users } = await supabase
      .from('users')
      .select('fid, username')
      .limit(5)

    console.log(`📊 Recent votes: ${votes?.length || 0}`)
    console.log(`📊 Available users: ${users?.length || 0}`)

    if (votes && votes.length > 0) {
      console.log('   Latest vote:', {
        voter: votes[0].voter_fid,
        vendor: votes[0].vendor_id,
        tokens: votes[0].token_reward,
        verified: votes[0].is_verified
      })
    }

    // 4. Test token balance API
    console.log('\n4. Testing token balance API...')
    
    const balanceResponse = await fetch('http://localhost:3000/api/tokens/balance?fid=12345')
    if (balanceResponse.ok) {
      const balanceResult = await balanceResponse.json()
      console.log('✅ Token balance API working:', balanceResult.success ? 'Success' : 'Error')
      if (balanceResult.success) {
        console.log('   Balance:', balanceResult.data.balance)
      }
    } else {
      console.log('❌ Token balance API failed:', balanceResponse.status)
    }

    // 5. Test vote history API
    console.log('\n5. Testing vote history API...')
    
    const historyResponse = await fetch('http://localhost:3000/api/votes?userFid=12345')
    if (historyResponse.ok) {
      const historyResult = await historyResponse.json()
      console.log('✅ Vote history API working:', historyResult.success ? 'Success' : 'Error')
      if (historyResult.success) {
        console.log('   Vote history count:', historyResult.data.length)
      }
    } else {
      console.log('❌ Vote history API failed:', historyResponse.status)
    }

    // 6. Test vendor stats API
    console.log('\n6. Testing vendor stats API...')
    
    const statsResponse = await fetch('http://localhost:3000/api/votes?vendorId=772cdbda-2cbb-4c67-a73a-3656bf02a4c1')
    if (statsResponse.ok) {
      const statsResult = await statsResponse.json()
      console.log('✅ Vendor stats API working:', statsResult.success ? 'Success' : 'Error')
    } else {
      console.log('❌ Vendor stats API failed:', statsResponse.status)
    }

    console.log('\n🎉 Frontend voting system test completed!')
    console.log('\nNext steps:')
    console.log('1. Open http://localhost:3000 in your browser')
    console.log('2. Login with the simulation auth')
    console.log('3. Test the voting buttons in the UI')
    console.log('4. Verify token balance updates')
    console.log('5. Check vote history and vendor stats')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFrontendVoting() 