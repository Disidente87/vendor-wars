import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import * as crypto from 'crypto'

// Function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Updated function to get battle ID for a vendor (temporary implementation)
function getVendorBattleId(vendorId: string): string {
  // TODO: Implement proper battle system
  // For now, create a unique battle ID per vote to allow multiple votes per vendor
  // This allows multiple votes per vendor while maintaining database integrity
  // Generate a unique UUID with timestamp to ensure each vote gets a unique battle ID
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 15)
  const hash = crypto.createHash('md5').update(`temp-battle-${vendorId}-${timestamp}-${randomPart}`).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

console.log('🧪 Testing Vote Fix with Unique Battle IDs...\n')

async function testVoteFix() {
  const supabase = getSupabaseClient()
  const testUserFid = '12345'
  const testVendorId = 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28' // Sushi Express

  console.log('📋 Test 1: Generate multiple unique battle IDs')
  console.log('=' .repeat(50))

  const battleIds = []
  for (let i = 0; i < 5; i++) {
    const battleId = getVendorBattleId(testVendorId)
    battleIds.push(battleId)
    console.log(`   Battle ID ${i + 1}: ${battleId}`)
  }

  // Check if all battle IDs are unique
  const uniqueBattleIds = new Set(battleIds)
  console.log(`\n✅ Unique battle IDs: ${uniqueBattleIds.size}/${battleIds.length}`)

  console.log('\n📋 Test 2: Check current vote count')
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

  console.log('\n📋 Test 3: Insert multiple votes with unique battle IDs')
  console.log('=' .repeat(50))

  const votesToInsert = []
  for (let i = 0; i < 3; i++) {
    const voteId = uuidv4()
    const battleId = getVendorBattleId(testVendorId)
    
    const voteRecord = {
      id: voteId,
      voter_fid: testUserFid,
      vendor_id: testVendorId,
      battle_id: battleId,
      is_verified: false,
      token_reward: 10 + (i * 5), // Different token rewards
      multiplier: 1,
      reason: `Test vote ${i + 1} with unique battle ID`,
      attestation_id: null,
      created_at: new Date().toISOString()
    }

    votesToInsert.push({ voteRecord, battleId })
    
    console.log(`   Vote ${i + 1}:`)
    console.log(`     - Vote ID: ${voteId}`)
    console.log(`     - Battle ID: ${battleId}`)
    console.log(`     - Token Reward: ${voteRecord.token_reward}`)
  }

  console.log('\n📋 Test 4: Insert votes one by one')
  console.log('=' .repeat(50))

  let successfulInserts = 0
  for (let i = 0; i < votesToInsert.length; i++) {
    const { voteRecord, battleId } = votesToInsert[i]
    
    console.log(`\n   Inserting vote ${i + 1}...`)
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('votes')
        .insert(voteRecord)
        .select()

      if (insertError) {
        console.error(`   ❌ Error inserting vote ${i + 1}:`, insertError.message)
        console.error(`   Code: ${insertError.code}`)
      } else {
        console.log(`   ✅ Vote ${i + 1} inserted successfully!`)
        console.log(`   Inserted data:`, insertData)
        successfulInserts++
      }
    } catch (error) {
      console.error(`   ❌ Exception during vote ${i + 1} insertion:`, error)
    }
  }

  console.log(`\n📊 Successful inserts: ${successfulInserts}/${votesToInsert.length}`)

  console.log('\n📋 Test 5: Check updated vote count')
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

  console.log('\n📋 Test 6: Check votes for test user')
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
      .limit(20)

    if (userVotesError) {
      console.error('❌ Error getting user votes:', userVotesError)
    } else {
      console.log(`✅ User votes retrieved: ${userVotes.length} votes`)
      console.log('\nRecent votes:')
      userVotes.slice(0, 10).forEach((vote, index) => {
        console.log(`   ${index + 1}. Vote for ${vote.vendors?.name || 'Unknown'} - ${vote.token_reward} tokens (Battle: ${vote.battle_id.slice(0, 8)}...)`)
      })
    }
  } catch (error) {
    console.error('❌ Error getting user votes:', error)
  }

  console.log('\n✅ Vote Fix Test Completed!')
}

// Run the test
testVoteFix().catch(console.error) 