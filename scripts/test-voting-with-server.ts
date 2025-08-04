import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testVotingWithServer() {
  console.log('🧪 Testing Voting System with Server...\n')

  try {
    // 1. Test API endpoints
    console.log('1. Testing API endpoints...')
    
    // Test votes endpoint with POST
    const voteResponse = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
        userFid: '12345',
        voteType: 'regular'
      }),
    })
    
    if (voteResponse.ok) {
      const voteResult = await voteResponse.json()
      console.log('✅ Votes API POST working:', voteResult.success ? 'Success' : 'Error')
      if (!voteResult.success) {
        console.log('   Error:', voteResult.error)
      } else {
        console.log('   Tokens earned:', voteResult.data.tokensEarned)
      }
    } else {
      console.log('❌ Votes API POST failed:', voteResponse.status)
    }
    
    // Test tokens balance endpoint
    const balanceResponse = await fetch('http://localhost:3000/api/tokens/balance?fid=12345')
    
    if (balanceResponse.ok) {
      const balanceResult = await balanceResponse.json()
      console.log('✅ Tokens balance API working:', balanceResult.success ? 'Success' : 'Error')
      if (balanceResult.success) {
        console.log('   Balance:', balanceResult.data.balance)
      }
    } else {
      console.log('❌ Tokens balance API failed:', balanceResponse.status)
    }

    // 2. Test multiple votes
    console.log('\n2. Testing multiple votes...')
    
    const testVotes = [
      { userFid: '23456', vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', voteType: 'regular' },
      { userFid: '34567', vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', voteType: 'verified', photoUrl: 'https://example.com/photo.jpg' },
      { userFid: '45678', vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', voteType: 'regular' }
    ]

    for (let i = 0; i < testVotes.length; i++) {
      const vote = testVotes[i]
      console.log(`   Testing vote ${i + 1} for user ${vote.userFid}...`)
      
      const response = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vote),
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(`   ✅ Vote ${i + 1} successful - Tokens: ${result.data.tokensEarned}`)
        } else {
          console.log(`   ❌ Vote ${i + 1} failed: ${result.error}`)
        }
      } else {
        console.log(`   ❌ Vote ${i + 1} HTTP error: ${response.status}`)
      }
    }

    // 3. Test rate limiting
    console.log('\n3. Testing rate limiting...')
    
    // Try to vote multiple times for the same vendor
    for (let i = 0; i < 5; i++) {
      const response = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
          userFid: '56789', // Existing user
          voteType: 'regular'
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(`   ✅ Vote ${i + 1} successful`)
        } else {
          console.log(`   ❌ Vote ${i + 1} blocked: ${result.error}`)
          break
        }
      }
    }

    // 4. Check final balances
    console.log('\n4. Checking final balances...')
    
    const finalBalanceResponse = await fetch('http://localhost:3000/api/tokens/balance?fid=12345')
    if (finalBalanceResponse.ok) {
      const finalBalance = await finalBalanceResponse.json()
      if (finalBalance.success) {
        console.log(`   Final balance for user 12345: ${finalBalance.data.balance} tokens`)
      }
    }

    // 5. Test vote history
    console.log('\n5. Testing vote history...')
    
    const historyResponse = await fetch('http://localhost:3000/api/votes?voterFid=12345')
    if (historyResponse.ok) {
      const history = await historyResponse.json()
      if (history.success) {
        console.log(`   Vote history for user 12345: ${history.data.length} votes`)
      }
    }

    console.log('\n🎉 Voting system test completed!')
    console.log('\nNext steps:')
    console.log('1. Test the UI voting buttons')
    console.log('2. Verify token balance updates in the header')
    console.log('3. Check vendor stats updates')
    console.log('4. Test verified votes with photo capture')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testVotingWithServer() 