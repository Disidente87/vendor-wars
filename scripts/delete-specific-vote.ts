import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function deleteSpecificVote() {
  console.log('🗑️  Deleting specific vote...\n')

  try {
    const voteId = '00b98533-f8e7-496d-a389-ce58e2ee93cf'
    const testUserFid = '12345'
    const defaultBattleId = '216b4979-c7e4-44db-a002-98860913639c'

    console.log(`🎯 Deleting vote ID: ${voteId}`)
    console.log(`👤 User FID: ${testUserFid}`)
    console.log(`⚔️  Battle ID: ${defaultBattleId}`)

    // Delete the specific vote
    const { data: deletedVote, error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('id', voteId)
      .select()
      .single()

    if (deleteError) {
      console.error('❌ Error deleting vote:', deleteError)
      return
    }

    if (deletedVote) {
      console.log('✅ Vote deleted successfully!')
      console.log(`  - Vote ID: ${deletedVote.id}`)
      console.log(`  - Vendor ID: ${deletedVote.vendor_id}`)
      console.log(`  - Verified: ${deletedVote.is_verified}`)
      console.log(`  - Tokens: ${deletedVote.token_reward}`)
      console.log(`  - Created: ${deletedVote.created_at}`)
    } else {
      console.log('⚠️  No vote found to delete')
    }

    // Verify the vote is gone
    console.log('\n🔍 Verifying vote deletion...')
    const { data: remainingVotes, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', testUserFid)
      .eq('battle_id', defaultBattleId)

    if (checkError) {
      console.error('❌ Error checking remaining votes:', checkError)
      return
    }

    console.log(`📊 Remaining votes for user ${testUserFid} in battle ${defaultBattleId}: ${remainingVotes?.length || 0}`)

    if (remainingVotes && remainingVotes.length === 0) {
      console.log('🎉 SUCCESS: No votes remaining! You can now vote again.')
    } else {
      console.log('⚠️  Some votes still remain')
    }

    console.log('\n✅ Deletion completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

deleteSpecificVote() 