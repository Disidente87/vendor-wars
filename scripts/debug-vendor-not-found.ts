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

async function debugVendorNotFound() {
  console.log('🔍 Debugging "Vendor not found" issue...\n')

  // Test vendor ID (Pizza Napoli from mock data)
  const testVendorId = '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1'
  const testUserFid = '12345' // Test user

  console.log('📋 Test Parameters:')
  console.log('- Vendor ID:', testVendorId)
  console.log('- User FID:', testUserFid)
  console.log('- Supabase URL:', supabaseUrl)
  console.log('- Supabase Key:', supabaseKey.substring(0, 20) + '...')
  console.log()

  // 1. Test Supabase connection
  console.log('1️⃣ Testing Supabase connection...')
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('id', testVendorId)
      .single()

    if (error) {
      console.log('❌ Supabase error:', error.message)
    } else if (data) {
      console.log('✅ Found vendor in Supabase:', data.name)
    } else {
      console.log('⚠️ Vendor not found in Supabase')
    }
  } catch (error) {
    console.log('❌ Supabase connection failed:', error)
  }
  console.log()

  // 2. Test mock vendor lookup
  console.log('2️⃣ Testing mock vendor lookup...')
  try {
    const { VotingService } = await import('../src/services/voting')
    // We need to access the mock vendors directly
    const mockVendors = [
      {
        id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
        name: 'Pupusas María'
      },
      {
        id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
        name: 'Tacos El Rey'
      },
      {
        id: '525c09b3-dc92-409b-a11d-896bcf4d15b2',
        name: 'Café Aroma'
      },
      {
        id: '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1',
        name: 'Pizza Napoli'
      },
      {
        id: 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28',
        name: 'Sushi Express'
      }
    ]

    const mockVendor = mockVendors.find(v => v.id === testVendorId)
    if (mockVendor) {
      console.log('✅ Found vendor in mock data:', mockVendor.name)
    } else {
      console.log('❌ Vendor not found in mock data')
      console.log('Available mock vendors:', mockVendors.map(v => `${v.name} (${v.id})`))
    }
  } catch (error) {
    console.log('❌ Mock vendor lookup failed:', error)
  }
  console.log()

  // 3. Test first vote
  console.log('3️⃣ Testing first vote...')
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

  // 4. Test second vote (this should fail with "Vendor not found")
  console.log('4️⃣ Testing second vote (should show "Vendor not found")...')
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

  // 5. Check current votes in database
  console.log('5️⃣ Checking current votes in database...')
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: votes, error } = await supabase
      .from('votes')
      .select('id, voter_fid, vendor_id, created_at')
      .eq('voter_fid', testUserFid)
      .eq('vendor_id', testVendorId)

    if (error) {
      console.log('❌ Error fetching votes:', error.message)
    } else {
      console.log(`✅ Found ${votes?.length || 0} votes for this user/vendor`)
      if (votes && votes.length > 0) {
        votes.forEach((vote, index) => {
          console.log(`  Vote ${index + 1}: ${vote.id} at ${vote.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log('❌ Error checking votes:', error)
  }
  console.log()

  console.log('🔍 Debug complete!')
}

debugVendorNotFound().catch(console.error) 