// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

// Create Supabase client directly (like in the working test)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testVotingReal() {
  console.log('🧪 Testing Voting System with Real Supabase...\n')

  // Test 1: Direct Supabase query
  console.log('1️⃣ Testing direct Supabase query...')
  try {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(3)

    if (error) {
      console.log('❌ Supabase error:', error)
    } else {
      console.log('✅ Vendors from Supabase:')
      vendors?.forEach(vendor => {
        console.log(`   - ${vendor.name} (${vendor.id})`)
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }

  // Test 2: Test vendor lookup
  console.log('\n2️⃣ Testing vendor lookup...')
  const testVendorId = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1'
  
  try {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', testVendorId)
      .single()

    if (error) {
      console.log('❌ Vendor lookup error:', error)
    } else if (vendor) {
      console.log(`✅ Found vendor: ${vendor.name}`)
    } else {
      console.log('❌ Vendor not found')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }

  // Test 3: Test vote insertion
  console.log('\n3️⃣ Testing vote insertion...')
  const testVote = {
    id: `test_${Date.now()}`,
    voter_fid: 12345,
    vendor_id: testVendorId,
    battle_id: '034ce452-3409-4fa2-86ae-40f4293b0c60', // Pupusas María battle
    is_verified: false,
    token_reward: 10,
    multiplier: 1,
    reason: 'Test vote',
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('votes')
      .insert(testVote)
      .select()

    if (error) {
      console.log('❌ Vote insertion error:', error)
    } else {
      console.log('✅ Vote inserted successfully!')
      console.log('   Vote ID:', data?.[0]?.id)
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }

  console.log('\n🎉 Real voting test completed!')
}

// Run the test
testVotingReal().catch(console.error) 