import { createClient } from '@supabase/supabase-js'
import { VotingService } from '../src/services/voting'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Function to get battle ID based on user FID (same as in voting.ts)
function getUserBattleId(userFid: string, voteNumber: number = 1): string {
  const paddedFid = userFid.padStart(10, '0')
  const paddedVoteNumber = voteNumber.toString().padStart(12, '0')
  return `${paddedFid}-0000-0000-0000-${paddedVoteNumber}`
}

async function testUserBattleSystem() {
  console.log('🧪 Testing User-Based Battle ID System...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test parameters
  const testUserFid = '465823' // Your user FID
  const testVendorId = '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1' // Pizza Napoli

  console.log('📋 Test Parameters:')
  console.log('- User FID:', testUserFid)
  console.log('- Vendor ID:', testVendorId)
  console.log()

  // 1. Test battle ID generation
  console.log('1️⃣ Testing battle ID generation...')
  for (let i = 1; i <= 5; i++) {
    const battleId = getUserBattleId(testUserFid, i)
    console.log(`  Vote ${i}: ${battleId}`)
  }
  console.log()

  // 2. Check if battle IDs exist in database
  console.log('2️⃣ Checking battle IDs in database...')
  for (let i = 1; i <= 5; i++) {
    const battleId = getUserBattleId(testUserFid, i)
    const { data, error } = await supabase
      .from('battles')
      .select('id, name')
      .eq('id', battleId)
      .single()

    if (error) {
      console.log(`  ❌ Battle ${battleId} not found: ${error.message}`)
    } else {
      console.log(`  ✅ Battle ${battleId} exists: ${data.name}`)
    }
  }
  console.log()

  // 3. Check current votes for this user/vendor
  console.log('3️⃣ Checking current votes...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: currentVotes, error: votesError } = await supabase
    .from('votes')
    .select('id, battle_id, created_at')
    .eq('voter_fid', testUserFid)
    .eq('vendor_id', testVendorId)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .order('created_at')

  if (votesError) {
    console.log('❌ Error fetching votes:', votesError.message)
  } else {
    console.log(`✅ Found ${currentVotes?.length || 0} votes today for this user/vendor`)
    currentVotes?.forEach((vote, index) => {
      console.log(`  Vote ${index + 1}: ${vote.battle_id} at ${vote.created_at}`)
    })
  }
  console.log()

  // 4. Test first vote
  console.log('4️⃣ Testing first vote...')
  try {
    const result = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('First vote result:', {
      success: result.success,
      error: result.error,
      tokensEarned: result.tokensEarned
    })
  } catch (error) {
    console.log('❌ First vote failed:', error)
  }
  console.log()

  // 5. Test second vote
  console.log('5️⃣ Testing second vote...')
  try {
    const result = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Second vote result:', {
      success: result.success,
      error: result.error,
      tokensEarned: result.tokensEarned
    })
  } catch (error) {
    console.log('❌ Second vote failed:', error)
  }
  console.log()

  // 6. Test third vote
  console.log('6️⃣ Testing third vote...')
  try {
    const result = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Third vote result:', {
      success: result.success,
      error: result.error,
      tokensEarned: result.tokensEarned
    })
  } catch (error) {
    console.log('❌ Third vote failed:', error)
  }
  console.log()

  // 7. Test fourth vote (should be rejected)
  console.log('7️⃣ Testing fourth vote (should be rejected)...')
  try {
    const result = await VotingService.registerVote({
      userFid: testUserFid,
      vendorId: testVendorId,
      voteType: 'regular'
    })

    console.log('Fourth vote result:', {
      success: result.success,
      error: result.error,
      tokensEarned: result.tokensEarned
    })
  } catch (error) {
    console.log('❌ Fourth vote failed:', error)
  }
  console.log()

  // 8. Final vote count
  console.log('8️⃣ Final vote count...')
  const { data: finalVotes, error: finalError } = await supabase
    .from('votes')
    .select('id, battle_id, created_at')
    .eq('voter_fid', testUserFid)
    .eq('vendor_id', testVendorId)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .order('created_at')

  if (finalError) {
    console.log('❌ Error fetching final votes:', finalError.message)
  } else {
    console.log(`✅ Final count: ${finalVotes?.length || 0} votes today`)
    finalVotes?.forEach((vote, index) => {
      console.log(`  Vote ${index + 1}: ${vote.battle_id} at ${vote.created_at}`)
    })
  }
  console.log()

  // 9. Check vendor stats
  console.log('9️⃣ Checking vendor stats...')
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id, name, total_votes, verified_votes')
    .eq('id', testVendorId)
    .single()

  if (vendorError) {
    console.log('❌ Error fetching vendor:', vendorError.message)
  } else {
    console.log('✅ Vendor stats:', {
      name: vendor.name,
      total_votes: vendor.total_votes,
      verified_votes: vendor.verified_votes
    })
  }

  console.log('\n✅ User battle system test complete!')
}

testUserBattleSystem().catch(console.error) 