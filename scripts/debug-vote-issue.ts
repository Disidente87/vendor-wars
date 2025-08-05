#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Debug script to identify vote registration issues
async function debugVoteIssue() {
  console.log('🔍 Debugging Vote Registration Issue...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Test vendor ID (Pizza Napoli - based on the battle ID you mentioned)
  const testVendorId = '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1' // Pizza Napoli
  const testUserFid = '12345'

  try {
    // Step 1: Check current votes for this vendor
    console.log('📋 Step 1: Checking current votes for Pizza Napoli...')
    const { data: currentVotes, error: currentError } = await supabase
      .from('votes')
      .select('id, voter_fid, vendor_id, battle_id, created_at, token_reward')
      .eq('vendor_id', testVendorId)
      .order('created_at', { ascending: true })

    if (currentError) {
      console.error('❌ Error fetching current votes:', currentError)
      return
    }

    console.log(`✅ Found ${currentVotes.length} votes for Pizza Napoli:`)
    currentVotes.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: ID=${vote.id}, Voter=${vote.voter_fid}, Battle=${vote.battle_id}, Tokens=${vote.token_reward}`)
    })

    // Step 2: Check vendor stats
    console.log('\n📋 Step 2: Checking vendor stats...')
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name, total_votes, verified_votes')
      .eq('id', testVendorId)
      .single()

    if (vendorError) {
      console.error('❌ Error fetching vendor:', vendorError)
      return
    }

    console.log(`✅ Vendor stats: ${vendor.name}`)
    console.log(`   Total Votes: ${vendor.total_votes || 0}`)
    console.log(`   Verified Votes: ${vendor.verified_votes || 0}`)

    // Step 3: Check if the battle ID exists
    console.log('\n📋 Step 3: Checking if battle ID exists...')
    const battleId = '4f87c3c6-0d38-4e84-afc1-60b52b363bab'
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('id, name, status')
      .eq('id', battleId)
      .single()

    if (battleError) {
      console.error('❌ Battle ID not found:', battleError)
    } else {
      console.log(`✅ Battle found: ${battle.name} (${battle.status})`)
    }

    // Step 4: Check today's votes for this user-vendor pair
    console.log('\n📋 Step 4: Checking today\'s votes for user-vendor pair...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: todayVotes, error: todayError } = await supabase
      .from('votes')
      .select('id, battle_id, created_at, token_reward')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: true })

    if (todayError) {
      console.error('❌ Error fetching today\'s votes:', todayError)
      return
    }

    console.log(`✅ Today's votes for user ${testUserFid} and vendor ${testVendorId}: ${todayVotes.length}`)
    todayVotes.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: ID=${vote.id}, Battle=${vote.battle_id}, Tokens=${vote.token_reward}`)
    })

    // Step 5: Try to submit a test vote
    console.log('\n📋 Step 5: Submitting test vote...')
    const voteResponse = await fetch('http://localhost:3000/api/votes', {
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

    const voteResult = await voteResponse.json()
    console.log('Vote response:', voteResult)

    if (!voteResult.success) {
      console.log('❌ Vote failed:', voteResult.error)
    } else {
      console.log('✅ Vote succeeded')
      console.log(`   Tokens Earned: ${voteResult.data.tokensEarned}`)
      console.log(`   New Balance: ${voteResult.data.newBalance}`)
    }

    // Step 6: Check votes again after test vote
    console.log('\n📋 Step 6: Checking votes after test vote...')
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for DB update

    const { data: votesAfterTest, error: afterError } = await supabase
      .from('votes')
      .select('id, voter_fid, vendor_id, battle_id, created_at, token_reward')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: true })

    if (afterError) {
      console.error('❌ Error fetching votes after test:', afterError)
      return
    }

    console.log(`✅ Votes after test: ${votesAfterTest.length}`)
    votesAfterTest.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: ID=${vote.id}, Battle=${vote.battle_id}, Tokens=${vote.token_reward}`)
    })

    // Step 7: Check vendor stats after test vote
    console.log('\n📋 Step 7: Checking vendor stats after test vote...')
    const { data: vendorAfter, error: vendorAfterError } = await supabase
      .from('vendors')
      .select('id, name, total_votes, verified_votes')
      .eq('id', testVendorId)
      .single()

    if (vendorAfterError) {
      console.error('❌ Error fetching vendor after test:', vendorAfterError)
      return
    }

    console.log(`✅ Vendor stats after test: ${vendorAfter.name}`)
    console.log(`   Total Votes: ${vendorAfter.total_votes || 0}`)
    console.log(`   Verified Votes: ${vendorAfter.verified_votes || 0}`)

    // Step 8: Analysis
    console.log('\n📋 Step 8: Analysis...')
    const votesBefore = todayVotes.length
    const votesAfter = votesAfterTest.length
    const votesAdded = votesAfter - votesBefore
    const statsBefore = vendor.total_votes || 0
    const statsAfter = vendorAfter.total_votes || 0
    const statsAdded = statsAfter - statsBefore

    console.log(`Votes in database: ${votesBefore} → ${votesAfter} (${votesAdded > 0 ? '+' : ''}${votesAdded})`)
    console.log(`Vendor stats: ${statsBefore} → ${statsAfter} (${statsAdded > 0 ? '+' : ''}${statsAdded})`)

    if (votesAdded === 0 && voteResult.success) {
      console.log('❌ ISSUE: Vote succeeded but was not added to database')
    } else if (votesAdded > 0 && statsAdded === 0) {
      console.log('❌ ISSUE: Vote added to database but stats not updated')
    } else if (votesAdded > 0 && statsAdded > 0) {
      console.log('✅ SUCCESS: Vote added to database and stats updated')
    } else if (!voteResult.success) {
      console.log('✅ EXPECTED: Vote failed as expected')
    }

    console.log('\n🎉 Debug completed!')

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run the debug
debugVoteIssue() 