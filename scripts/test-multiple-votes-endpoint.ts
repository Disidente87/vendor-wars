import fetch from 'node-fetch'

console.log('🧪 Testing Multiple Votes via API Endpoint...\n')

async function testMultipleVotesEndpoint() {
  const testUserFid = '12345'
  const testVendorId = 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28' // Sushi Express

  console.log('📋 Test Configuration:')
  console.log(`   - User FID: ${testUserFid}`)
  console.log(`   - Vendor ID: ${testVendorId}`)
  console.log(`   - Vendor Name: Sushi Express`)
  console.log('')

  // Test multiple votes
  for (let voteNumber = 1; voteNumber <= 4; voteNumber++) {
    console.log(`📋 Test ${voteNumber}: Attempting vote #${voteNumber}`)
    console.log('=' .repeat(50))

    try {
      const response = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: testVendorId,
          userFid: testUserFid,
          voteType: 'regular',
          photoUrl: undefined,
          gpsLocation: undefined
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Vote successful!')
        console.log(`   - Tokens earned: ${result.data.tokensEarned}`)
        console.log(`   - New balance: ${result.data.newBalance}`)
        console.log(`   - Streak bonus: ${result.data.streakBonus}`)
        console.log(`   - Territory bonus: ${result.data.territoryBonus}`)
        console.log(`   - Vote ID: ${result.data.voteId}`)
      } else {
        console.log('❌ Vote failed!')
        console.log(`   - Error: ${result.error}`)
        
        if (voteNumber === 4) {
          console.log('   ✅ Expected behavior: Limit of 3 votes per vendor per day reached')
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error)
    }

    console.log('')
    
    // Wait a bit between votes
    if (voteNumber < 4) {
      console.log('⏳ Waiting 2 seconds before next vote...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('')
    }
  }

  console.log('✅ Multiple Votes Endpoint Test Completed!')
  console.log('\n📋 Expected Results:')
  console.log('   - Votes 1-3: Should succeed with increasing tokens (10, 15, 20)')
  console.log('   - Vote 4: Should fail with "already voted 3 times" message')
  console.log('   - All successful votes should be recorded in database')
  console.log('   - Battle IDs should alternate between vendor-specific and generic')
}

// Run the test
testMultipleVotesEndpoint().catch(console.error) 