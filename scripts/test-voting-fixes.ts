import { VotingService } from '../src/services/voting'
import { VendorService } from '../src/services/vendors'
import { streakManager } from '../src/lib/redis'

async function testVotingSystem() {
  console.log('🧪 Testing Voting System Fixes...\n')

  // Test 1: Vendor lookup
  console.log('1️⃣ Testing vendor lookup...')
  const testVendorIds = [
    '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
    '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Tacos El Rey
    '525c09b3-dc92-409b-a11d-896bcf4d15b2', // Café Aroma
    'invalid-id', // Should fail
  ]

  for (const vendorId of testVendorIds) {
    const vendor = await VendorService.getVendor(vendorId)
    if (vendor) {
      console.log(`✅ Found vendor: ${vendor.name} (${vendorId})`)
    } else {
      console.log(`❌ Vendor not found: ${vendorId}`)
    }
  }

  // Test 2: Streak management
  console.log('\n2️⃣ Testing streak management...')
  const testUserFid = '12345'
  
  // Reset streak first
  await streakManager.resetStreak(testUserFid)
  let currentStreak = await streakManager.getVoteStreak(testUserFid)
  console.log(`📊 Initial streak: ${currentStreak}`)

  // Simulate voting today
  const newStreak = await streakManager.incrementStreak(testUserFid)
  console.log(`📊 After voting today: ${newStreak}`)

  // Test 3: Voting process
  console.log('\n3️⃣ Testing voting process...')
  const voteData = {
    userFid: testUserFid,
    vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
    voteType: 'regular' as const,
  }

  const voteResult = await VotingService.registerVote(voteData)
  
  if (voteResult.success) {
    console.log(`✅ Vote successful!`)
    console.log(`💰 Tokens earned: ${voteResult.tokensEarned}`)
    console.log(`📊 New balance: ${voteResult.newBalance}`)
    console.log(`🔥 Streak bonus: ${voteResult.streakBonus}`)
  } else {
    console.log(`❌ Vote failed: ${voteResult.error}`)
  }

  // Test 4: Invalid vendor vote
  console.log('\n4️⃣ Testing invalid vendor vote...')
  const invalidVoteData = {
    userFid: testUserFid,
    vendorId: 'invalid-vendor-id',
    voteType: 'regular' as const,
  }

  const invalidVoteResult = await VotingService.registerVote(invalidVoteData)
  
  if (!invalidVoteResult.success) {
    console.log(`✅ Correctly rejected invalid vendor: ${invalidVoteResult.error}`)
  } else {
    console.log(`❌ Should have rejected invalid vendor`)
  }

  console.log('\n🎉 Voting system test completed!')
}

// Run the test
testVotingSystem().catch(console.error) 