import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  console.log('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testVotingSystem() {
  console.log('🧪 Testing voting system with admin privileges...')
  
  // Generate random test data
  const testUserFid = Math.floor(Math.random() * 1000000) + 100000
  const testVendorId = uuidv4()
  
  console.log(`\n1️⃣ Test data:`)
  console.log(`   User FID: ${testUserFid}`)
  console.log(`   Vendor ID: ${testVendorId}`)
  
  try {
    console.log('\n2️⃣ Creating test user...')
    const { error: createUserError } = await supabase
      .from('users')
      .insert({
        fid: testUserFid,
        username: 'test_user',
        display_name: 'Test User',
        avatar_url: { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test' },
        battle_tokens: 0,
        vote_streak: 0
      })
    
    if (createUserError) {
      console.log('❌ Error creating test user:', createUserError.message)
      return
    }
    console.log('✅ Test user created successfully')
    
    console.log('\n3️⃣ Creating test vendor...')
    const { error: createVendorError } = await supabase
      .from('vendors')
      .insert({
        id: testVendorId,
        name: 'Test Vendor',
        description: 'Test vendor for voting',
        image_url: 'https://via.placeholder.com/100',
        category: 'pupusas',
        zone_id: '1',
        total_votes: 0,
        verified_votes: 0
      })
    
    if (createVendorError) {
      console.log('❌ Error creating test vendor:', createVendorError.message)
      return
    }
    console.log('✅ Test vendor created successfully')
    
    console.log('\n4️⃣ Testing vote insertion...')
    const voteDate = new Date().toISOString().split('T')[0]
    
    const { data: insertedVote, error: voteError } = await supabase
      .from('votes')
      .insert({
        voter_fid: testUserFid,
        vendor_id: testVendorId,
        vote_date: voteDate,
        is_verified: true,
        token_reward: 10,
        multiplier: 1,
        reason: 'Test vote'
      })
      .select('*')
      .single()
    
    if (voteError) {
      console.log('❌ Error inserting vote:', voteError.message)
      return
    }
    console.log('✅ Vote inserted successfully:', insertedVote.id)
    
    console.log('\n5️⃣ Testing duplicate vote prevention...')
    const { error: duplicateVoteError } = await supabase
      .from('votes')
      .insert({
        voter_fid: testUserFid,
        vendor_id: testVendorId,
        vote_date: voteDate,
        is_verified: false,
        token_reward: 5,
        multiplier: 1,
        reason: 'Duplicate test vote'
      })
    
    if (duplicateVoteError) {
      if (duplicateVoteError.message.includes('duplicate key')) {
        console.log('✅ Duplicate vote correctly prevented by unique constraint')
      } else {
        console.log('❌ Unexpected error on duplicate vote:', duplicateVoteError.message)
      }
    } else {
      console.log('❌ Duplicate vote was allowed (this should not happen)')
    }
    
    console.log('\n6️⃣ Testing different date vote...')
    const tomorrowDate = new Date()
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrowDateStr = tomorrowDate.toISOString().split('T')[0]
    
    const { data: tomorrowVote, error: tomorrowVoteError } = await supabase
      .from('votes')
      .insert({
        voter_fid: testUserFid,
        vendor_id: testVendorId,
        vote_date: tomorrowDateStr,
        is_verified: false,
        token_reward: 5,
        multiplier: 1,
        reason: 'Tomorrow vote'
      })
      .select('*')
      .single()
    
    if (tomorrowVoteError) {
      console.log('❌ Error inserting tomorrow vote:', tomorrowVoteError.message)
    } else {
      console.log('✅ Tomorrow vote inserted successfully:', tomorrowVote.id)
    }
    
    console.log('\n7️⃣ Cleaning up test data...')
    const { error: cleanupVotesError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_fid', testUserFid)
    
    if (cleanupVotesError) {
      console.log('❌ Error cleaning up votes:', cleanupVotesError.message)
    } else {
      console.log('✅ Test votes cleaned up')
    }
    
    const { error: cleanupVendorError } = await supabase
      .from('vendors')
      .delete()
      .eq('id', testVendorId)
    
    if (cleanupVendorError) {
      console.log('❌ Error cleaning up vendor:', cleanupVendorError.message)
    } else {
      console.log('✅ Test vendor cleaned up')
    }
    
    const { error: cleanupUserError } = await supabase
      .from('users')
      .delete()
      .eq('fid', testUserFid)
    
    if (cleanupUserError) {
      console.log('❌ Error cleaning up user:', cleanupUserError.message)
    } else {
      console.log('✅ Test user cleaned up')
    }
    
    console.log('\n🎉 Voting system test completed successfully!')
    
  } catch (error) {
    console.log('❌ Unexpected error:', error)
  }
}

testVotingSystem() 