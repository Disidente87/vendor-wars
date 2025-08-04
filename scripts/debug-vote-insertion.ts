import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugVoteInsertion() {
  console.log('🔍 Debugging vote insertion...\n')

  try {
    // 1. Check if we can access the votes table
    console.log('1. Checking votes table access...')
    
    const { data: existingVotes, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('❌ Cannot access votes table:', checkError)
      return
    }

    console.log('✅ Votes table accessible')
    console.log('📊 Sample vote structure:', Object.keys(existingVotes[0] || {}))

    // 2. Get existing users
    console.log('\n2. Getting existing users...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid')
      .limit(5)

    if (usersError) {
      console.log('❌ Cannot get users:', usersError.message)
      return
    }

    console.log('✅ Found users:', users.map(u => u.fid))

    // 3. Get existing battles
    console.log('\n3. Getting existing battles...')
    
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('id')
      .limit(1)

    if (battlesError) {
      console.log('❌ Cannot get battles:', battlesError.message)
      return
    }

    console.log('✅ Found battles:', battles.map(b => b.id))

    // 4. Try to insert a vote with valid data
    console.log('\n4. Testing vote insertion with valid data...')
    
    const testVote = {
      id: uuidv4(),
      voter_fid: users[0].fid,
      vendor_id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
      battle_id: battles[0].id,
      is_verified: false,
      token_reward: 10,
      multiplier: 1,
      reason: 'Test vote with valid data',
      attestation_id: null,
      created_at: new Date().toISOString()
    }

    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert(testVote)
      .select()

    if (voteError) {
      console.log('❌ Vote insertion failed:', voteError.message)
      console.log('   Error code:', voteError.code)
      console.log('   Error details:', voteError.details)
    } else {
      console.log('✅ Vote insertion successful!')
      
      // Clean up
      await supabase
        .from('votes')
        .delete()
        .eq('id', vote[0].id)
      console.log('✅ Test vote cleaned up')
    }

    // 5. Check vendor exists
    console.log('\n5. Checking vendor exists...')
    
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('id', '772cdbda-2cbb-4c67-a73a-3656bf02a4c1')
      .single()

    if (vendorError) {
      console.log('❌ Vendor not found:', vendorError.message)
    } else {
      console.log('✅ Vendor found:', vendor.name)
    }

    console.log('\n🎉 Debug completed!')
    console.log('\nRecommendations:')
    console.log('1. If battle_id is required, create the battles table')
    console.log('2. If battle_id can be nullable, modify the table schema')
    console.log('3. Check foreign key constraints')

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugVoteInsertion() 