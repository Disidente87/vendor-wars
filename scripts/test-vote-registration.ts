#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Test script to verify vote registration in database
async function testVoteRegistration() {
  console.log('🧪 Testing Vote Registration in Database...\n')

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

    // Step 2: Get initial vote count
    console.log('\n📋 Step 2: Getting initial vote count...')
    const { data: initialVotes, error: initialError } = await supabase
      .from('votes')
      .select('id, battle_id, created_at')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)

    if (initialError) {
      console.error('❌ Error fetching initial votes:', initialError)
      return
    }

    console.log(`✅ Initial vote count: ${initialVotes.length}`)

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

    console.log('✅ First vote submitted successfully')
    console.log(`   Tokens Earned: ${vote1Result.data.tokensEarned}`)

    // Step 4: Check first vote in database
    console.log('\n📋 Step 4: Checking first vote in database...')
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for DB update

    const { data: votesAfter1, error: votes1Error } = await supabase
      .from('votes')
      .select('id, battle_id, created_at, token_reward')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .order('created_at', { ascending: true })

    if (votes1Error) {
      console.error('❌ Error fetching votes after first vote:', votes1Error)
      return
    }

    console.log(`✅ Votes in database after first vote: ${votesAfter1.length}`)
    votesAfter1.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: ID=${vote.id}, Battle=${vote.battle_id}, Tokens=${vote.token_reward}`)
    })

    // Step 5: Submit second vote
    console.log('\n📋 Step 5: Submitting second vote...')
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

    console.log('✅ Second vote submitted successfully')
    console.log(`   Tokens Earned: ${vote2Result.data.tokensEarned}`)

    // Step 6: Check second vote in database
    console.log('\n📋 Step 6: Checking second vote in database...')
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for DB update

    const { data: votesAfter2, error: votes2Error } = await supabase
      .from('votes')
      .select('id, battle_id, created_at, token_reward')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .order('created_at', { ascending: true })

    if (votes2Error) {
      console.error('❌ Error fetching votes after second vote:', votes2Error)
      return
    }

    console.log(`✅ Votes in database after second vote: ${votesAfter2.length}`)
    votesAfter2.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: ID=${vote.id}, Battle=${vote.battle_id}, Tokens=${vote.token_reward}`)
    })

    // Step 7: Submit third vote
    console.log('\n📋 Step 7: Submitting third vote...')
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

    console.log('✅ Third vote submitted successfully')
    console.log(`   Tokens Earned: ${vote3Result.data.tokensEarned}`)

    // Step 8: Check third vote in database
    console.log('\n📋 Step 8: Checking third vote in database...')
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for DB update

    const { data: votesAfter3, error: votes3Error } = await supabase
      .from('votes')
      .select('id, battle_id, created_at, token_reward')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .order('created_at', { ascending: true })

    if (votes3Error) {
      console.error('❌ Error fetching votes after third vote:', votes3Error)
      return
    }

    console.log(`✅ Votes in database after third vote: ${votesAfter3.length}`)
    votesAfter3.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: ID=${vote.id}, Battle=${vote.battle_id}, Tokens=${vote.token_reward}`)
    })

    // Step 9: Verification
    console.log('\n📋 Step 9: Final verification...')
    const expectedVotes = 3
    const actualVotes = votesAfter3.length
    const uniqueBattleIds = new Set(votesAfter3.map(vote => vote.battle_id))
    const uniqueBattleIdsCount = uniqueBattleIds.size

    console.log(`Expected votes: ${expectedVotes}`)
    console.log(`Actual votes: ${actualVotes}`)
    console.log(`Unique battle IDs: ${uniqueBattleIdsCount}`)
    console.log(`Battle IDs: ${Array.from(uniqueBattleIds).join(', ')}`)

    if (actualVotes === expectedVotes && uniqueBattleIdsCount === expectedVotes) {
      console.log('✅ SUCCESS: All votes registered correctly with unique battle IDs!')
    } else {
      console.log('❌ FAILED: Vote registration not working correctly')
      if (actualVotes !== expectedVotes) {
        console.log(`   - Expected ${expectedVotes} votes, got ${actualVotes}`)
      }
      if (uniqueBattleIdsCount !== expectedVotes) {
        console.log(`   - Expected ${expectedVotes} unique battle IDs, got ${uniqueBattleIdsCount}`)
      }
    }

    console.log('\n🎉 Vote Registration Test Completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVoteRegistration() 