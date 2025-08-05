// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

// Now import the services
import { VotingService } from '../src/services/voting'

async function testVotingService() {
  console.log('🧪 Testing VotingService with fallback to mock data...')

  try {
    // Test 1: Register a vote for a mock vendor
    console.log('\n📝 Test 1: Registering vote for Pupusas María...')
    const voteResult = await VotingService.registerVote({
      userFid: '12345',
      vendorId: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
      voteType: 'regular'
    })

    console.log('✅ Vote result:', voteResult)

    // Test 2: Register a verified vote
    console.log('\n📸 Test 2: Registering verified vote for Tacos El Rey...')
    const verifiedVoteResult = await VotingService.registerVote({
      userFid: '12346',
      vendorId: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Tacos El Rey
      voteType: 'verified',
      photoUrl: 'https://example.com/photo.jpg',
      gpsLocation: { lat: 19.4326, lng: -99.1332 },
      verificationConfidence: 0.95
    })

    console.log('✅ Verified vote result:', verifiedVoteResult)

    // Test 3: Get vendor stats
    console.log('\n📊 Test 3: Getting vendor stats...')
    const vendorStats = await VotingService.getVendorVoteStats('772cdbda-2cbb-4c67-a73a-3656bf02a4c1')
    console.log('✅ Vendor stats:', vendorStats)

    // Test 4: Get user vote history
    console.log('\n📜 Test 4: Getting user vote history...')
    const voteHistory = await VotingService.getUserVoteHistory('12345', 10)
    console.log('✅ Vote history length:', voteHistory.length)

    // Test 5: Calculate tokens
    console.log('\n💰 Test 5: Calculating tokens...')
    const tokenCalculation = await VotingService.calculateTokens('12345', '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', 'regular')
    console.log('✅ Token calculation:', tokenCalculation)

    // Test 6: Try to vote for non-existent vendor
    console.log('\n❌ Test 6: Trying to vote for non-existent vendor...')
    const invalidVoteResult = await VotingService.registerVote({
      userFid: '12345',
      vendorId: 'non-existent-vendor-id',
      voteType: 'regular'
    })

    console.log('✅ Invalid vote result:', invalidVoteResult)

    console.log('\n🎉 All tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVotingService() 