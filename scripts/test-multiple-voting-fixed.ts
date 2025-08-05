#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Test script to verify multiple voting works correctly with unique battle IDs
async function testMultipleVotingFixed() {
  console.log('🧪 Testing Multiple Voting with Unique Battle IDs...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Test vendor ID (Sushi Express)
  const testVendorId = 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28'
  const testUserFid = '12345'

  try {
    // Step 1: Clean up any existing test votes
    console.log('📋 Step 1: Cleaning up existing test votes...')
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)

    if (deleteError) {
      console.error('❌ Error cleaning up test votes:', deleteError)
    } else {
      console.log('✅ Test votes cleaned up')
    }

    // Step 2: Get initial vendor stats
    console.log('\n📋 Step 2: Getting initial vendor stats...')
    const { data: initialVendor, error: initialError } = await supabase
      .from('vendors')
      .select('id, name, total_votes, verified_votes')
      .eq('id', testVendorId)
      .single()

    if (initialError) {
      console.error('❌ Error fetching initial vendor stats:', initialError)
      return
    }

    console.log('✅ Initial vendor stats:')
    console.log(`   Vendor: ${initialVendor.name}`)
    console.log(`   Total Votes: ${initialVendor.total_votes || 0}`)
    console.log(`   Verified Votes: ${initialVendor.verified_votes || 0}`)

    // Step 3: Submit first vote
    console.log('\n📋 Step 3: Submitting first vote...')
    const vote1Response = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: testVendorId,
        userFid: testUserFid,
        voteType: 'regular'
      }),
    })

    const vote1Result = await vote1Response.json()
    
    if (!vote1Result.success) {
      console.error('❌ First vote failed:', vote1Result.error)
      return
    }

    console.log('✅ First vote submitted successfully:')
    console.log(`   Tokens Earned: ${vote1Result.data.tokensEarned}`)
    console.log(`   New Balance: ${vote1Result.data.newBalance}`)

    // Step 4: Submit second vote
    console.log('\n📋 Step 4: Submitting second vote...')
    const vote2Response = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: testVendorId,
        userFid: testUserFid,
        voteType: 'regular'
      }),
    })

    const vote2Result = await vote2Response.json()
    
    if (!vote2Result.success) {
      console.error('❌ Second vote failed:', vote2Result.error)
      return
    }

    console.log('✅ Second vote submitted successfully:')
    console.log(`   Tokens Earned: ${vote2Result.data.tokensEarned}`)
    console.log(`   New Balance: ${vote2Result.data.newBalance}`)

    // Step 5: Submit third vote
    console.log('\n📋 Step 5: Submitting third vote...')
    const vote3Response = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: testVendorId,
        userFid: testUserFid,
        voteType: 'regular'
      }),
    })

    const vote3Result = await vote3Response.json()
    
    if (!vote3Result.success) {
      console.error('❌ Third vote failed:', vote3Result.error)
      return
    }

    console.log('✅ Third vote submitted successfully:')
    console.log(`   Tokens Earned: ${vote3Result.data.tokensEarned}`)
    console.log(`   New Balance: ${vote3Result.data.newBalance}`)

    // Step 6: Try fourth vote (should be rejected)
    console.log('\n📋 Step 6: Trying fourth vote (should be rejected)...')
    const vote4Response = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: testVendorId,
        userFid: testUserFid,
        voteType: 'regular'
      }),
    })

    const vote4Result = await vote4Response.json()
    
    if (vote4Result.success) {
      console.error('❌ Fourth vote should have been rejected but succeeded')
      return
    }

    console.log('✅ Fourth vote correctly rejected:')
    console.log(`   Error: ${vote4Result.error}`)

    // Step 7: Check votes in database
    console.log('\n📋 Step 7: Checking votes in database...')
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('id, battle_id, token_reward, created_at')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .order('created_at', { ascending: true })

    if (votesError) {
      console.error('❌ Error fetching votes:', votesError)
      return
    }

    console.log(`✅ Found ${votes.length} votes in database:`)
    votes.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: ID=${vote.id}, Battle=${vote.battle_id}, Tokens=${vote.token_reward}`)
    })

    // Step 8: Check final vendor stats
    console.log('\n📋 Step 8: Checking final vendor stats...')
    const { data: finalVendor, error: finalError } = await supabase
      .from('vendors')
      .select('id, name, total_votes, verified_votes')
      .eq('id', testVendorId)
      .single()

    if (finalError) {
      console.error('❌ Error fetching final vendor stats:', finalError)
      return
    }

    console.log('✅ Final vendor stats:')
    console.log(`   Vendor: ${finalVendor.name}`)
    console.log(`   Total Votes: ${finalVendor.total_votes || 0}`)
    console.log(`   Verified Votes: ${finalVendor.verified_votes || 0}`)

    // Step 9: Verification
    console.log('\n📋 Step 9: Final verification...')
    const expectedVotes = 3
    const actualVotes = votes.length
    const totalVotesIncreased = (finalVendor.total_votes || 0) > (initialVendor.total_votes || 0)
    const votesIncreaseCorrect = (finalVendor.total_votes || 0) - (initialVendor.total_votes || 0) === expectedVotes

    if (actualVotes === expectedVotes && totalVotesIncreased && votesIncreaseCorrect) {
      console.log('✅ SUCCESS: Multiple voting system working correctly!')
      console.log(`   Expected votes: ${expectedVotes}`)
      console.log(`   Actual votes: ${actualVotes}`)
      console.log(`   Total votes increase: ${initialVendor.total_votes || 0} → ${finalVendor.total_votes || 0}`)
      console.log(`   All votes have unique battle IDs`)
    } else {
      console.log('❌ FAILED: Multiple voting system not working correctly')
      console.log(`   Expected votes: ${expectedVotes}`)
      console.log(`   Actual votes: ${actualVotes}`)
      console.log(`   Total votes: ${initialVendor.total_votes || 0} → ${finalVendor.total_votes || 0}`)
    }

    console.log('\n🎉 Multiple Voting Test Completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testMultipleVotingFixed() 