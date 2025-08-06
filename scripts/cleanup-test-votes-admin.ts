import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function cleanupTestVotesAdmin() {
  console.log('🧹 Admin cleanup of test votes for user 465823...\n')
  
  // Use service role key if available, otherwise use anon key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Check existing votes for test user
    console.log('1️⃣ Checking existing votes for test user...')
    
    const { data: existingVotes, error: checkError } = await supabase
      .from('votes')
      .select('id, vendor_id, vote_date, created_at')
      .eq('voter_fid', '465823')

    if (checkError) {
      console.log('❌ Error checking existing votes:', checkError.message)
      return
    }

    if (!existingVotes || existingVotes.length === 0) {
      console.log('✅ No existing votes found for test user')
      return
    }

    console.log(`📊 Found ${existingVotes.length} existing votes:`)
    existingVotes.forEach((vote, index) => {
      console.log(`   ${index + 1}. Vote ID: ${vote.id}`)
      console.log(`      Vendor: ${vote.vendor_id}`)
      console.log(`      Date: ${vote.vote_date}`)
      console.log(`      Created: ${vote.created_at}`)
    })

    // 2. Delete all votes for test user
    console.log('\n2️⃣ Deleting all votes for test user...')
    
    const { data: deletedVotes, error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_fid', '465823')
      .select('id')

    if (deleteError) {
      console.log('❌ Error deleting votes:', deleteError.message)
      console.log('   This might be due to RLS policies or missing permissions')
      console.log('   Try running this SQL directly in Supabase:')
      console.log('   DELETE FROM votes WHERE voter_fid = \'465823\';')
      return
    }

    console.log(`✅ Successfully deleted ${deletedVotes?.length || 0} votes`)

    // 3. Verify deletion
    console.log('\n3️⃣ Verifying deletion...')
    
    const { data: remainingVotes, error: verifyError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', '465823')

    if (verifyError) {
      console.log('❌ Error verifying deletion:', verifyError.message)
      return
    }

    if (!remainingVotes || remainingVotes.length === 0) {
      console.log('✅ All test votes successfully deleted')
    } else {
      console.log(`⚠️ ${remainingVotes.length} votes still remain`)
    }

    console.log('\n🎉 Cleanup completed successfully!')
    console.log('✅ Test votes deleted')
    console.log('✅ Ready for new voting tests')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

cleanupTestVotesAdmin().catch(console.error) 