import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function deleteAllUserVotes() {
  console.log('🗑️  Deleting all votes for test user...\n')

  try {
    const testUserFid = '12345'

    console.log(`👤 Deleting all votes for user FID: ${testUserFid}`)

    // Delete all votes for the test user
    const { data: deletedVotes, error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_fid', testUserFid)
      .select()

    if (deleteError) {
      console.error('❌ Error deleting votes:', deleteError)
      return
    }

    console.log(`✅ Deleted ${deletedVotes?.length || 0} votes for user ${testUserFid}`)
    
    if (deletedVotes && deletedVotes.length > 0) {
      console.log('📋 Deleted votes:')
      deletedVotes.forEach((vote, index) => {
        console.log(`  ${index + 1}. Vote ID: ${vote.id}`)
        console.log(`     - Battle ID: ${vote.battle_id}`)
        console.log(`     - Vendor ID: ${vote.vendor_id}`)
        console.log(`     - Verified: ${vote.is_verified}`)
        console.log(`     - Tokens: ${vote.token_reward}`)
      })
    }

    // Also delete any related attestations
    const { data: deletedAttestations, error: attestationError } = await supabase
      .from('attestations')
      .delete()
      .eq('user_fid', testUserFid)
      .select()

    if (attestationError) {
      console.error('❌ Error deleting attestations:', attestationError)
    } else {
      console.log(`✅ Deleted ${deletedAttestations?.length || 0} attestations for user ${testUserFid}`)
    }

    // Verify all votes are gone
    console.log('\n🔍 Verifying deletion...')
    const { data: remainingVotes, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', testUserFid)

    if (checkError) {
      console.error('❌ Error checking remaining votes:', checkError)
      return
    }

    console.log(`📊 Remaining votes for user ${testUserFid}: ${remainingVotes?.length || 0}`)

    if (remainingVotes && remainingVotes.length === 0) {
      console.log('🎉 SUCCESS: All votes deleted! You can now vote again.')
    } else {
      console.log('⚠️  Some votes still remain')
    }

    console.log('\n✅ Deletion completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

deleteAllUserVotes() 