// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function testStreakIncrement() {
  console.log('🧪 Testing Streak Increment After Voting...\n')

  const testUserFid = '12345'
  
  // Test 1: Check initial streak
  console.log('1️⃣ Checking initial streak...')
  try {
    const response = await fetch('http://localhost:3000/api/users/streak/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userFid: testUserFid }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`📊 Initial streak: ${result.data.streak}`)
    } else {
      console.log(`❌ Streak check failed: ${result.error}`)
      return
    }
  } catch (error) {
    console.log(`❌ Error checking streak: ${error.message}`)
    return
  }

  // Test 2: Vote to increment streak
  console.log('\n2️⃣ Voting to increment streak...')
  try {
    const voteResponse = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
        voteType: 'regular',
      }),
    })

    const voteResult = await voteResponse.json()
    
    if (voteResult.success) {
      console.log(`✅ Vote successful!`)
      console.log(`💰 Tokens earned: ${voteResult.data.tokensEarned}`)
      console.log(`🔥 Streak bonus: ${voteResult.data.streakBonus}`)
    } else {
      console.log(`❌ Vote failed: ${voteResult.error}`)
      return
    }
  } catch (error) {
    console.log(`❌ Error voting: ${error.message}`)
    return
  }

  // Test 3: Check streak after voting
  console.log('\n3️⃣ Checking streak after voting...')
  try {
    const response = await fetch('http://localhost:3000/api/users/streak/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userFid: testUserFid }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`📊 Streak after voting: ${result.data.streak}`)
      if (result.data.streak > 0) {
        console.log(`✅ Streak incremented successfully!`)
      } else {
        console.log(`❌ Streak did not increment`)
      }
    } else {
      console.log(`❌ Streak check failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Error checking streak: ${error.message}`)
  }

  console.log('\n🎉 Streak increment test completed!')
}

// Run the test
testStreakIncrement().catch(console.error) 