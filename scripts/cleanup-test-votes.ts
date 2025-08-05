#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Script to cleanup test votes from user 12345
async function cleanupTestVotes() {
  console.log('🧹 Cleaning up test votes...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Get count of test votes before cleanup
    const { data: testVotes, error: countError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', '12345')

    if (countError) {
      console.error('❌ Error counting test votes:', countError)
      return
    }

    console.log(`📊 Found ${testVotes.length} test votes to clean up`)

    if (testVotes.length === 0) {
      console.log('✅ No test votes to clean up')
      return
    }

    // Delete test votes
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_fid', '12345')

    if (deleteError) {
      console.error('❌ Error deleting test votes:', deleteError)
      return
    }

    console.log(`✅ Successfully deleted ${testVotes.length} test votes`)

    // Reset vendor stats to their original values
    const vendorsToReset = [
      'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28', // Sushi Express
      '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
      '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Tacos El Rey
      '525c09b3-dc92-409b-a11d-896bcf4d15b2', // Café Aroma
      '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1'  // Pizza Napoli
    ]

    console.log('🔄 Resetting vendor stats...')

    for (const vendorId of vendorsToReset) {
      // Get current vote counts for this vendor
      const { data: vendorVotes, error: vendorError } = await supabase
        .from('votes')
        .select('is_verified')
        .eq('vendor_id', vendorId)

      if (vendorError) {
        console.error(`❌ Error getting votes for vendor ${vendorId}:`, vendorError)
        continue
      }

      const totalVotes = vendorVotes.length
      const verifiedVotes = vendorVotes.filter(vote => vote.is_verified).length

      // Update vendor stats
      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          total_votes: totalVotes,
          verified_votes: verifiedVotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (updateError) {
        console.error(`❌ Error updating vendor ${vendorId}:`, updateError)
      } else {
        console.log(`✅ Updated vendor ${vendorId}: ${totalVotes} total votes, ${verifiedVotes} verified votes`)
      }
    }

    console.log('\n🎉 Test cleanup completed!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

// Run the cleanup
cleanupTestVotes() 