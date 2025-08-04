import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVendorRegistration() {
  console.log('🧪 Testing Vendor Registration Flow...\n')

  try {
    // Test 1: Register a new vendor
    console.log('1️⃣ Testing vendor registration...')
    
    const testVendor = {
      name: 'Test Vendor Registration',
      description: 'A test vendor created by the registration script',
      zone: 'Centro',
      category: 'Tacos',
      logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      ownerFid: '12345',
      ownerName: 'Test Owner'
    }

    const registrationResponse = await fetch('http://localhost:3000/api/vendors/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testVendor),
    })

    const registrationResult = await registrationResponse.json()
    
    if (registrationResult.success) {
      console.log('✅ Vendor registration successful!')
      console.log(`   Vendor ID: ${registrationResult.data.id}`)
      console.log(`   Name: ${registrationResult.data.name}`)
      console.log(`   Verified: ${registrationResult.data.is_verified}`)
    } else {
      console.log('❌ Vendor registration failed:', registrationResult.error)
      return
    }

    const vendorId = registrationResult.data.id

    // Test 2: Submit verification
    console.log('\n2️⃣ Testing vendor verification submission...')
    
    const verificationData = {
      vendorId,
      ownerFid: '12345',
      businessLicense: 'LIC123456',
      locationPhoto: 'https://example.com/location-photo.jpg',
      socialMedia: 'https://instagram.com/testvendor',
      receipt: '',
      communityVouch: ''
    }

    const verificationResponse = await fetch('http://localhost:3000/api/vendors/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    })

    const verificationResult = await verificationResponse.json()
    
    if (verificationResult.success) {
      console.log('✅ Verification submission successful!')
      console.log(`   Verification ID: ${verificationResult.data.verificationId}`)
      console.log(`   Status: ${verificationResult.data.status}`)
    } else {
      console.log('❌ Verification submission failed:', verificationResult.error)
    }

    // Test 3: Check vendor in database
    console.log('\n3️⃣ Checking vendor in database...')
    
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()

    if (vendorError) {
      console.log('❌ Error fetching vendor:', vendorError)
    } else {
      console.log('✅ Vendor found in database!')
      console.log(`   Name: ${vendor.name}`)
      console.log(`   Owner FID: ${vendor.owner_fid}`)
      console.log(`   Verified: ${vendor.is_verified}`)
      console.log(`   Created: ${vendor.created_at}`)
    }

    // Test 4: Check verification in database
    console.log('\n4️⃣ Checking verification in database...')
    
    const { data: verification, error: verificationError } = await supabase
      .from('vendor_verifications')
      .select('*')
      .eq('vendor_id', vendorId)
      .single()

    if (verificationError) {
      console.log('❌ Error fetching verification:', verificationError)
    } else {
      console.log('✅ Verification found in database!')
      console.log(`   Status: ${verification.status}`)
      console.log(`   Business License: ${verification.business_license}`)
      console.log(`   Social Media: ${verification.social_media}`)
      console.log(`   Submitted: ${verification.submitted_at}`)
    }

    // Test 5: Test admin approval (simulated)
    console.log('\n5️⃣ Testing admin approval (simulated)...')
    
    const approvalResponse = await fetch('http://localhost:3000/api/vendors/verify', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verificationId: verificationResult.data.verificationId,
        status: 'approved',
        reviewerNotes: 'Approved by test script',
        adminFid: '99999'
      }),
    })

    const approvalResult = await approvalResponse.json()
    
    if (approvalResult.success) {
      console.log('✅ Admin approval successful!')
    } else {
      console.log('❌ Admin approval failed:', approvalResult.error)
    }

    // Test 6: Check final vendor status
    console.log('\n6️⃣ Checking final vendor status...')
    
    const { data: finalVendor, error: finalVendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()

    if (finalVendorError) {
      console.log('❌ Error fetching final vendor status:', finalVendorError)
    } else {
      console.log('✅ Final vendor status:')
      console.log(`   Verified: ${finalVendor.is_verified}`)
      console.log(`   Updated: ${finalVendor.updated_at}`)
    }

    console.log('\n🎉 All tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVendorRegistration()
  .then(() => {
    console.log('\nScript completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 