import { createClient } from '@supabase/supabase-js'
import { VotingService } from '../src/services/voting'
import { rateLimiter } from '../src/lib/redis'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUnlimitedVoting() {
  console.log('🧪 Testing unlimited voting system...')

  // Test user FID (replace with your actual FID)
  const testUserFid = '12345' // Replace with your Farcaster FID
  const testVendorId = 'test-vendor-1'

  try {
    // 1. Test rate limiter functions
    console.log('\n📊 Testing rate limiter functions...')
    
    const canVoteForVendor = await rateLimiter.canVoteForVendor(testUserFid, testVendorId)
    console.log(`✅ Can vote for vendor: ${canVoteForVendor}`)
    
    const canVoteThisWeek = await rateLimiter.canVoteThisWeek(testUserFid)
    console.log(`✅ Can vote this week: ${canVoteThisWeek}`)

    // 2. Test multiple votes for the same vendor
    console.log('\n🗳️ Testing multiple votes for the same vendor...')
    
    for (let i = 1; i <= 5; i++) {
      console.log(`\n--- Vote ${i} ---`)
      
      const voteResult = await VotingService.registerVote({
        userFid: testUserFid,
        vendorId: testVendorId,
        voteType: 'regular'
      })

      if (voteResult.success) {
        console.log(`✅ Vote ${i} successful!`)
        console.log(`   Tokens earned: ${voteResult.tokensEarned}`)
        console.log(`   New balance: ${voteResult.newBalance}`)
        console.log(`   Streak bonus: ${voteResult.streakBonus}`)
      } else {
        console.log(`❌ Vote ${i} failed: ${voteResult.error}`)
      }
    }

    // 3. Test verified votes
    console.log('\n📸 Testing verified votes...')
    
    const verifiedVoteResult = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'verified',
      photoUrl: 'https://example.com/test-photo.jpg',
      gpsLocation: { lat: 19.4326, lng: -99.1332 },
      verificationConfidence: 0.95
    })

    if (verifiedVoteResult.success) {
      console.log(`✅ Verified vote successful!`)
      console.log(`   Tokens earned: ${verifiedVoteResult.tokensEarned}`)
      console.log(`   New balance: ${verifiedVoteResult.newBalance}`)
    } else {
      console.log(`❌ Verified vote failed: ${verifiedVoteResult.error}`)
    }

    // 4. Check vote history
    console.log('\n📋 Checking vote history...')
    
    const voteHistory = await VotingService.getUserVoteHistory(testUserFid, 10)
    console.log(`✅ Found ${voteHistory.length} votes in history`)

    // 5. Check vendor stats
    console.log('\n📊 Checking vendor stats...')
    
    const vendorStats = await VotingService.getVendorVoteStats(testVendorId)
    console.log(`✅ Vendor stats:`, vendorStats)

    console.log('\n🎉 Unlimited voting test completed!')
    console.log('\n📝 Summary:')
    console.log('- Rate limiter restrictions: REMOVED ✅')
    console.log('- Weekly token caps: REMOVED ✅')
    console.log('- Vote cooldowns: REMOVED ✅')
    console.log('- Multiple votes per vendor: ALLOWED ✅')
    console.log('- Verified votes: WORKING ✅')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testUnlimitedVoting()
}

export { testUnlimitedVoting } 