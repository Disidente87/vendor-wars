import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample vendors data with proper zone assignments
const sampleVendors = [
  {
    name: 'Pupusas María',
    description: 'Las mejores pupusas de la ciudad. Receta familiar de 3 generaciones. Especialidad en pupusas de queso con loroco y revueltas.',
    image_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
    category: 'pupusas',
    coordinates: '(19.4326,-99.1332)',
    owner_fid: 12345,
    is_verified: true,
    total_battles: 45,
    wins: 38,
    losses: 7,
    win_rate: 84.4,
    total_revenue: 12500,
    average_rating: 4.8,
    review_count: 156,
    territory_defenses: 12,
    territory_conquests: 8,
    current_zone_rank: 1,
    total_votes: 2340,
    verified_votes: 1890
  },
  {
    name: 'Tacos El Rey',
    description: 'Tacos al pastor y de suadero que te harán llorar de felicidad. Salsas caseras y tortillas hechas a mano.',
    image_url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
    category: 'tacos',
    coordinates: '(19.4426,-99.1432)',
    owner_fid: 23456,
    is_verified: true,
    total_battles: 32,
    wins: 28,
    losses: 4,
    win_rate: 87.5,
    total_revenue: 9800,
    average_rating: 4.9,
    review_count: 98,
    territory_defenses: 8,
    territory_conquests: 6,
    current_zone_rank: 2,
    total_votes: 1890,
    verified_votes: 1450
  },
  {
    name: 'Café Aroma',
    description: 'Café de especialidad tostado artesanalmente. Granos de Chiapas y Oaxaca. Ambiente perfecto para trabajar.',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    category: 'bebidas',
    coordinates: '(19.4226,-99.1232)',
    owner_fid: 34567,
    is_verified: true,
    total_battles: 28,
    wins: 22,
    losses: 6,
    win_rate: 78.6,
    total_revenue: 8200,
    average_rating: 4.7,
    review_count: 134,
    territory_defenses: 6,
    territory_conquests: 4,
    current_zone_rank: 3,
    total_votes: 1560,
    verified_votes: 1200
  },
  {
    name: 'Pizza Napoli',
    description: 'Pizza auténtica napolitana con masa fermentada por 72 horas. Horno de leña y ingredientes importados de Italia.',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    category: 'otros',
    coordinates: '(19.4326,-99.1132)',
    owner_fid: 45678,
    is_verified: true,
    total_battles: 38,
    wins: 31,
    losses: 7,
    win_rate: 81.6,
    total_revenue: 11200,
    average_rating: 4.8,
    review_count: 167,
    territory_defenses: 10,
    territory_conquests: 7,
    current_zone_rank: 4,
    total_votes: 2100,
    verified_votes: 1680
  },
  {
    name: 'Sushi Express',
    description: 'Sushi fresco preparado al momento. Pescado de la mejor calidad y arroz perfectamente sazonado.',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    category: 'otros',
    coordinates: '(19.4326,-99.1532)',
    owner_fid: 56789,
    is_verified: true,
    total_battles: 25,
    wins: 20,
    losses: 5,
    win_rate: 80.0,
    total_revenue: 8900,
    average_rating: 4.6,
    review_count: 89,
    territory_defenses: 5,
    territory_conquests: 3,
    current_zone_rank: 5,
    total_votes: 1780,
    verified_votes: 1420
  }
]

async function fixVendorsMigration() {
  console.log('🔧 Fixing vendors migration...')

  try {
    // 1. Get existing zones
    console.log('📋 Fetching zones...')
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name')
      .order('name')

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
      return
    }

    console.log('📋 Found zones:', zones.map(z => `${z.name}: ${z.id}`))

    // 2. Create zone mapping
    const zoneMap: Record<string, string | undefined> = {
      'Centro': zones.find(z => z.name === 'Centro')?.id,
      'Norte': zones.find(z => z.name === 'Norte')?.id,
      'Sur': zones.find(z => z.name === 'Sur')?.id,
      'Este': zones.find(z => z.name === 'Este')?.id,
      'Oeste': zones.find(z => z.name === 'Oeste')?.id,
    }

    // 3. Check if vendors already exist
    console.log('🏪 Checking existing vendors...')
    const { data: existingVendors, error: checkError } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking vendors:', checkError)
      return
    }

    if (existingVendors && existingVendors.length > 0) {
      console.log('✅ Vendors already exist, updating zone assignments...')
      
      // Update existing vendors with zone IDs
      const vendorZoneUpdates = [
        { name: 'Pupusas María', zoneId: zoneMap['Centro'] },
        { name: 'Tacos El Rey', zoneId: zoneMap['Norte'] },
        { name: 'Café Aroma', zoneId: zoneMap['Sur'] },
        { name: 'Pizza Napoli', zoneId: zoneMap['Este'] },
        { name: 'Sushi Express', zoneId: zoneMap['Oeste'] },
      ]

      for (const update of vendorZoneUpdates) {
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
    } else {
      console.log('🏪 No vendors found, inserting new vendors...')
      
      // Insert vendors with proper zone IDs
      const vendorsToInsert = sampleVendors.map((vendor, index) => {
        const zoneNames = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste']
        const zoneName = zoneNames[index % zoneNames.length]
        
        return {
          ...vendor,
          zone_id: zoneMap[zoneName]
        }
      })

      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .insert(vendorsToInsert)
        .select()

      if (vendorsError) {
        console.error('❌ Error inserting vendors:', vendorsError)
        return
      }
      console.log(`✅ Inserted ${vendorsData.length} vendors`)
    }

    console.log('🎉 Vendors migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixVendorsMigration()
}

export { fixVendorsMigration } 