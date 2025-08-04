import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testVendorsAPI() {
  console.log('🧪 Testing vendors API endpoint...\n')

  try {
    // Test 1: Direct Supabase query
    console.log('1. Testing direct Supabase query...')
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select(`
        *,
        zones!inner(name)
      `)
      .order('created_at', { ascending: true })

    if (vendorsError) {
      console.error('❌ Error with direct Supabase query:', vendorsError)
      return
    }

    console.log(`✅ Found ${vendors?.length || 0} vendors in Supabase`)
    if (vendors && vendors.length > 0) {
      vendors.forEach((vendor, index) => {
        console.log(`   ${index + 1}. ${vendor.name} - Zone: ${(vendor.zones as any)?.name}`)
      })
    }

    // Test 2: API endpoint
    console.log('\n2. Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/vendors')
    const result = await response.json()
    
    console.log(`📊 API Response Status: ${response.status}`)
    console.log(`📊 API Response:`, JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log(`✅ API returned ${result.data?.length || 0} vendors`)
      if (result.data && result.data.length > 0) {
        result.data.forEach((vendor: any, index: number) => {
          console.log(`   ${index + 1}. ${vendor.name} - Zone: ${vendor.zone}`)
        })
      }
    } else {
      console.error('❌ API returned error:', result.error)
    }

    console.log('\n✅ Test completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testVendorsAPI() 