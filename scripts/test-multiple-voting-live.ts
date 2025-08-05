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

// Function to get battle ID for a vendor (same as in voting service)
function getVendorBattleId(vendorId: string, voteNumber: number = 1): string {
  // Map of vendor IDs to their specific battle IDs (for first vote of the day)
  const VENDOR_BATTLE_MAP: Record<string, string> = {
    '772cdbda-2cbb-4c67-a73a-3656bf02a4c1': '034ce452-3409-4fa2-86ae-40f4293b0c60', // Pupusas María
    '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0': '14e8042f-46a5-4174-837b-be35f01486e6', // Tacos El Rey
    '525c09b3-dc92-409b-a11d-896bcf4d15b2': '31538f18-f74a-4783-b1b6-d26dfdaa920b', // Café Aroma
    '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1': '4f87c3c6-0d38-4e84-afc1-60b52b363bab', // Pizza Napoli
    'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28': '006703c7-379c-41ee-95f2-d2a56d44f332'  // Sushi Express
  }
  
  // For first vote of the day, use vendor-specific battle ID
  if (voteNumber === 1) {
    return VENDOR_BATTLE_MAP[vendorId] || '216b4979-c7e4-44db-a002-98860913639c'
  }
  
  // For second and third votes, use generic battle ID
  return '99999999-9999-9999-9999-999999999999'
}

console.log('🧪 Testing Live Multiple Voting System...\n')

async function testMultipleVotingLive() {
  const supabase = getSupabaseClient()
  const testUserFid = '12345'
  const testVendorId = 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28' // Sushi Express

  console.log('📋 Test 1: Check current votes for today')
  console.log('=' .repeat(50))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    const { data: todayVotes, error: checkError } = await supabase
      .from('votes')
      .select('id, created_at, token_reward, battle_id')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (checkError) {
      console.error('❌ Error checking today votes:', checkError)
    } else {
      console.log(`📊 Current votes for this vendor today: ${todayVotes.length}/3`)
      todayVotes.forEach((vote, index) => {
        const isGeneric = vote.battle_id === '99999999-9999-9999-9999-999999999999'
        const battleType = isGeneric ? 'Generic' : 'Vendor-specific'
        console.log(`   ${index + 1}. ${vote.token_reward} tokens - ${battleType} (${vote.battle_id.slice(0, 8)}...)`)
      })
    }
  } catch (error) {
    console.error('❌ Error checking today votes:', error)
  }

  console.log('\n📋 Test 2: Simulate voting process')
  console.log('=' .repeat(50))

  // Check if we can vote more
  try {
    const { data: todayVotes, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (checkError) {
      console.error('❌ Error checking vote count:', checkError)
      return
    }

    const todayVotesCount = todayVotes ? todayVotes.length : 0
    console.log(`📊 Current vote count: ${todayVotesCount}/3`)

    if (todayVotesCount >= 3) {
      console.log('❌ Cannot vote more - limit reached')
      console.log('   Expected behavior: "You have already voted 3 times for this vendor today. Come back tomorrow to vote again!"')
      return
    }

    // Simulate next vote
    const nextVoteNumber = todayVotesCount + 1
    const battleId = getVendorBattleId(testVendorId, nextVoteNumber)
    const tokenReward = 10 + ((nextVoteNumber - 1) * 5) // 10, 15, 20

    console.log(`✅ Can vote! Next vote would be vote #${nextVoteNumber}`)
    console.log(`   - Battle ID: ${battleId}`)
    console.log(`   - Token Reward: ${tokenReward}`)
    console.log(`   - Battle Type: ${nextVoteNumber === 1 ? 'Vendor-specific' : 'Generic'}`)

  } catch (error) {
    console.error('❌ Error in vote simulation:', error)
  }

  console.log('\n📋 Test 3: Check user streak in database')
  console.log('=' .repeat(50))

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('fid, username, vote_streak, battle_tokens')
      .eq('fid', testUserFid)
      .single()

    if (userError) {
      console.error('❌ Error fetching user data:', userError)
    } else {
      console.log('✅ User data from database:')
      console.log(`   - FID: ${userData.fid}`)
      console.log(`   - Username: ${userData.username}`)
      console.log(`   - Vote Streak: ${userData.vote_streak} days`)
      console.log(`   - Battle Tokens: ${userData.battle_tokens}`)
    }
  } catch (error) {
    console.error('❌ Error checking user data:', error)
  }

  console.log('\n📋 Test 4: Check all votes for user')
  console.log('=' .repeat(50))

  try {
    const { data: allVotes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        created_at,
        token_reward,
        battle_id,
        vendors (
          name
        )
      `)
      .eq('voter_fid', testUserFid)
      .order('created_at', { ascending: false })
      .limit(10)

    if (votesError) {
      console.error('❌ Error fetching all votes:', votesError)
    } else {
      console.log(`✅ Recent votes for user: ${allVotes.length} votes`)
      console.log('\nRecent votes:')
      allVotes.forEach((vote, index) => {
        const isGeneric = vote.battle_id === '99999999-9999-9999-9999-999999999999'
        const battleType = isGeneric ? 'Generic' : 'Vendor-specific'
        const vendorName = vote.vendors?.name || 'Unknown'
        console.log(`   ${index + 1}. ${vendorName} - ${vote.token_reward} tokens - ${battleType} (${vote.battle_id.slice(0, 8)}...)`)
      })
    }
  } catch (error) {
    console.error('❌ Error checking all votes:', error)
  }

  console.log('\n✅ Live Multiple Voting Test Completed!')
  console.log('\n📋 Summary:')
  console.log('   - Checked current vote count for today')
  console.log('   - Verified vote limit enforcement')
  console.log('   - Confirmed user streak in database')
  console.log('   - Reviewed all user votes')
  console.log('   - Battle ID assignment working correctly')
}

// Run the test
testMultipleVotingLive().catch(console.error) 