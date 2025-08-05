// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

// Now import the services
import { VotingService } from '../src/services/voting'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testVotingService() {
  console.log('🧪 Testing Updated VotingService...\n')

  const testUserFid = '12345'
  const testVendorId = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1' // Pupusas María (user already voted)
  const testVendorId2 = 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28' // Sushi Express (user already voted)

  console.log('📋 Test 1: Try to vote for vendor where user already voted')
  console.log('=' .repeat(60))
  
  try {
    const result1 = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Result:', result1)
    
    if (!result1.success && result1.error?.includes('already voted')) {
      console.log('✅ Correctly prevented duplicate vote')
    } else {
      console.log('❌ Should have prevented duplicate vote')
    }
  } catch (error) {
    console.error('❌ Error testing duplicate vote:', error)
  }

  console.log('\n📋 Test 2: Try to vote for different vendor (should work)')
  console.log('=' .repeat(60))
  
  try {
    const result2 = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: '525c09b3-dc92-409b-a11d-896bcf4d15b2', // Café Aroma (check if user hasn't voted)
      voteType: 'regular'
    })

    console.log('Result:', result2)
    
    if (result2.success) {
      console.log('✅ Vote registered successfully')
    } else {
      console.log('❌ Vote should have been registered')
    }
  } catch (error) {
    console.error('❌ Error testing new vote:', error)
  }

  console.log('\n📋 Test 3: Check user vote history')
  console.log('=' .repeat(60))
  
  try {
    const history = await VotingService.getUserVoteHistory(testUserFid, 5)
    console.log(`✅ User has ${history.length} recent votes:`)
    history.forEach((vote, index) => {
      console.log(`   ${index + 1}. Vote for ${vote.vendors?.name || 'Unknown'} - ${vote.token_reward} tokens`)
    })
  } catch (error) {
    console.error('❌ Error fetching vote history:', error)
  }

  console.log('\n✅ VotingService Test Completed!')
}

testVotingService().catch(console.error) 