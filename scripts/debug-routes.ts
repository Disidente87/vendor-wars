import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugRoutes() {
  console.log('🔍 Debugging routes and data structure...\n')

  try {
    // 1. Check zones with their IDs
    console.log('🗺️ Zones with IDs:')
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name, description')
      .order('name')

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
      return
    }

    zones.forEach(zone => {
      console.log(`   - ${zone.name}: ${zone.id}`)
    })

    // 2. Check vendors with their zone_id
    console.log('\n🏪 Vendors with zone_id:')
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, zone_id')
      .order('name')

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }

    vendors.forEach(vendor => {
      console.log(`   - ${vendor.name}: ${vendor.id} (zone_id: ${vendor.zone_id})`)
    })

    // 3. Test zone lookup by name
    console.log('\n🔍 Testing zone lookup by name "Sur":')
    const { data: surZone, error: surError } = await supabase
      .from('zones')
      .select('id, name')
      .eq('name', 'Sur')
      .single()

    if (surError) {
      console.error('❌ Error finding Sur zone:', surError)
    } else {
      console.log(`   ✅ Found Sur zone: ${surZone.id}`)
    }

    // 4. Test vendor lookup by ID
    console.log('\n🔍 Testing vendor lookup by ID "4":')
    const { data: vendor4, error: vendor4Error } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('id', '4')
      .single()

    if (vendor4Error) {
      console.error('❌ Error finding vendor 4:', vendor4Error)
    } else {
      console.log(`   ✅ Found vendor: ${vendor4.name} (${vendor4.id})`)
    }

    // 5. Test vendors by zone_id
    console.log('\n🔍 Testing vendors by zone_id:')
    if (surZone) {
      const { data: zoneVendors, error: zoneVendorsError } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('zone_id', surZone.id)

      if (zoneVendorsError) {
        console.error('❌ Error finding vendors in Sur zone:', zoneVendorsError)
      } else {
        console.log(`   ✅ Found ${zoneVendors.length} vendors in Sur zone:`)
        zoneVendors.forEach(vendor => {
          console.log(`      - ${vendor.name} (${vendor.id})`)
        })
      }
    }

    console.log('\n🎉 Debug completed!')

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run debug if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  debugRoutes()
}

export { debugRoutes } 