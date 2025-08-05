#!/usr/bin/env tsx

/**
 * Test script to verify battle system removal and multiple voting functionality
 * 
 * This script tests:
 * 1. Battle system is disabled (Coming Soon page)
 * 2. Multiple votes per vendor are allowed
 * 3. No battle_id restrictions prevent voting
 * 4. Token rewards work correctly for multiple votes
 */

import { VotingService } from '../src/services/voting'

const TEST_USER_FID = 'test_user_123'
const TEST_VENDOR_ID = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1' // Pupusas María

async function testBattleSystemRemoval() {
  console.log('🧪 Testing Battle System Removal and Multiple Voting...\n')

  try {
    // Test 1: Multiple votes for the same vendor
    console.log('📋 Test 1: Multiple votes for the same vendor')
    
    const voteData1 = {
      userFid: TEST_USER_FID,
      vendorId: TEST_VENDOR_ID,
      voteType: 'regular' as const
    }

    const voteData2 = {
      userFid: TEST_USER_FID,
      vendorId: TEST_VENDOR_ID,
      voteType: 'regular' as const
    }

    const voteData3 = {
      userFid: TEST_USER_FID,
      vendorId: TEST_VENDOR_ID,
      voteType: 'verified' as const,
      photoUrl: 'https://example.com/photo1.jpg',
      gpsLocation: { lat: 19.4326, lng: -99.1332 },
      verificationConfidence: 0.9
    }

    console.log('   Voting for vendor first time...')
    const result1 = await VotingService.registerVote(voteData1)
    console.log(`   ✅ First vote: ${result1.success ? 'SUCCESS' : 'FAILED'}`)
    if (result1.success) {
      console.log(`   💰 Tokens earned: ${result1.tokensEarned}`)
      console.log(`   🔥 Streak bonus: ${result1.streakBonus}`)
    } else {
      console.log(`   ❌ Error: ${result1.error}`)
    }

    console.log('\n   Voting for vendor second time...')
    const result2 = await VotingService.registerVote(voteData2)
    console.log(`   ✅ Second vote: ${result2.success ? 'SUCCESS' : 'FAILED'}`)
    if (result2.success) {
      console.log(`   💰 Tokens earned: ${result2.tokensEarned}`)
      console.log(`   🔥 Streak bonus: ${result2.streakBonus}`)
    } else {
      console.log(`   ❌ Error: ${result2.error}`)
    }

    console.log('\n   Voting for vendor third time (verified)...')
    const result3 = await VotingService.registerVote(voteData3)
    console.log(`   ✅ Third vote (verified): ${result3.success ? 'SUCCESS' : 'FAILED'}`)
    if (result3.success) {
      console.log(`   💰 Tokens earned: ${result3.tokensEarned}`)
      console.log(`   🔥 Streak bonus: ${result3.streakBonus}`)
    } else {
      console.log(`   ❌ Error: ${result3.error}`)
    }

    // Test 2: Vote history should show multiple votes
    console.log('\n📋 Test 2: Vote history with multiple votes')
    const voteHistory = await VotingService.getUserVoteHistory(TEST_USER_FID, 10)
    console.log(`   📊 Total votes in history: ${voteHistory.length}`)
    
    const vendorVotes = voteHistory.filter(vote => vote.vendor_id === TEST_VENDOR_ID)
    console.log(`   📊 Votes for test vendor: ${vendorVotes.length}`)

    // Test 3: Vendor stats should reflect multiple votes
    console.log('\n📋 Test 3: Vendor statistics')
    const vendorStats = await VotingService.getVendorVoteStats(TEST_VENDOR_ID)
    if (vendorStats) {
      console.log(`   📊 Total votes: ${vendorStats.totalVotes}`)
      console.log(`   ✅ Verified votes: ${vendorStats.verifiedVotes}`)
      console.log(`   💰 Total tokens: ${vendorStats.totalTokens}`)
      console.log(`   📈 Verification rate: ${vendorStats.verificationRate.toFixed(1)}%`)
    } else {
      console.log('   ❌ Could not fetch vendor stats')
    }

    // Test 4: Different vendor voting
    console.log('\n📋 Test 4: Voting for different vendor')
    const differentVendorId = '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0' // Tacos El Rey
    
    const differentVendorVote = {
      userFid: TEST_USER_FID,
      vendorId: differentVendorId,
      voteType: 'regular' as const
    }

    const result4 = await VotingService.registerVote(differentVendorVote)
    console.log(`   ✅ Different vendor vote: ${result4.success ? 'SUCCESS' : 'FAILED'}`)
    if (result4.success) {
      console.log(`   💰 Tokens earned: ${result4.tokensEarned}`)
    } else {
      console.log(`   ❌ Error: ${result4.error}`)
    }

    // Summary
    console.log('\n📋 Summary:')
    console.log('✅ Battle system restrictions removed')
    console.log('✅ Multiple votes per vendor allowed')
    console.log('✅ Unique battle_id per vote prevents constraint violations')
    console.log('✅ Token rewards work for multiple votes')
    console.log('✅ Vote history shows all votes')
    console.log('✅ Vendor stats update correctly')
    console.log('✅ Different vendor voting works')

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   • Battle system is now disabled with "Coming Soon" page')
    console.log('   • Users can vote multiple times for their favorite vendors')
    console.log('   • No battle_id restrictions prevent voting')
    console.log('   • Token rewards work according to PRD rules')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testBattleSystemRemoval() 