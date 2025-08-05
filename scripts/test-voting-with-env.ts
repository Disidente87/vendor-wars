// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

// Now import the services
import { VotingService } from '../src/services/voting'
import { VendorService } from '../src/services/vendors'
import { streakManager } from '../src/lib/redis'

async function testVotingWithEnv() {
  console.log('🧪 Testing Voting System with Environment Variables...\n')
  
  // Check if environment variables are loaded
  console.log('🔧 Environment check:')
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Redis URL: ${process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Redis Token: ${process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ Missing'}`)
  console.log('')

  // Test 1: Vendor lookup with real Supabase
  console.log('1️⃣ Testing vendor lookup with Supabase...')
  const testVendorIds = [
    '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
    '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Tacos El Rey
    '525c09b3-dc92-409b-a11d-896bcf4d15b2', // Café Aroma
  ]

  for (const vendorId of testVendorIds) {
    try {
      const vendor = await VendorService.getVendor(vendorId)
      if (vendor) {
        console.log(`✅ Found vendor: ${vendor.name} (${vendorId})`)
      } else {
        console.log(`❌ Vendor not found: ${vendorId}`)
      }
    } catch (error) {
      console.log(`❌ Error looking up vendor ${vendorId}:`, error.message)
    }
  }

  // Test 2: Streak management (if Redis is configured)
  console.log('\n2️⃣ Testing streak management...')
  const testUserFid = '12345'
  
  try {
    // Reset streak first
    await streakManager.resetStreak(testUserFid)
    let currentStreak = await streakManager.getVoteStreak(testUserFid)
    console.log(`📊 Initial streak: ${currentStreak}`)

    // Simulate voting today
    const newStreak = await streakManager.incrementStreak(testUserFid)
    console.log(`📊 After voting today: ${newStreak}`)
  } catch (error) {
    console.log(`❌ Redis error (expected if not configured): ${error.message}`)
  }

  // Test 3: Voting process
  console.log('\n3️⃣ Testing voting process...')
  const voteData = {
    userFid: testUserFid,
    vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
    voteType: 'regular' as const,
  }

  try {
    const voteResult = await VotingService.registerVote(voteData)
    
    if (voteResult.success) {
      console.log(`✅ Vote successful!`)
      console.log(`💰 Tokens earned: ${voteResult.tokensEarned}`)
      console.log(`📊 New balance: ${voteResult.newBalance}`)
      console.log(`🔥 Streak bonus: ${voteResult.streakBonus}`)
    } else {
      console.log(`❌ Vote failed: ${voteResult.error}`)
    }
  } catch (error) {
    console.log(`❌ Voting error: ${error.message}`)
  }

  console.log('\n🎉 Voting system test completed!')
}

// Run the test
testVotingWithEnv().catch(console.error) 