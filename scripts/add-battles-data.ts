import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addBattlesData() {
  console.log('🚀 Starting battles data migration to Supabase...')

  try {
    // 1. Get existing vendors, zones, and users for reference
    console.log('📋 Fetching existing data...')
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, zone_id')

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }

    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name')

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
      return
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`📋 Found ${vendors.length} vendors, ${zones.length} zones, and ${users.length} users`)

    // 2. Create vendor and zone mappings
    const vendorMap = {
      'Pupusas María': vendors.find(v => v.name === 'Pupusas María')?.id,
      'Tacos El Rey': vendors.find(v => v.name === 'Tacos El Rey')?.id,
      'Café Aroma': vendors.find(v => v.name === 'Café Aroma')?.id,
      'Pizza Napoli': vendors.find(v => v.name === 'Pizza Napoli')?.id,
      'Sushi Express': vendors.find(v => v.name === 'Sushi Express')?.id,
    }

    // Get existing user FIDs
    const existingFids = users.map(u => u.fid)

    // 3. Insert battles
    console.log('⚔️ Inserting battles...')
    const battlesToInsert = [
      {
        challenger_id: vendorMap['Pupusas María'],
        opponent_id: vendorMap['Tacos El Rey'],
        category: 'pupusas',
        zone_id: vendorMap['Pupusas María'] ? vendors.find(v => v.id === vendorMap['Pupusas María'])?.zone_id : null,
        status: 'completed',
        start_date: new Date('2024-07-15T10:00:00Z'),
        end_date: new Date('2024-07-15T22:00:00Z'),
        winner_id: vendorMap['Pupusas María'],
        total_votes: 156,
        verified_votes: 134,
        description: 'Batalla épica entre las mejores pupusas de la ciudad. Pupusas María vs Tacos El Rey en una competencia de sabor y tradición.',
        territory_impact: true
      },
      {
        challenger_id: vendorMap['Tacos El Rey'],
        opponent_id: vendorMap['Café Aroma'],
        category: 'tacos',
        zone_id: vendorMap['Tacos El Rey'] ? vendors.find(v => v.id === vendorMap['Tacos El Rey'])?.zone_id : null,
        status: 'active',
        start_date: new Date('2024-08-01T12:00:00Z'),
        end_date: new Date('2024-08-01T23:59:59Z'),
        winner_id: null,
        total_votes: 89,
        verified_votes: 67,
        description: 'Tacos al pastor vs tacos de suadero. ¿Cuál es el rey de los tacos?',
        territory_impact: false
      },
      {
        challenger_id: vendorMap['Café Aroma'],
        opponent_id: vendorMap['Pizza Napoli'],
        category: 'bebidas',
        zone_id: vendorMap['Café Aroma'] ? vendors.find(v => v.id === vendorMap['Café Aroma'])?.zone_id : null,
        status: 'completed',
        start_date: new Date('2024-07-20T08:00:00Z'),
        end_date: new Date('2024-07-20T20:00:00Z'),
        winner_id: vendorMap['Café Aroma'],
        total_votes: 203,
        verified_votes: 178,
        description: 'Café de especialidad vs aguas frescas. ¿Qué prefieres para refrescarte?',
        territory_impact: true
      },
      {
        challenger_id: vendorMap['Pizza Napoli'],
        opponent_id: vendorMap['Sushi Express'],
        category: 'otros',
        zone_id: vendorMap['Pizza Napoli'] ? vendors.find(v => v.id === vendorMap['Pizza Napoli'])?.zone_id : null,
        status: 'pending',
        start_date: new Date('2024-08-05T14:00:00Z'),
        end_date: new Date('2024-08-05T23:59:59Z'),
        winner_id: null,
        total_votes: 0,
        verified_votes: 0,
        description: 'Pizza napolitana vs sushi fresco. Batalla internacional de sabores.',
        territory_impact: false
      }
    ]

    const { data: battlesData, error: battlesError } = await supabase
      .from('battles')
      .insert(battlesToInsert)
      .select()

    if (battlesError) {
      console.error('❌ Error inserting battles:', battlesError)
      return
    }
    console.log(`✅ Inserted ${battlesData.length} battles`)

    // 4. Insert votes for battles using only existing FIDs
    console.log('🗳️ Inserting votes...')
    const votesToInsert: any[] = []
    
    battlesData.forEach((battle, battleIndex) => {
      // Add votes for challenger using existing FIDs
      for (let i = 0; i < Math.min(3, existingFids.length); i++) {
        votesToInsert.push({
          voter_fid: existingFids[i],
          battle_id: battle.id,
          vendor_id: battle.challenger_id,
          is_verified: i % 2 === 0,
          token_reward: 20 + (i * 5),
          multiplier: 1.0 + (i * 0.2),
          reason: `Voto ${i + 1} para el challenger en batalla ${battleIndex + 1}`
        })
      }
      
      // Add votes for opponent using existing FIDs (different ones)
      for (let i = 0; i < Math.min(2, existingFids.length - 3); i++) {
        votesToInsert.push({
          voter_fid: existingFids[i + 3],
          battle_id: battle.id,
          vendor_id: battle.opponent_id,
          is_verified: i % 2 === 0,
          token_reward: 15 + (i * 5),
          multiplier: 1.0 + (i * 0.1),
          reason: `Voto ${i + 1} para el opponent en batalla ${battleIndex + 1}`
        })
      }
    })

    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .insert(votesToInsert)
      .select()

    if (votesError) {
      console.error('❌ Error inserting votes:', votesError)
      return
    }
    console.log(`✅ Inserted ${votesData.length} votes`)

    // 5. Insert attestations using existing FIDs
    console.log('📸 Inserting attestations...')
    const attestationsToInsert = [
      {
        user_fid: existingFids[0] || 12345,
        vendor_id: vendorMap['Pupusas María'],
        photo_hash: 'abc123def456ghi789',
        photo_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
        gps_location: '(19.4326,-99.1332)',
        verification_confidence: 0.95,
        status: 'approved',
        processing_time: 1200,
        metadata: {
          device: 'iPhone 15',
          timestamp: '2024-07-15T14:30:00Z',
          location_accuracy: 'high'
        }
      },
      {
        user_fid: existingFids[1] || 23456,
        vendor_id: vendorMap['Tacos El Rey'],
        photo_hash: 'def456ghi789jkl012',
        photo_url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
        gps_location: '(19.4426,-99.1432)',
        verification_confidence: 0.92,
        status: 'approved',
        processing_time: 980,
        metadata: {
          device: 'Samsung Galaxy S24',
          timestamp: '2024-07-15T15:45:00Z',
          location_accuracy: 'medium'
        }
      },
      {
        user_fid: existingFids[2] || 34567,
        vendor_id: vendorMap['Café Aroma'],
        photo_hash: 'ghi789jkl012mno345',
        photo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        gps_location: '(19.4226,-99.1232)',
        verification_confidence: 0.88,
        status: 'approved',
        processing_time: 1100,
        metadata: {
          device: 'Google Pixel 8',
          timestamp: '2024-07-20T09:15:00Z',
          location_accuracy: 'high'
        }
      }
    ]

    const { data: attestationsData, error: attestationsError } = await supabase
      .from('attestations')
      .insert(attestationsToInsert)
      .select()

    if (attestationsError) {
      console.error('❌ Error inserting attestations:', attestationsError)
      return
    }
    console.log(`✅ Inserted ${attestationsData.length} attestations`)

    // 6. Insert verification proofs
    console.log('🔍 Inserting verification proofs...')
    const proofsToInsert = [
      {
        vendor_id: vendorMap['Pupusas María'],
        type: 'business_license',
        url: 'https://example.com/licenses/pupusas-maria-license.pdf',
        description: 'Licencia comercial válida para venta de alimentos en la Ciudad de México',
        verified_by: 'Sistema de Verificación Automática'
      },
      {
        vendor_id: vendorMap['Tacos El Rey'],
        type: 'location_photo',
        url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=800&h=600&fit=crop',
        description: 'Foto verificada del establecimiento físico de Tacos El Rey',
        verified_by: 'Equipo de Verificación Manual'
      },
      {
        vendor_id: vendorMap['Café Aroma'],
        type: 'social_media',
        url: 'https://instagram.com/cafe_aroma_official',
        description: 'Cuenta de Instagram verificada con más de 3,000 seguidores',
        verified_by: 'Sistema de Verificación de Redes Sociales'
      },
      {
        vendor_id: vendorMap['Pizza Napoli'],
        type: 'receipt',
        url: 'https://example.com/receipts/pizza-napoli-receipt.jpg',
        description: 'Recibo de compra verificado con fecha y hora válida',
        verified_by: 'Sistema de Verificación de Transacciones'
      },
      {
        vendor_id: vendorMap['Sushi Express'],
        type: 'community_vouch',
        url: 'https://example.com/vouches/sushi-express-community.pdf',
        description: 'Aval comunitario de 30+ clientes verificados',
        verified_by: 'Sistema de Verificación Comunitaria'
      }
    ]

    const { data: proofsData, error: proofsError } = await supabase
      .from('verification_proofs')
      .insert(proofsToInsert)
      .select()

    if (proofsError) {
      console.error('❌ Error inserting verification proofs:', proofsError)
      return
    }
    console.log(`✅ Inserted ${proofsData.length} verification proofs`)

    console.log('🎉 Battles data migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addBattlesData()
}

export { addBattlesData } 