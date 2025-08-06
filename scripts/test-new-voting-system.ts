import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { VotingService } from '@/services/voting'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function testNewVotingSystem() {
  console.log('🧪 Testing new simplified voting system...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 1. Check if tables exist
    console.log('1️⃣ Checking database tables...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid, username, battle_tokens')
      .limit(1)

    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message)
      return
    }

    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, category')
      .limit(1)

    if (vendorsError) {
      console.error('❌ Error accessing vendors table:', vendorsError.message)
      return
    }

    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('id, voter_fid, vendor_id, vote_date')
      .limit(1)

    if (votesError) {
      console.error('❌ Error accessing votes table:', votesError.message)
      return
    }

    console.log('✅ All tables accessible')
    console.log()

    // 2. Test vote registration
    console.log('2️⃣ Testing vote registration...')
    
    const testUserFid = '465823'
    const testVendorId = vendors?.[0]?.id || '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0'
    
    const voteResult = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    if (voteResult.success) {
      console.log('✅ Vote registered successfully!')
      console.log(`   Vote ID: ${voteResult.voteId}`)
      console.log(`   Tokens earned: ${voteResult.tokensEarned}`)
      console.log(`   New balance: ${voteResult.newBalance}`)
    } else {
      console.error('❌ Vote registration failed:', voteResult.error)
    }
    console.log()

    // 3. Check vote in database
    console.log('3️⃣ Checking vote in database...')
    
    const { data: newVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (checkError) {
      console.error('❌ Error checking vote:', checkError.message)
    } else {
      console.log('✅ Vote found in database:')
      console.log(`   ID: ${newVote.id}`)
      console.log(`   Vote date: ${newVote.vote_date}`)
      console.log(`   Is verified: ${newVote.is_verified}`)
      console.log(`   Token reward: ${newVote.token_reward}`)
      console.log(`   Created at: ${newVote.created_at}`)
    }
    console.log()

    // 4. Test daily vote limit
    console.log('4️⃣ Testing daily vote limit...')
    
    const voteResult2 = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    if (voteResult2.success) {
      console.log('✅ Second vote registered successfully!')
      console.log(`   Vote ID: ${voteResult2.voteId}`)
    } else {
      console.log('⚠️ Second vote failed (expected if limit reached):', voteResult2.error)
    }
    console.log()

    // 5. Check user tokens
    console.log('5️⃣ Checking user tokens...')
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('battle_tokens')
      .eq('fid', testUserFid)
      .single()

    if (userError) {
      console.error('❌ Error checking user tokens:', userError.message)
    } else {
      console.log(`✅ User tokens: ${user.battle_tokens}`)
    }
    console.log()

    // 6. Check vendor stats
    console.log('6️⃣ Checking vendor stats...')
    
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('total_votes, verified_votes')
      .eq('id', testVendorId)
      .single()

    if (vendorError) {
      console.error('❌ Error checking vendor stats:', vendorError.message)
    } else {
      console.log(`✅ Vendor stats: total_votes=${vendor.total_votes}, verified_votes=${vendor.verified_votes}`)
    }

    console.log('\n🎉 New voting system test complete!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testNewVotingSystem().catch(console.error) 