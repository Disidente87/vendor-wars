import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map of vendor IDs to their battle IDs (same as in voting service)
const VENDOR_BATTLE_MAP: Record<string, string> = {
  '772cdbda-2cbb-4c67-a73a-3656bf02a4c1': '034ce452-3409-4fa2-86ae-40f4293b0c60', // Pupusas María
  '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0': '14e8042f-46a5-4174-837b-be35f01486e6', // Tacos El Rey
  '525c09b3-dc92-409b-a11d-896bcf4d15b2': '31538f18-f74a-4783-b1b6-d26dfdaa920b', // Café Aroma
  '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1': '4f87c3c6-0d38-4e84-afc1-60b52b363bab', // Pizza Napoli
  'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28': '006703c7-379c-41ee-95f2-d2a56d44f332'  // Sushi Express
}

// Function to get battle ID for a vendor (same as in voting service)
function getVendorBattleId(vendorId: string): string {
  return VENDOR_BATTLE_MAP[vendorId] || '216b4979-c7e4-44db-a002-98860913639c' // fallback to existing battle
}

async function testVoteInsertion() {
  console.log('🧪 Testing vote insertion with unique battle IDs...\n')

  try {
    // 1. Get existing users
    console.log('1. Getting existing users...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid')
      .limit(5)

    if (usersError) {
      console.log('❌ Cannot get users:', usersError.message)
      return
    }

    console.log('✅ Found users:', users.map(u => u.fid))

    // 2. Test multiple votes for different vendors
    const testVendors = [
      '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
      '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Tacos El Rey
      '525c09b3-dc92-409b-a11d-896bcf4d15b2'  // Café Aroma
    ]

    for (let i = 0; i < testVendors.length; i++) {
      const vendorId = testVendors[i]
      const userId = users[0].fid
      
      console.log(`\n${i + 1}. Testing vote for vendor ${vendorId}...`)
      
      // Get battle ID for this vendor
      const battleId = getVendorBattleId(vendorId)
      
      const testVote = {
        id: uuidv4(),
        voter_fid: userId,
        vendor_id: vendorId,
        battle_id: battleId,
        is_verified: false,
        token_reward: 10,
        multiplier: 1,
        reason: `Test vote ${i + 1} for vendor ${vendorId}`,
        attestation_id: null,
        created_at: new Date().toISOString()
      }

      const { data: vote, error: voteError } = await supabase
        .from('votes')
        .insert(testVote)
        .select()

      if (voteError) {
        console.log(`❌ Vote ${i + 1} failed:`, voteError.message)
        console.log('   Error code:', voteError.code)
        console.log('   Error details:', voteError.details)
      } else {
        console.log(`✅ Vote ${i + 1} successful!`)
        console.log(`   Battle ID: ${battleId}`)
        
        // Clean up
        await supabase
          .from('votes')
          .delete()
          .eq('id', vote[0].id)
        console.log(`   ✅ Test vote ${i + 1} cleaned up`)
      }
    }

    console.log('\n🎉 Test completed!')
    console.log('\nResults:')
    console.log('- Each vote should have a unique battle_id')
    console.log('- No duplicate key violations should occur')
    console.log('- Users should be able to vote for multiple vendors')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testVoteInsertion() 