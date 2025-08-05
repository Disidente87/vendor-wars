// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function testStreakSimple() {
  console.log('🧪 Testing Streak Behavior (Simple Test)...\n')

  const testUserFid = '77777' // Use a different user ID
  const testVendorId = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1' // Pupusas María

  // Test 1: Check current streak
  console.log('1️⃣ Checking current streak...')
  try {
    const streakResponse = await fetch(`http://localhost:3000/api/users/streak?userFid=${testUserFid}`)
    const streakResult = await streakResponse.json()
    
    if (streakResult.success) {
      console.log(`   Current streak: ${streakResult.data.streak}`)
    } else {
      console.log(`   Error getting streak: ${streakResult.error}`)
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 2: First vote of the day (regular vote)
  console.log('\n2️⃣ Testing first vote of the day (regular vote)...')
  try {
    const response1 = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: testVendorId,
        voteType: 'regular', // Only regular vote, no photo required
      }),
    })

    const result1 = await response1.json()
    
    if (result1.success) {
      console.log(`✅ First vote successful: ${result1.data.tokensEarned} tokens earned`)
      console.log(`   Streak bonus: ${result1.data.streakBonus} tokens`)
      console.log(`   New balance: ${result1.data.newBalance} tokens`)
    } else {
      console.log(`❌ First vote failed: ${result1.error}`)
      if (result1.error.includes('duplicate')) {
        console.log(`   (This is expected if user already voted today)`)
      }
    }
  } catch (error) {
    console.log(`❌ Error in first vote: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 3: Check streak after first vote
  console.log('\n3️⃣ Checking streak after first vote...')
  try {
    const streakResponse2 = await fetch(`http://localhost:3000/api/users/streak?userFid=${testUserFid}`)
    const streakResult2 = await streakResponse2.json()
    
    if (streakResult2.success) {
      console.log(`   Streak after first vote: ${streakResult2.data.streak}`)
    } else {
      console.log(`   Error getting streak: ${streakResult2.error}`)
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 4: Try to vote again with different vendor (should not affect streak)
  console.log('\n4️⃣ Testing second vote with different vendor (should not affect streak)...')
  try {
    const response2 = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Tacos El Rey
        voteType: 'regular',
      }),
    })

    const result2 = await response2.json()
    
    if (result2.success) {
      console.log(`✅ Second vote successful: ${result2.data.tokensEarned} tokens earned`)
      console.log(`   Streak bonus: ${result2.data.streakBonus} tokens`)
    } else {
      console.log(`❌ Second vote failed: ${result2.error}`)
      if (result2.error.includes('duplicate')) {
        console.log(`   ✅ Correctly prevented duplicate vote for same vendor`)
      }
    }
  } catch (error) {
    console.log(`❌ Error in second vote: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 5: Check streak after second vote attempt
  console.log('\n5️⃣ Checking streak after second vote attempt...')
  try {
    const streakResponse3 = await fetch(`http://localhost:3000/api/users/streak?userFid=${testUserFid}`)
    const streakResult3 = await streakResponse3.json()
    
    if (streakResult3.success) {
      console.log(`   Streak after second vote attempt: ${streakResult3.data.streak}`)
    } else {
      console.log(`   Error getting streak: ${streakResult3.error}`)
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  console.log('\n🎉 Simple Streak Test completed!')
  console.log('\n📋 Expected Behavior:')
  console.log('✅ First vote should increment streak (if first vote of day)')
  console.log('✅ Second vote should not affect streak (same day)')
  console.log('✅ Streak should remain consistent throughout the day')
  console.log('✅ System should prevent duplicate votes per vendor')
}

// Run the test
testStreakSimple().catch(console.error) 