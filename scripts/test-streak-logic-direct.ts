// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'
import { streakManager } from '../src/lib/redis'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function testStreakLogicDirect() {
  console.log('🧪 Testing Streak Logic Directly in Redis...\n')

  const testUserFid = '99999' // Use a different user ID

  // Test 1: Check initial streak
  console.log('1️⃣ Checking initial streak...')
  try {
    const initialStreak = await streakManager.getVoteStreak(testUserFid)
    console.log(`   Initial streak: ${initialStreak}`)
  } catch (error) {
    console.log(`   Error getting initial streak: ${error.message}`)
  }

  // Test 2: First increment of the day
  console.log('\n2️⃣ Testing first increment of the day...')
  try {
    const firstStreak = await streakManager.incrementStreak(testUserFid)
    console.log(`   First increment result: ${firstStreak}`)
  } catch (error) {
    console.log(`   Error in first increment: ${error.message}`)
  }

  // Test 3: Second increment of the same day (should not change)
  console.log('\n3️⃣ Testing second increment of the same day...')
  try {
    const secondStreak = await streakManager.incrementStreak(testUserFid)
    console.log(`   Second increment result: ${secondStreak}`)
  } catch (error) {
    console.log(`   Error in second increment: ${error.message}`)
  }

  // Test 4: Third increment of the same day (should not change)
  console.log('\n4️⃣ Testing third increment of the same day...')
  try {
    const thirdStreak = await streakManager.incrementStreak(testUserFid)
    console.log(`   Third increment result: ${thirdStreak}`)
  } catch (error) {
    console.log(`   Error in third increment: ${error.message}`)
  }

  // Test 5: Get current streak
  console.log('\n5️⃣ Getting current streak...')
  try {
    const currentStreak = await streakManager.getVoteStreak(testUserFid)
    console.log(`   Current streak: ${currentStreak}`)
  } catch (error) {
    console.log(`   Error getting current streak: ${error.message}`)
  }

  console.log('\n🎉 Direct Streak Logic Test completed!')
  console.log('\n📋 Expected Behavior:')
  console.log('✅ First increment should increase streak (1 or previous + 1)')
  console.log('✅ Second increment should return same streak')
  console.log('✅ Third increment should return same streak')
  console.log('✅ All increments on same day should return same value')
}

// Run the test
testStreakLogicDirect().catch(console.error) 