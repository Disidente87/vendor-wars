import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateVendorsZones() {
  console.log('🔄 Updating vendors with correct zone IDs...')

  try {
    // Get all zones
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name')
      .order('name')

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
      return
    }

    console.log('📋 Found zones:', zones.map(z => `${z.name}: ${z.id}`))

    // Update each vendor with the correct zone ID
    const zoneMap = {
      'Centro': zones.find(z => z.name === 'Centro')?.id,
      'Norte': zones.find(z => z.name === 'Norte')?.id,
      'Sur': zones.find(z => z.name === 'Sur')?.id,
      'Este': zones.find(z => z.name === 'Este')?.id,
      'Oeste': zones.find(z => z.name === 'Oeste')?.id,
    }

    // Update vendors based on their coordinates
    const vendorUpdates = [
      { name: 'Pupusas María', zoneId: zoneMap['Centro'] },
      { name: 'Tacos El Rey', zoneId: zoneMap['Norte'] },
      { name: 'Café Aroma', zoneId: zoneMap['Sur'] },
      { name: 'Pizza Napoli', zoneId: zoneMap['Este'] },
      { name: 'Sushi Express', zoneId: zoneMap['Oeste'] },
    ]

    for (const update of vendorUpdates) {
      if (update.zoneId) {
        const { error: updateError } = await supabase
          .from('vendors')
          .update({ zone_id: update.zoneId })
          .eq('name', update.name)

        if (updateError) {
          console.error(`❌ Error updating ${update.name}:`, updateError)
        } else {
          console.log(`✅ Updated ${update.name} with zone ID: ${update.zoneId}`)
        }
      } else {
        console.error(`❌ Could not find zone for ${update.name}`)
      }
    }

    console.log('🎉 Vendor zone updates completed!')

  } catch (error) {
    console.error('❌ Update failed:', error)
  }
}

// Run update if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateVendorsZones()
}

export { updateVendorsZones } 