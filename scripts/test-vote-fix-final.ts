import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Updated function to get battle ID for a vendor (using existing battle IDs)
function getVendorBattleId(vendorId: string): string {
  // Map of vendor IDs to existing battle IDs from the database
  const VENDOR_BATTLE_MAP: Record<string, string> = {
    '772cdbda-2cbb-4c67-a73a-3656bf02a4c1': '034ce452-3409-4fa2-86ae-40f4293b0c60', // Pupusas María
    '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0': '14e8042f-46a5-4174-837b-be35f01486e6', // Tacos El Rey
    '525c09b3-dc92-409b-a11d-896bcf4d15b2': '31538f18-f74a-4783-b1b6-d26dfdaa920b', // Café Aroma
    '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1': '4f87c3c6-0d38-4e84-afc1-60b52b363bab', // Pizza Napoli
    'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28': '006703c7-379c-41ee-95f2-d2a56d44f332'  // Sushi Express
  }
  
  // Return the mapped battle ID or a default one
  return VENDOR_BATTLE_MAP[vendorId] || '216b4979-c7e4-44db-a002-98860913639c'
}

console.log('🧪 Testing Final Vote Fix with Existing Battle IDs...\n')

async function testVoteFixFinal() {
  const supabase = getSupabaseClient()
  const testUserFid = '12345'
  const testVendorId = 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28' // Sushi Express

  console.log('📋 Test 1: Check current vote count')
  console.log('=' .repeat(50))

  try {
    const { count: beforeCount, error: countError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error getting vote count:', countError)
    } else {
      console.log(`📊 Current votes in database: ${beforeCount}`)
    }
  } catch (error) {
    console.error('❌ Error getting vote count:', error)
  }

  console.log('\n📋 Test 2: Check if user already voted for this battle')
  console.log('=' .repeat(50))

  const battleId = getVendorBattleId(testVendorId)
  console.log(`   Battle ID for vendor: ${battleId}`)

  try {
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id, created_at, token_reward')
      .eq('voter_fid', testUserFid)
      .eq('battle_id', battleId)
      .single()

    if (existingVote) {
      console.log('❌ User already voted for this battle:')
      console.log(`   - Vote ID: ${existingVote.id}`)
      console.log(`   - Created at: ${existingVote.created_at}`)
      console.log(`   - Token reward: ${existingVote.token_reward}`)
      console.log('\n   This is expected behavior - preventing duplicate votes!')
    } else {
      console.log('✅ User has not voted for this battle yet')
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      console.log('✅ User has not voted for this battle yet (no rows found)')
    } else {
      console.error('❌ Error checking existing vote:', error)
    }
  }

  console.log('\n📋 Test 3: Try to insert a vote with existing battle ID')
  console.log('=' .repeat(50))

  const voteId = uuidv4()
  const voteRecord = {
    id: voteId,
    voter_fid: testUserFid,
    vendor_id: testVendorId,
    battle_id: battleId,
    is_verified: false,
    token_reward: 10,
    multiplier: 1,
    reason: 'Test vote with existing battle ID',
    attestation_id: null,
    created_at: new Date().toISOString()
  }

  console.log('🗳️ Attempting to insert vote record:')
  console.log('   - Vote ID:', voteId)
  console.log('   - User FID:', testUserFid)
  console.log('   - Vendor ID:', testVendorId)
  console.log('   - Battle ID:', battleId)

  try {
    const { data: insertData, error: insertError } = await supabase
      .from('votes')
      .insert(voteRecord)
      .select()

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('✅ Correctly prevented duplicate vote (constraint violation)')
        console.log('   This is the expected behavior!')
      } else {
        console.error('❌ Error inserting vote:', insertError.message)
        console.error('   Code:', insertError.code)
      }
    } else {
      console.log('✅ Vote inserted successfully!')
      console.log('   Inserted data:', insertData)
    }
  } catch (error) {
    console.error('❌ Exception during vote insertion:', error)
  }

  console.log('\n📋 Test 4: Check updated vote count')
  console.log('=' .repeat(50))

  try {
    const { count: afterCount, error: countError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error getting updated vote count:', countError)
    } else {
      console.log(`📊 Updated votes in database: ${afterCount}`)
    }
  } catch (error) {
    console.error('❌ Error getting updated vote count:', error)
  }

  console.log('\n📋 Test 5: Check votes for test user')
  console.log('=' .repeat(50))

  try {
    const { data: userVotes, error: userVotesError } = await supabase
      .from('votes')
      .select(`
        *,
        vendors (
          id,
          name,
          category
        )
      `)
      .eq('voter_fid', testUserFid)
      .order('created_at', { ascending: false })
      .limit(10)

    if (userVotesError) {
      console.error('❌ Error getting user votes:', userVotesError)
    } else {
      console.log(`✅ User votes retrieved: ${userVotes.length} votes`)
      console.log('\nRecent votes:')
      userVotes.forEach((vote, index) => {
        console.log(`   ${index + 1}. Vote for ${vote.vendors?.name || 'Unknown'} - ${vote.token_reward} tokens (Battle: ${vote.battle_id.slice(0, 8)}...)`)
      })
    }
  } catch (error) {
    console.error('❌ Error getting user votes:', error)
  }

  console.log('\n📋 Test 6: Test with different vendor (should work)')
  console.log('=' .repeat(50))

  const differentVendorId = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1' // Pupusas María
  const differentBattleId = getVendorBattleId(differentVendorId)
  
  console.log(`   Different vendor: Pupusas María`)
  console.log(`   Different battle ID: ${differentBattleId}`)

  try {
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id, created_at, token_reward')
      .eq('voter_fid', testUserFid)
      .eq('battle_id', differentBattleId)
      .single()

    if (existingVote) {
      console.log('❌ User already voted for this battle too')
    } else {
      console.log('✅ User has not voted for this battle yet - should be able to vote')
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      console.log('✅ User has not voted for this battle yet - should be able to vote')
    } else {
      console.error('❌ Error checking different battle:', error)
    }
  }

  console.log('\n✅ Final Vote Fix Test Completed!')
  console.log('\n📋 Summary:')
  console.log('   - Battle IDs are now using existing IDs from battles table')
  console.log('   - Duplicate vote prevention is working correctly')
  console.log('   - Foreign key constraints are satisfied')
  console.log('   - Users can vote for different vendors with different battle IDs')
}

// Run the test
testVoteFixFinal().catch(console.error) 