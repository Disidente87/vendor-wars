import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies on votes table...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 1. Check if RLS is enabled
    console.log('1️⃣ Checking RLS status...')
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_rls_status', { table_name: 'votes' })
      .catch(() => ({ data: null, error: { message: 'Function not available' } }))

    if (rlsError) {
      console.log('⚠️ Could not check RLS status via function, checking manually...')
    } else {
      console.log('✅ RLS status:', rlsStatus)
    }

    // 2. Try to delete a vote to see the exact error
    console.log('\n2️⃣ Testing vote deletion...')
    
    const { data: testVotes, error: testError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', '465823')
      .limit(1)

    if (testError) {
      console.log('❌ Error fetching test votes:', testError.message)
      return
    }

    if (!testVotes || testVotes.length === 0) {
      console.log('✅ No test votes found to delete')
      return
    }

    const testVoteId = testVotes[0].id
    console.log(`   Attempting to delete vote ID: ${testVoteId}`)

    const { data: deleteResult, error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('id', testVoteId)
      .select('id')

    if (deleteError) {
      console.log('❌ Delete error:', deleteError.message)
      console.log('   Error details:', deleteError)
      
      if (deleteError.message.includes('policy')) {
        console.log('\n🔧 Solution: RLS policy is blocking deletion')
        console.log('   You need to either:')
        console.log('   1. Disable RLS temporarily')
        console.log('   2. Add a DELETE policy')
        console.log('   3. Use service role key instead of anon key')
      }
    } else {
      console.log('✅ Vote deleted successfully')
    }

    // 3. Check current policies
    console.log('\n3️⃣ Current policies on votes table:')
    console.log('   - SELECT: Should allow everyone')
    console.log('   - INSERT: Should allow everyone')
    console.log('   - UPDATE: Should allow everyone')
    console.log('   - DELETE: ❌ Likely missing or restrictive')

    console.log('\n💡 Recommendations:')
    console.log('   1. Use service role key for admin operations')
    console.log('   2. Add DELETE policy for testing')
    console.log('   3. Disable RLS temporarily for cleanup')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkRLSPolicies().catch(console.error) 