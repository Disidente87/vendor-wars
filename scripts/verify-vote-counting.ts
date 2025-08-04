import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyVoteCounting() {
  console.log('🔍 Verifying vote counting and calculations...')

  try {
    // Get all votes from the database
    const { data: allVotes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })

    if (votesError) {
      console.error('❌ Error fetching votes:', votesError)
      return
    }

    console.log(`📊 Total votes in database: ${allVotes?.length || 0}`)

    if (!allVotes || allVotes.length === 0) {
      console.log('⚠️  No votes found in database')
      return
    }

    // Group votes by vendor
    const vendorVotes: { [key: string]: any[] } = {}
    const userVotes: { [key: string]: any[] } = {}
    let totalTokens = 0
    let verifiedVotes = 0
    let regularVotes = 0

    allVotes.forEach(vote => {
      // Group by vendor
      if (!vendorVotes[vote.vendor_id]) {
        vendorVotes[vote.vendor_id] = []
      }
      vendorVotes[vote.vendor_id].push(vote)

      // Group by user
      if (!userVotes[vote.voter_fid]) {
        userVotes[vote.voter_fid] = []
      }
      userVotes[vote.voter_fid].push(vote)

      // Count totals
      totalTokens += vote.token_reward || 0
      if (vote.is_verified) {
        verifiedVotes++
      } else {
        regularVotes++
      }
    })

    // Display vendor statistics
    console.log('\n🏪 Vendor Vote Statistics:')
    console.log('========================')
    
    Object.entries(vendorVotes).forEach(([vendorId, votes]) => {
      const totalVendorVotes = votes.length
      const verifiedVendorVotes = votes.filter(v => v.is_verified).length
      const regularVendorVotes = totalVendorVotes - verifiedVendorVotes
      const totalVendorTokens = votes.reduce((sum, v) => sum + (v.token_reward || 0), 0)
      
      console.log(`\nVendor ID: ${vendorId}`)
      console.log(`  Total votes: ${totalVendorVotes}`)
      console.log(`  Regular votes: ${regularVendorVotes}`)
      console.log(`  Verified votes: ${verifiedVendorVotes}`)
      console.log(`  Total tokens earned: ${totalVendorTokens}`)
      console.log(`  Average tokens per vote: ${(totalVendorTokens / totalVendorVotes).toFixed(2)}`)
    })

    // Display user statistics
    console.log('\n👤 User Vote Statistics:')
    console.log('=======================')
    
    Object.entries(userVotes).forEach(([userFid, votes]) => {
      const totalUserVotes = votes.length
      const verifiedUserVotes = votes.filter(v => v.is_verified).length
      const regularUserVotes = totalUserVotes - verifiedUserVotes
      const totalUserTokens = votes.reduce((sum, v) => sum + (v.token_reward || 0), 0)
      
      console.log(`\nUser FID: ${userFid}`)
      console.log(`  Total votes: ${totalUserVotes}`)
      console.log(`  Regular votes: ${regularUserVotes}`)
      console.log(`  Verified votes: ${verifiedUserVotes}`)
      console.log(`  Total tokens earned: ${totalUserTokens}`)
      console.log(`  Average tokens per vote: ${(totalUserTokens / totalUserVotes).toFixed(2)}`)
      
      // Show vote distribution by vendor
      const vendorDistribution: { [key: string]: number } = {}
      votes.forEach(vote => {
        vendorDistribution[vote.vendor_id] = (vendorDistribution[vote.vendor_id] || 0) + 1
      })
      
      console.log(`  Vote distribution by vendor:`)
      Object.entries(vendorDistribution).forEach(([vendorId, count]) => {
        console.log(`    ${vendorId}: ${count} votes`)
      })
    })

    // Display overall statistics
    console.log('\n📈 Overall Statistics:')
    console.log('=====================')
    console.log(`Total votes: ${allVotes.length}`)
    console.log(`Regular votes: ${regularVotes}`)
    console.log(`Verified votes: ${verifiedVotes}`)
    console.log(`Total tokens distributed: ${totalTokens}`)
    console.log(`Average tokens per vote: ${(totalTokens / allVotes.length).toFixed(2)}`)
    console.log(`Verification rate: ${((verifiedVotes / allVotes.length) * 100).toFixed(2)}%`)

    // Verify token calculations
    console.log('\n💰 Token Calculation Verification:')
    console.log('=================================')
    
    allVotes.forEach((vote, index) => {
      const expectedTokens = vote.is_verified ? 30 : 10
      const actualTokens = vote.token_reward || 0
      const isCorrect = actualTokens === expectedTokens
      
      if (!isCorrect) {
        console.log(`⚠️  Vote ${index + 1} (ID: ${vote.id}):`)
        console.log(`    Expected: ${expectedTokens} tokens`)
        console.log(`    Actual: ${actualTokens} tokens`)
        console.log(`    Type: ${vote.is_verified ? 'Verified' : 'Regular'}`)
      }
    })

    // Check for recent votes (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentVotes = allVotes.filter(vote => new Date(vote.created_at) > oneDayAgo)
    
    console.log(`\n⏰ Recent votes (last 24h): ${recentVotes.length}`)

    console.log('\n✅ Vote counting verification completed!')

  } catch (error) {
    console.error('❌ Error verifying vote counting:', error)
  }
}

// Run verification if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyVoteCounting()
}

export { verifyVoteCounting } 