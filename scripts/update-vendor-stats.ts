import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateVendorStats() {
  console.log('📊 Updating vendor statistics...')

  try {
    // Get all vendors
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name')

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }

    console.log(`📋 Found ${vendors.length} vendors to update`)

    // Update each vendor's statistics
    for (const vendor of vendors) {
      console.log(`🔄 Updating stats for ${vendor.name}...`)

      // Get battles where this vendor participated
      const { data: battles, error: battlesError } = await supabase
        .from('battles')
        .select('id, challenger_id, opponent_id, winner_id, status')
        .or(`challenger_id.eq.${vendor.id},opponent_id.eq.${vendor.id}`)

      if (battlesError) {
        console.error(`❌ Error fetching battles for ${vendor.name}:`, battlesError)
        continue
      }

      // Get votes for this vendor
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('is_verified, token_reward')
        .eq('vendor_id', vendor.id)

      if (votesError) {
        console.error(`❌ Error fetching votes for ${vendor.name}:`, votesError)
        continue
      }

      // Calculate statistics
      const totalBattles = battles.length
      const wins = battles.filter(b => b.winner_id === vendor.id).length
      const losses = totalBattles - wins
      const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0
      const totalVotes = votes.length
      const verifiedVotes = votes.filter(v => v.is_verified).length
      const totalRevenue = votes.reduce((sum, vote) => sum + vote.token_reward, 0)

      // Update vendor with new statistics
      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          total_battles: totalBattles,
          wins: wins,
          losses: losses,
          win_rate: parseFloat(winRate.toFixed(1)),
          total_votes: totalVotes,
          verified_votes: verifiedVotes,
          total_revenue: totalRevenue
        })
        .eq('id', vendor.id)

      if (updateError) {
        console.error(`❌ Error updating ${vendor.name}:`, updateError)
      } else {
        console.log(`✅ Updated ${vendor.name}: ${wins}W/${losses}L (${winRate.toFixed(1)}%), ${totalVotes} votes, ${totalRevenue} revenue`)
      }
    }

    console.log('🎉 Vendor statistics update completed!')

  } catch (error) {
    console.error('❌ Update failed:', error)
  }
}

// Run update if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateVendorStats()
}

export { updateVendorStats } 