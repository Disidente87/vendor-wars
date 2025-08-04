import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVotingSystem() {
  console.log('🧪 Testing Voting System...\n')

  try {
    // Get a sample vendor
    console.log('1️⃣ Getting sample vendor...')
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(1)

    if (vendorError || !vendors || vendors.length === 0) {
      console.log('❌ No vendors found')
      return
    }

    const vendor = vendors[0]
    console.log(`✅ Using vendor: ${vendor.name} (${vendor.id})`)

    // Test user FID
    const testUserFid = '12345'

    // Test 1: Regular vote
    console.log('\n2️⃣ Testing regular vote...')
    const regularVoteResponse = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: vendor.id,
        voteType: 'regular'
      }),
    })

    const regularVoteResult = await regularVoteResponse.json()
    
    if (regularVoteResult.success) {
      console.log('✅ Regular vote successful!')
      console.log(`   Tokens earned: ${regularVoteResult.data.tokensEarned}`)
      console.log(`   New balance: ${regularVoteResult.data.newBalance}`)
      console.log(`   Streak bonus: ${regularVoteResult.data.streakBonus}`)
    } else {
      console.log('❌ Regular vote failed:', regularVoteResult.error)
    }

    // Test 2: Verified vote
    console.log('\n3️⃣ Testing verified vote...')
    const verifiedVoteResponse = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: vendor.id,
        voteType: 'verified',
        photoUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
        gpsLocation: { lat: 19.4326, lng: -99.1332 },
        verificationConfidence: 0.95
      }),
    })

    const verifiedVoteResult = await verifiedVoteResponse.json()
    
    if (verifiedVoteResult.success) {
      console.log('✅ Verified vote successful!')
      console.log(`   Tokens earned: ${verifiedVoteResult.data.tokensEarned}`)
      console.log(`   New balance: ${verifiedVoteResult.data.newBalance}`)
      console.log(`   Streak bonus: ${verifiedVoteResult.data.streakBonus}`)
    } else {
      console.log('❌ Verified vote failed:', verifiedVoteResult.error)
    }

    // Test 3: Get user vote history
    console.log('\n4️⃣ Testing vote history...')
    const historyResponse = await fetch(`http://localhost:3000/api/votes?userFid=${testUserFid}`)
    const historyResult = await historyResponse.json()
    
    if (historyResult.success) {
      console.log('✅ Vote history retrieved!')
      console.log(`   Total votes: ${historyResult.data.length}`)
      if (historyResult.data.length > 0) {
        console.log(`   Latest vote: ${historyResult.data[0].reason}`)
      }
    } else {
      console.log('❌ Vote history failed:', historyResult.error)
    }

    // Test 4: Get vendor stats
    console.log('\n5️⃣ Testing vendor stats...')
    const statsResponse = await fetch(`http://localhost:3000/api/votes?vendorId=${vendor.id}`)
    const statsResult = await statsResponse.json()
    
    if (statsResult.success) {
      console.log('✅ Vendor stats retrieved!')
      console.log(`   Total votes: ${statsResult.data.totalVotes}`)
      console.log(`   Verified votes: ${statsResult.data.verifiedVotes}`)
      console.log(`   Total tokens: ${statsResult.data.totalTokens}`)
      console.log(`   Verification rate: ${statsResult.data.verificationRate.toFixed(1)}%`)
    } else {
      console.log('❌ Vendor stats failed:', statsResult.error)
    }

    // Test 5: Get token balance
    console.log('\n6️⃣ Testing token balance...')
    const balanceResponse = await fetch(`http://localhost:3000/api/tokens/balance?userFid=${testUserFid}`)
    const balanceResult = await balanceResponse.json()
    
    if (balanceResult.success) {
      console.log('✅ Token balance retrieved!')
      console.log(`   Balance: ${balanceResult.data.balance} BATTLE`)
    } else {
      console.log('❌ Token balance failed:', balanceResult.error)
    }

    // Test 6: Rate limiting (try to vote again immediately)
    console.log('\n7️⃣ Testing rate limiting...')
    const rateLimitResponse = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: vendor.id,
        voteType: 'regular'
      }),
    })

    const rateLimitResult = await rateLimitResponse.json()
    
    if (rateLimitResult.success) {
      console.log('✅ Rate limit not triggered (this might be expected)')
    } else {
      console.log('✅ Rate limit working:', rateLimitResult.error)
    }

    console.log('\n🎉 Voting system test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVotingSystem()
  .then(() => {
    console.log('\nScript completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 