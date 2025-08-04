import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabaseStatus() {
  console.log('📊 Checking Supabase database status...\n')

  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid, username, display_name, credibility_tier, battle_tokens')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    } else {
      console.log(`👥 Users: ${users.length} total`)
      console.log('   Top users by battle tokens:')
      users
        .sort((a, b) => b.battle_tokens - a.battle_tokens)
        .slice(0, 3)
        .forEach(user => {
          console.log(`   - ${user.display_name} (@${user.username}): ${user.battle_tokens} tokens (${user.credibility_tier})`)
        })
    }

    // Check zones
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('name, heat_level, total_votes, active_vendors')

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
    } else {
      console.log(`\n🗺️ Zones: ${zones.length} total`)
      zones.forEach(zone => {
        console.log(`   - ${zone.name}: Heat ${zone.heat_level}, ${zone.total_votes} votes, ${zone.active_vendors} vendors`)
      })
    }

    // Check vendors
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('name, category, total_battles, wins, win_rate, average_rating')

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
    } else {
      console.log(`\n🏪 Vendors: ${vendors.length} total`)
      console.log('   Top vendors by win rate:')
      vendors
        .sort((a, b) => b.win_rate - a.win_rate)
        .slice(0, 3)
        .forEach(vendor => {
          console.log(`   - ${vendor.name} (${vendor.category}): ${vendor.win_rate}% win rate, ${vendor.total_battles} battles`)
        })
    }

    // Check battles
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('status, category, total_votes, verified_votes')

    if (battlesError) {
      console.error('❌ Error fetching battles:', battlesError)
    } else {
      console.log(`\n⚔️ Battles: ${battles.length} total`)
      const statusCounts = battles.reduce((acc, battle) => {
        acc[battle.status] = (acc[battle.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} battles`)
      })
    }

    // Check votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('is_verified, token_reward')

    if (votesError) {
      console.error('❌ Error fetching votes:', votesError)
    } else {
      console.log(`\n🗳️ Votes: ${votes.length} total`)
      const verifiedVotes = votes.filter(v => v.is_verified).length
      const totalRewards = votes.reduce((sum, vote) => sum + vote.token_reward, 0)
      console.log(`   - Verified votes: ${verifiedVotes}/${votes.length} (${((verifiedVotes/votes.length)*100).toFixed(1)}%)`)
      console.log(`   - Total token rewards: ${totalRewards}`)
    }

    // Check attestations
    const { data: attestations, error: attestationsError } = await supabase
      .from('attestations')
      .select('status, verification_confidence')

    if (attestationsError) {
      console.error('❌ Error fetching attestations:', attestationsError)
    } else {
      console.log(`\n📸 Attestations: ${attestations.length} total`)
      const approvedAttestations = attestations.filter(a => a.status === 'approved').length
      const avgConfidence = attestations.reduce((sum, a) => sum + a.verification_confidence, 0) / attestations.length
      console.log(`   - Approved: ${approvedAttestations}/${attestations.length}`)
      console.log(`   - Average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
    }

    // Check verification proofs
    const { data: proofs, error: proofsError } = await supabase
      .from('verification_proofs')
      .select('type, verified_by')

    if (proofsError) {
      console.error('❌ Error fetching verification proofs:', proofsError)
    } else {
      console.log(`\n🔍 Verification Proofs: ${proofs.length} total`)
      const typeCounts = proofs.reduce((acc, proof) => {
        acc[proof.type] = (acc[proof.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count} proofs`)
      })
    }

    console.log('\n🎉 Database status check completed!')
    console.log('\n📈 Summary:')
    console.log(`   - Total users: ${users?.length || 0}`)
    console.log(`   - Total zones: ${zones?.length || 0}`)
    console.log(`   - Total vendors: ${vendors?.length || 0}`)
    console.log(`   - Total battles: ${battles?.length || 0}`)
    console.log(`   - Total votes: ${votes?.length || 0}`)
    console.log(`   - Total attestations: ${attestations?.length || 0}`)
    console.log(`   - Total verification proofs: ${proofs?.length || 0}`)

  } catch (error) {
    console.error('❌ Status check failed:', error)
  }
}

// Run check if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabaseStatus()
}

export { checkDatabaseStatus } 