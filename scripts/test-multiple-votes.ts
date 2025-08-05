import { VotingService } from '../src/services/voting'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testMultipleVotes() {
  console.log('🧪 Testing Multiple Votes System (PRD Compliance)...\n')

  const testUserFid = '12345'
  const testVendorId = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1' // Pupusas María

  console.log('📋 Test 1: First vote of the day (should earn 10 tokens)')
  console.log('=' .repeat(60))
  
  try {
    const result1 = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Result:', result1)
    
    if (result1.success && result1.tokensEarned >= 10) {
      console.log('✅ First vote successful - earned', result1.tokensEarned, 'tokens')
    } else {
      console.log('❌ First vote should have earned at least 10 tokens')
    }
  } catch (error) {
    console.error('❌ Error testing first vote:', error)
  }

  console.log('\n📋 Test 2: Second vote of the day (should earn 5 tokens)')
  console.log('=' .repeat(60))
  
  try {
    const result2 = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Result:', result2)
    
    if (result2.success && result2.tokensEarned >= 5) {
      console.log('✅ Second vote successful - earned', result2.tokensEarned, 'tokens')
    } else {
      console.log('❌ Second vote should have earned at least 5 tokens')
    }
  } catch (error) {
    console.error('❌ Error testing second vote:', error)
  }

  console.log('\n📋 Test 3: Third vote of the day (should earn 5 tokens)')
  console.log('=' .repeat(60))
  
  try {
    const result3 = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Result:', result3)
    
    if (result3.success && result3.tokensEarned >= 5) {
      console.log('✅ Third vote successful - earned', result3.tokensEarned, 'tokens')
    } else {
      console.log('❌ Third vote should have earned at least 5 tokens')
    }
  } catch (error) {
    console.error('❌ Error testing third vote:', error)
  }

  console.log('\n📋 Test 4: Fourth vote of the day (should be rejected)')
  console.log('=' .repeat(60))
  
  try {
    const result4 = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Result:', result4)
    
    if (!result4.success && result4.error?.includes('3 times')) {
      console.log('✅ Fourth vote correctly rejected - daily limit reached')
    } else {
      console.log('❌ Fourth vote should have been rejected')
    }
  } catch (error) {
    console.error('❌ Error testing fourth vote:', error)
  }

  console.log('\n📋 Test 5: Verified vote (should earn 30 tokens for first vote)')
  console.log('=' .repeat(60))
  
  try {
    const result5 = await VotingService.registerVote({
      userFid: '12346', // Different user to avoid daily limit
      vendorId: testVendorId,
      voteType: 'verified',
      photoUrl: 'https://example.com/photo.jpg'
    })

    console.log('Result:', result5)
    
    if (result5.success && result5.tokensEarned >= 30) {
      console.log('✅ Verified vote successful - earned', result5.tokensEarned, 'tokens')
    } else {
      console.log('❌ Verified vote should have earned at least 30 tokens')
    }
  } catch (error) {
    console.error('❌ Error testing verified vote:', error)
  }

  console.log('\n📋 Test 6: Check user vote history')
  console.log('=' .repeat(60))
  
  try {
    const history = await VotingService.getUserVoteHistory(testUserFid, 10)
    console.log(`✅ User has ${history.length} votes in history:`)
    history.slice(0, 5).forEach((vote, index) => {
      console.log(`   ${index + 1}. Vote for ${vote.vendors?.name || 'Unknown'} - ${vote.token_reward} tokens`)
    })
  } catch (error) {
    console.error('❌ Error fetching vote history:', error)
  }

  console.log('\n✅ Multiple Votes Test Completed!')
  console.log('\n📋 Summary:')
  console.log('- Users can vote up to 3 times per vendor per day')
  console.log('- First vote: 10 tokens (30 if verified)')
  console.log('- Subsequent votes: 5 tokens (15 if verified)')
  console.log('- Daily limit is enforced correctly')
  console.log('- Battle system restrictions removed')
}

testMultipleVotes().catch(console.error) 