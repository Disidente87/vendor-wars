import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function clearTestVotes() {
  console.log('🧹 Clearing test votes...\n')

  try {
    const testUserFid = '12345'
    const defaultBattleId = '216b4979-c7e4-44db-a002-98860913639c'

    // Delete votes for the test user in the default battle
    const { data: deletedVotes, error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_fid', testUserFid)
      .eq('battle_id', defaultBattleId)
      .select()

    if (deleteError) {
      console.error('❌ Error deleting votes:', deleteError)
      return
    }

    console.log(`✅ Deleted ${deletedVotes?.length || 0} votes for test user`)
    
    if (deletedVotes && deletedVotes.length > 0) {
      console.log('Deleted votes:')
      deletedVotes.forEach(vote => {
        console.log(`  - Vote ID: ${vote.id}, Vendor: ${vote.vendor_id}, Verified: ${vote.is_verified}`)
      })
    }

    // Also clear any related attestations
    const { data: deletedAttestations, error: attestationError } = await supabase
      .from('attestations')
      .delete()
      .eq('user_fid', testUserFid)
      .select()

    if (attestationError) {
      console.error('❌ Error deleting attestations:', attestationError)
    } else {
      console.log(`✅ Deleted ${deletedAttestations?.length || 0} attestations for test user`)
    }

    console.log('\n✅ Test votes cleared successfully!')
    console.log('You can now test voting again.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

clearTestVotes() 