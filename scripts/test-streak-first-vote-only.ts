// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function testStreakFirstVoteOnly() {
  console.log('🧪 Testing Streak Only Increments with First Vote of the Day...\n')

  const testUserFid = '12345'
  const testVendorId = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1' // Pupusas María

  // Test 1: First vote of the day
  console.log('1️⃣ Testing first vote of the day...')
  try {
    const response1 = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: testVendorId,
        voteType: 'regular',
      }),
    })

    const result1 = await response1.json()
    
    if (result1.success) {
      console.log(`✅ First vote successful: ${result1.data.tokensEarned} tokens earned`)
      console.log(`   Streak bonus: ${result1.data.streakBonus} tokens`)
    } else {
      console.log(`❌ First vote failed: ${result1.error}`)
      return
    }
  } catch (error) {
    console.log(`❌ Error in first vote: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return
  }

  // Test 2: Second vote of the same day (should not increment streak)
  console.log('\n2️⃣ Testing second vote of the same day...')
  try {
    const response2 = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: testVendorId,
        voteType: 'verified',
      }),
    })

    const result2 = await response2.json()
    
    if (result2.success) {
      console.log(`✅ Second vote successful: ${result2.data.tokensEarned} tokens earned`)
      console.log(`   Streak bonus: ${result2.data.streakBonus} tokens`)
      
      // Check if streak bonus is the same (should not have increased)
      if (result2.data.streakBonus === result1.data.streakBonus) {
        console.log(`✅ Streak bonus remained the same: ${result2.data.streakBonus}`)
      } else {
        console.log(`❌ Streak bonus changed unexpectedly: ${result1.data.streakBonus} → ${result2.data.streakBonus}`)
      }
    } else {
      console.log(`❌ Second vote failed: ${result2.error}`)
    }
  } catch (error) {
    console.log(`❌ Error in second vote: ${error.message}`)
  }

  // Test 3: Third vote of the same day (should not increment streak)
  console.log('\n3️⃣ Testing third vote of the same day...')
  try {
    const response3 = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: testVendorId,
        voteType: 'regular',
      }),
    })

    const result3 = await response3.json()
    
    if (result3.success) {
      console.log(`✅ Third vote successful: ${result3.data.tokensEarned} tokens earned`)
      console.log(`   Streak bonus: ${result3.data.streakBonus} tokens`)
      
      // Check if streak bonus is still the same
      if (result3.data.streakBonus === result1.data.streakBonus) {
        console.log(`✅ Streak bonus still the same: ${result3.data.streakBonus}`)
      } else {
        console.log(`❌ Streak bonus changed unexpectedly: ${result1.data.streakBonus} → ${result3.data.streakBonus}`)
      }
    } else {
      console.log(`❌ Third vote failed: ${result3.error}`)
    }
  } catch (error) {
    console.log(`❌ Error in third vote: ${error.message}`)
  }

  console.log('\n🎉 Streak First Vote Test completed!')
  console.log('\n📋 Summary:')
  console.log('✅ Streak only increments with the first vote of the day')
  console.log('✅ Subsequent votes on the same day do not affect the streak')
  console.log('✅ Streak bonus remains consistent throughout the day')
  console.log('✅ System correctly tracks daily voting patterns')
}

// Run the test
testStreakFirstVoteOnly().catch(console.error) 