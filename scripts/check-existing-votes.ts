import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkExistingVotes() {
  console.log('🔍 Checking existing votes...\n')

  try {
    const testUserFid = '12345'
    const defaultBattleId = '216b4979-c7e4-44db-a002-98860913639c'

    // Check all votes for the test user
    const { data: allVotes, error: allVotesError } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_fid', testUserFid)

    if (allVotesError) {
      console.error('❌ Error fetching votes:', allVotesError)
      return
    }

    console.log(`📊 Found ${allVotes?.length || 0} total votes for user ${testUserFid}`)
    
    if (allVotes && allVotes.length > 0) {
      console.log('📋 Vote details:')
      allVotes.forEach((vote, index) => {
        console.log(`  ${index + 1}. Vote ID: ${vote.id}`)
        console.log(`     - Battle ID: ${vote.battle_id}`)
        console.log(`     - Vendor ID: ${vote.vendor_id}`)
        console.log(`     - Verified: ${vote.is_verified}`)
        console.log(`     - Tokens: ${vote.token_reward}`)
        console.log(`     - Created: ${vote.created_at}`)
        console.log('')
      })
    }

    // Check votes specifically for the default battle
    const { data: battleVotes, error: battleVotesError } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_fid', testUserFid)
      .eq('battle_id', defaultBattleId)

    if (battleVotesError) {
      console.error('❌ Error fetching battle votes:', battleVotesError)
      return
    }

    console.log(`📊 Found ${battleVotes?.length || 0} votes for user ${testUserFid} in battle ${defaultBattleId}`)

    if (battleVotes && battleVotes.length > 0) {
      console.log('📋 Battle vote details:')
      battleVotes.forEach((vote, index) => {
        console.log(`  ${index + 1}. Vote ID: ${vote.id}`)
        console.log(`     - Vendor ID: ${vote.vendor_id}`)
        console.log(`     - Verified: ${vote.is_verified}`)
        console.log(`     - Tokens: ${vote.token_reward}`)
        console.log(`     - Created: ${vote.created_at}`)
      })
    }

    // Check all votes in the default battle (any user)
    const { data: allBattleVotes, error: allBattleError } = await supabase
      .from('votes')
      .select('voter_fid, vendor_id, is_verified, created_at')
      .eq('battle_id', defaultBattleId)

    if (allBattleError) {
      console.error('❌ Error fetching all battle votes:', allBattleError)
      return
    }

    console.log(`\n📊 Total votes in battle ${defaultBattleId}: ${allBattleVotes?.length || 0}`)

    console.log('\n✅ Check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkExistingVotes() 