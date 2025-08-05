import { VotingService } from '../src/services/voting'

async function testSimpleVote() {
  console.log('🧪 Testing Simple Vote Import...')
  
  try {
    console.log('✅ VotingService imported successfully')
    
    // Test basic vote registration
    const result = await VotingService.registerVote({
      userFid: '12345',
      vendorId: 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28',
      voteType: 'regular'
    })
    
    console.log('✅ Vote registration result:', result)
    
  } catch (error) {
    console.error('❌ Error testing vote:', error)
  }
}

testSimpleVote() 