import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { VotingService } from '../src/services/voting'

async function testMultipleVotes() {
  console.log('🧪 Testing Multiple Votes System')
  console.log('================================')

  const testUserFid = '497866' // Your FID
  const testVendorId = '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0' // Pupusas María (exists in DB)
  const differentVendorId = '29bbbce7-951c-4877-80bb-d82165f02946' // Pizza Napoli (exists in DB)

  console.log(`\n👤 Test User: ${testUserFid}`)
  console.log(`🏪 Test Vendor: ${testVendorId}`)

  // Test 1: First vote
  console.log('\n🗳️ Test 1: First Vote')
  console.log('----------------------')
  
  const vote1 = await VotingService.registerVote({
    userFid: testUserFid,
    vendorId: testVendorId,
    voteType: 'regular'
  })

  console.log('Result:', vote1.success ? '✅ SUCCESS' : '❌ FAILED')
  if (vote1.success) {
    console.log(`💰 Tokens earned: ${vote1.tokensEarned}`)
    console.log(`💎 New balance: ${vote1.newBalance}`)
  } else {
    console.log(`❌ Error: ${vote1.error}`)
  }

  // Test 2: Second vote
  console.log('\n🗳️ Test 2: Second Vote')
  console.log('----------------------')
  
  const vote2 = await VotingService.registerVote({
    userFid: testUserFid,
    vendorId: testVendorId,
    voteType: 'regular'
  })

  console.log('Result:', vote2.success ? '✅ SUCCESS' : '❌ FAILED')
  if (vote2.success) {
    console.log(`💰 Tokens earned: ${vote2.tokensEarned}`)
    console.log(`💎 New balance: ${vote2.newBalance}`)
  } else {
    console.log(`❌ Error: ${vote2.error}`)
  }

  // Test 3: Third vote
  console.log('\n🗳️ Test 3: Third Vote')
  console.log('----------------------')
  
  const vote3 = await VotingService.registerVote({
    userFid: testUserFid,
    vendorId: testVendorId,
    voteType: 'regular'
  })

  console.log('Result:', vote3.success ? '✅ SUCCESS' : '❌ FAILED')
  if (vote3.success) {
    console.log(`💰 Tokens earned: ${vote3.tokensEarned}`)
    console.log(`💎 New balance: ${vote3.newBalance}`)
  } else {
    console.log(`❌ Error: ${vote3.error}`)
  }

  // Test 4: Fourth vote (should be blocked)
  console.log('\n🗳️ Test 4: Fourth Vote (Should be blocked)')
  console.log('--------------------------------------------')
  
  const vote4 = await VotingService.registerVote({
    userFid: testUserFid,
    vendorId: testVendorId,
    voteType: 'regular'
  })

  console.log('Result:', vote4.success ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY BLOCKED')
  if (!vote4.success) {
    console.log(`✅ Error (expected): ${vote4.error}`)
  } else {
    console.log(`❌ Unexpected success: ${vote4.tokensEarned} tokens earned`)
  }

  // Test 5: Vote for different vendor (should work)
  console.log('\n🗳️ Test 5: Vote for Different Vendor')
  console.log('-------------------------------------')
  
  const vote5 = await VotingService.registerVote({
    userFid: testUserFid,
    vendorId: differentVendorId,
    voteType: 'regular'
  })

  console.log('Result:', vote5.success ? '✅ SUCCESS' : '❌ FAILED')
  if (vote5.success) {
    console.log(`💰 Tokens earned: ${vote5.tokensEarned}`)
    console.log(`💎 New balance: ${vote5.newBalance}`)
  } else {
    console.log(`❌ Error: ${vote5.error}`)
  }

  // Summary
  console.log('\n📊 Test Summary')
  console.log('===============')
  console.log(`✅ Vote 1: ${vote1.success ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Vote 2: ${vote2.success ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Vote 3: ${vote3.success ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Vote 4 (blocked): ${!vote4.success ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Vote 5 (different vendor): ${vote5.success ? 'PASSED' : 'FAILED'}`)

  const totalTokens = (vote1.tokensEarned || 0) + (vote2.tokensEarned || 0) + (vote3.tokensEarned || 0) + (vote5.tokensEarned || 0)
  console.log(`\n💰 Total tokens earned in this test: ${totalTokens}`)
}

testMultipleVotes().catch(console.error) 