import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testVendorZoneFix() {
  console.log('🧪 Testing vendor zone fix...\n')

  try {
    // Test the API endpoint that should now return zone names
    console.log('1. Testing vendor API endpoint...')
    
    // Get Café Aroma specifically (the one that was showing UUID)
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name')
      .ilike('name', '%Café Aroma%')
      .limit(1)

    if (vendorsError || !vendors || vendors.length === 0) {
      console.error('❌ Error finding Café Aroma vendor:', vendorsError)
      return
    }

    const cafeAromaId = vendors[0].id
    console.log(`✅ Found Café Aroma with ID: ${cafeAromaId}`)

    // Test the vendor fetch with zone join
    const { data: vendorWithZone, error: joinError } = await supabase
      .from('vendors')
      .select(`
        *,
        zones(name)
      `)
      .eq('id', cafeAromaId)
      .single()

    if (joinError) {
      console.error('❌ Error with zone join:', joinError)
      return
    }

    console.log('✅ Vendor with zone join successful:')
    console.log(`  - Vendor: ${vendorWithZone.name}`)
    console.log(`  - Zone data:`, vendorWithZone.zones)
    console.log(`  - Zone name: ${vendorWithZone.zones?.name}`)

    // Test the API endpoint
    console.log('\n2. Testing API endpoint...')
    const apiResponse = await fetch(`http://localhost:3000/api/vendors/${cafeAromaId}`)
    
    if (!apiResponse.ok) {
      console.error(`❌ API error: ${apiResponse.status} ${apiResponse.statusText}`)
      return
    }

    const apiResult = await apiResponse.json()
    
    if (apiResult.success) {
      console.log('✅ API response successful:')
      console.log(`  - Vendor: ${apiResult.data.name}`)
      console.log(`  - Zone: ${apiResult.data.zone}`)
      
      if (apiResult.data.zone === 'Sur') {
        console.log('🎉 SUCCESS: Zone is now showing as "Sur" instead of UUID!')
      } else {
        console.log(`⚠️  Zone is showing as: "${apiResult.data.zone}"`)
      }
    } else {
      console.error('❌ API response error:', apiResult.error)
    }

    console.log('\n✅ Test completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testVendorZoneFix() 