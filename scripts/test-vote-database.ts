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

// Map of vendor IDs to their battle IDs
const VENDOR_BATTLE_MAP: Record<string, string> = {
  '772cdbda-2cbb-4c67-a73a-3656bf02a4c1': '034ce452-3409-4fa2-86ae-40f4293b0c60', // Pupusas María
  '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0': '14e8042f-46a5-4174-837b-be35f01486e6', // Tacos El Rey
  '525c09b3-dc92-409b-a11d-896bcf4d15b2': '31538f18-f74a-4783-b1b6-d26dfdaa920b', // Café Aroma
  '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1': '4f87c3c6-0d38-4e84-afc1-60b52b363bab', // Pizza Napoli
  'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28': '006703c7-379c-41ee-95f2-d2a56d44f332'  // Sushi Express
}

function getVendorBattleId(vendorId: string): string {
  return VENDOR_BATTLE_MAP[vendorId] || '216b4979-c7e4-44db-a002-98860913639c'
}

console.log('🧪 Testing Vote Database Insertion...\n')

async function testVoteDatabase() {
  const supabase = getSupabaseClient()
  // Test data - using a vendor that maps to a battle where user hasn't voted
  const testUserFid = '12345'
  const testVendorId = 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28' // Sushi Express - maps to battle 006703c7-379c-41ee-95f2-d2a56d44f332
  const testVendorName = 'Sushi Express'

  console.log('📋 Test 1: Check if Supabase is accessible')
  console.log('=' .repeat(50))

  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('votes')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Supabase connection failed:', testError)
      return
    }

    console.log('✅ Supabase connection successful')
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return
  }

  console.log('\n📋 Test 2: Check current votes count')
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

  console.log('\n📋 Test 3: Check if user exists in users table')
  console.log('=' .repeat(50))

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('fid', testUserFid)
      .single()

    if (userError) {
      console.log('⚠️ User not found, creating test user...')
      
      // Create test user
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          fid: testUserFid,
          username: 'testuser',
          display_name: 'Test User',
          pfp_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
          battle_tokens: 0,
          vote_streak: 0,
          created_at: new Date().toISOString()
        })

      if (createUserError) {
        console.error('❌ Error creating test user:', createUserError)
      } else {
        console.log('✅ Test user created successfully')
      }
    } else {
      console.log('✅ Test user exists:', userData.username)
    }
  } catch (error) {
    console.error('❌ Error checking/creating user:', error)
  }

  console.log('\n📋 Test 4: Check if vendor exists')
  console.log('=' .repeat(50))

  try {
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', testVendorId)
      .single()

    if (vendorError) {
      console.log('⚠️ Vendor not found, creating test vendor...')
      
      // Create test vendor
      const { error: createVendorError } = await supabase
        .from('vendors')
        .insert({
          id: testVendorId,
          name: testVendorName,
          category: 'PUPUSAS',
          zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b',
          image_url: 'https://via.placeholder.com/300x200',
          created_at: new Date().toISOString()
        })

      if (createVendorError) {
        console.error('❌ Error creating test vendor:', createVendorError)
      } else {
        console.log('✅ Test vendor created successfully')
      }
    } else {
      console.log('✅ Test vendor exists:', vendorData.name)
    }
  } catch (error) {
    console.error('❌ Error checking/creating vendor:', error)
  }

  console.log('\n📋 Test 4.5: Check all battles and user votes')
  console.log('=' .repeat(50))
  console.log('🔍 Checking all battles and user votes...')

     // Get all battles
   const battlesResult = await supabase
     .from('battles')
     .select('id, zone_id')

  if (battlesResult.data) {
    console.log(`📊 Found ${battlesResult.data.length} battles:`)
    
    for (const battle of battlesResult.data) {
      // Check if user voted for this battle
      const userVoteResult = await supabase
        .from('votes')
        .select('id, vendor_id, token_reward, created_at')
        .eq('voter_fid', testUserFid)
        .eq('battle_id', battle.id)
        .single()
      
             if (userVoteResult.data) {
         console.log(`   ❌ Battle ${battle.id}: User already voted`)
       } else {
         console.log(`   ✅ Battle ${battle.id}: User has NOT voted`)
       }
    }
  } else {
    console.log('❌ Error fetching battles:', battlesResult.error)
  }

  console.log('\n📋 Test 5: Check if user already voted for this vendor/battle')
  console.log('=' .repeat(50))

  const battleId = getVendorBattleId(testVendorId)

  const existingVote = await supabase
    .from('votes')
    .select('*')
    .eq('voter_fid', testUserFid)
    .eq('battle_id', battleId)
    .single()

  if (existingVote.data) {
    console.log('✅ User already voted for this battle:')
    console.log('   - Vote ID:', existingVote.data.id)
    console.log('   - Created at:', existingVote.data.created_at)
    console.log('   - Token reward:', existingVote.data.token_reward)
    console.log('   - Is verified:', existingVote.data.is_verified)
  } else if (existingVote.error && existingVote.error.code === 'PGRST116') {
    console.log('✅ User has not voted for this battle yet')
  } else {
    console.log('❌ Error checking existing vote:', existingVote.error)
  }

  console.log('\n📋 Test 6: Insert test vote directly')
  console.log('=' .repeat(50))

  const voteId = uuidv4()
  const battleIdToInsert = getVendorBattleId(testVendorId)
  
  const voteRecord = {
    id: voteId,
    voter_fid: testUserFid,
    vendor_id: testVendorId,
    battle_id: battleIdToInsert,
    is_verified: false,
    token_reward: 10,
    multiplier: 1,
    reason: 'Test vote for database verification',
    attestation_id: null,
    created_at: new Date().toISOString()
  }

  console.log('🗳️ Attempting to insert vote record:')
  console.log('   - Vote ID:', voteId)
  console.log('   - User FID:', testUserFid)
  console.log('   - Vendor ID:', testVendorId)
  console.log('   - Battle ID:', battleIdToInsert)

  try {
    const { data: insertData, error: insertError } = await supabase
      .from('votes')
      .insert(voteRecord)
      .select()

    if (insertError) {
      console.error('❌ Error inserting vote:', insertError)
      console.error('   - Code:', insertError.code)
      console.error('   - Message:', insertError.message)
      console.error('   - Details:', insertError.details)
      console.error('   - Hint:', insertError.hint)
    } else {
      console.log('✅ Vote inserted successfully!')
      console.log('   - Inserted data:', insertData)
    }
  } catch (error) {
    console.error('❌ Exception during vote insertion:', error)
  }

  console.log('\n📋 Test 7: Verify vote was inserted')
  console.log('=' .repeat(50))

  try {
    const { data: verifyData, error: verifyError } = await supabase
      .from('votes')
      .select('*')
      .eq('id', voteId)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying vote:', verifyError)
    } else {
      console.log('✅ Vote verification successful:')
      console.log('   - Vote ID:', verifyData.id)
      console.log('   - User FID:', verifyData.voter_fid)
      console.log('   - Vendor ID:', verifyData.vendor_id)
      console.log('   - Battle ID:', verifyData.battle_id)
      console.log('   - Token Reward:', verifyData.token_reward)
      console.log('   - Created At:', verifyData.created_at)
    }
  } catch (error) {
    console.error('❌ Error verifying vote:', error)
  }

  console.log('\n📋 Test 8: Check updated vote count')
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

  console.log('\n📋 Test 9: Check votes for test user')
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

    if (userVotesError) {
      console.error('❌ Error getting user votes:', userVotesError)
    } else {
      console.log(`✅ User votes retrieved: ${userVotes.length} votes`)
      userVotes.forEach((vote, index) => {
        console.log(`   ${index + 1}. Vote for ${vote.vendors?.name || 'Unknown'} - ${vote.token_reward} tokens`)
      })
    }
  } catch (error) {
    console.error('❌ Error getting user votes:', error)
  }

  console.log('\n✅ Vote Database Test Completed!')
}

// Run the test
testVoteDatabase().catch(console.error) 