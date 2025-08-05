#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Test script to verify vendor stats update after voting
async function testVendorStatsUpdate() {
  console.log('🧪 Testing Vendor Stats Update...\n')

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
    // Step 1: Get initial vendor stats
    console.log('📋 Step 1: Getting initial vendor stats...')
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
    console.log(`   Verified Votes: ${initialVendor.verified_votes || 0}\n`)

    // Step 2: Submit a test vote
    console.log('📋 Step 2: Submitting test vote...')
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
    
    if (!voteResult.success) {
      console.error('❌ Vote failed:', voteResult.error)
      return
    }

    console.log('✅ Vote submitted successfully:')
    console.log(`   Tokens Earned: ${voteResult.data.tokensEarned}`)
    console.log(`   New Balance: ${voteResult.data.newBalance}\n`)

    // Step 3: Wait a moment for database update
    console.log('📋 Step 3: Waiting for database update...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 4: Get updated vendor stats
    console.log('📋 Step 4: Getting updated vendor stats...')
    const { data: updatedVendor, error: updatedError } = await supabase
      .from('vendors')
      .select('id, name, total_votes, verified_votes')
      .eq('id', testVendorId)
      .single()

    if (updatedError) {
      console.error('❌ Error fetching updated vendor stats:', updatedError)
      return
    }

    console.log('✅ Updated vendor stats:')
    console.log(`   Vendor: ${updatedVendor.name}`)
    console.log(`   Total Votes: ${updatedVendor.total_votes || 0}`)
    console.log(`   Verified Votes: ${updatedVendor.verified_votes || 0}\n`)

    // Step 5: Verify the update
    const totalVotesIncreased = (updatedVendor.total_votes || 0) > (initialVendor.total_votes || 0)
    const verifiedVotesSame = (updatedVendor.verified_votes || 0) === (initialVendor.verified_votes || 0)

    console.log('📋 Step 5: Verifying update...')
    if (totalVotesIncreased && verifiedVotesSame) {
      console.log('✅ SUCCESS: Vendor stats updated correctly!')
      console.log(`   Total votes increased: ${initialVendor.total_votes || 0} → ${updatedVendor.total_votes || 0}`)
      console.log(`   Verified votes unchanged: ${initialVendor.verified_votes || 0} → ${updatedVendor.verified_votes || 0}`)
    } else {
      console.log('❌ FAILED: Vendor stats not updated correctly')
      console.log(`   Total votes: ${initialVendor.total_votes || 0} → ${updatedVendor.total_votes || 0}`)
      console.log(`   Verified votes: ${initialVendor.verified_votes || 0} → ${updatedVendor.verified_votes || 0}`)
    }

    // Step 6: Test verified vote
    console.log('\n📋 Step 6: Testing verified vote...')
    const verifiedVoteResponse = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: testVendorId,
        userFid: testUserFid,
        voteType: 'verified',
        photoUrl: 'https://example.com/verified-photo.jpg'
      }),
    })

    const verifiedVoteResult = await verifiedVoteResponse.json()
    
    if (!verifiedVoteResult.success) {
      console.error('❌ Verified vote failed:', verifiedVoteResult.error)
      return
    }

    console.log('✅ Verified vote submitted successfully:')
    console.log(`   Tokens Earned: ${verifiedVoteResult.data.tokensEarned}`)
    console.log(`   New Balance: ${verifiedVoteResult.data.newBalance}\n`)

    // Step 7: Wait and check final stats
    console.log('📋 Step 7: Waiting for final database update...')
    await new Promise(resolve => setTimeout(resolve, 2000))

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
    console.log(`   Verified Votes: ${finalVendor.verified_votes || 0}\n`)

    // Step 8: Final verification
    const finalTotalVotesIncreased = (finalVendor.total_votes || 0) > (updatedVendor.total_votes || 0)
    const finalVerifiedVotesIncreased = (finalVendor.verified_votes || 0) > (updatedVendor.verified_votes || 0)

    console.log('📋 Step 8: Final verification...')
    if (finalTotalVotesIncreased && finalVerifiedVotesIncreased) {
      console.log('✅ SUCCESS: Verified vote stats updated correctly!')
      console.log(`   Total votes increased: ${updatedVendor.total_votes || 0} → ${finalVendor.total_votes || 0}`)
      console.log(`   Verified votes increased: ${updatedVendor.verified_votes || 0} → ${finalVendor.verified_votes || 0}`)
    } else {
      console.log('❌ FAILED: Verified vote stats not updated correctly')
      console.log(`   Total votes: ${updatedVendor.total_votes || 0} → ${finalVendor.total_votes || 0}`)
      console.log(`   Verified votes: ${updatedVendor.verified_votes || 0} → ${finalVendor.verified_votes || 0}`)
    }

    console.log('\n🎉 Vendor Stats Update Test Completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVendorStatsUpdate() 