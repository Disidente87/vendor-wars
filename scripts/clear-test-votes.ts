import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearTestVotes() {
  console.log('🧹 Clearing test votes from database...')

  try {
    // Clear votes for test user
    const testUserFid = '12345' // Replace with your Farcaster FID
    
    console.log(`🗑️ Deleting votes for user FID: ${testUserFid}`)
    
    const { data: deletedVotes, error: votesError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_fid', testUserFid)
      .select()

    if (votesError) {
      console.error('❌ Error deleting votes:', votesError)
      return
    }

    console.log(`✅ Deleted ${deletedVotes?.length || 0} votes`)

    // Clear attestations for test user
    console.log(`🗑️ Deleting attestations for user FID: ${testUserFid}`)
    
    const { data: deletedAttestations, error: attestationsError } = await supabase
      .from('attestations')
      .delete()
      .eq('user_fid', testUserFid)
      .select()

    if (attestationsError) {
      console.error('❌ Error deleting attestations:', attestationsError)
      return
    }

    console.log(`✅ Deleted ${deletedAttestations?.length || 0} attestations`)

    // Clear Redis cache for test user
    console.log('🗑️ Clearing Redis cache for test user...')
    
    // Note: This would require Redis client access
    // For now, we'll just note that Redis cache should be cleared manually
    console.log('⚠️  Note: Redis cache may need to be cleared manually')
    console.log('   You can clear it by restarting the Redis service or using Redis CLI')

    console.log('\n🎉 Test data cleared successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Update your Farcaster FID in the test script')
    console.log('2. Run: npm run test:unlimited-voting')
    console.log('3. Test the voting system in your Farcaster app')

  } catch (error) {
    console.error('❌ Error clearing test data:', error)
  }
}

// Run cleanup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearTestVotes()
}

export { clearTestVotes } 
clearTestVotes() 