import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkVendorZoneIssue() {
  console.log('🔍 Checking vendor zone issue...\n')

  try {
    // 1. Check the structure of vendors table
    console.log('1. Checking vendors table structure...')
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, zone_id')
      .limit(5)

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }

    console.log('📋 Vendors table structure:')
    vendors?.forEach(vendor => {
      console.log(`  - ${vendor.name}: zone_id="${vendor.zone_id}"`)
    })

    // 2. Check the structure of zones table
    console.log('\n2. Checking zones table structure...')
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name')
      .limit(5)

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
      return
    }

    console.log('📋 Zones table structure:')
    zones?.forEach(zone => {
      console.log(`  - ${zone.name}: id="${zone.id}"`)
    })

    // 3. Try to get a specific vendor with zone info
    console.log('\n3. Testing vendor fetch with zone join...')
    const testVendorId = vendors?.[0]?.id
    if (testVendorId) {
      const { data: vendorWithZone, error: joinError } = await supabase
        .from('vendors')
        .select(`
          *,
          zones(name)
        `)
        .eq('id', testVendorId)
        .single()

      if (joinError) {
        console.error('❌ Error with zone join:', joinError)
      } else {
        console.log('✅ Vendor with zone join successful:')
        console.log(`  - Vendor: ${vendorWithZone.name}`)
        console.log(`  - Zone data:`, vendorWithZone.zones)
      }
    }

    // 4. Check if we need to add a zone column or use zone_id directly
    console.log('\n4. Checking zone field strategy...')
    console.log('ℹ️  Vendors table only has zone_id, not zone name')
    console.log('ℹ️  We need to either:')
    console.log('   a) Add a zone column with zone names')
    console.log('   b) Use zone_id and join with zones table')
    console.log('   c) Update the service to handle zone_id properly')
    
    // Show which vendors have which zone_id
    console.log('\n📋 Vendor zone assignments:')
    vendors?.forEach(vendor => {
      const zone = zones?.find(z => z.id === vendor.zone_id)
      console.log(`  - ${vendor.name}: zone_id="${vendor.zone_id}" -> zone="${zone?.name || 'Unknown'}"`)
    })

    console.log('\n✅ Check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkVendorZoneIssue() 