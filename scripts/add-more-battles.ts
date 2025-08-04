import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addMoreBattles() {
  console.log('⚔️ Adding more battles to Supabase...')

  try {
    // Get existing vendors and users
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, zone_id')

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`📋 Found ${vendors.length} vendors and ${users.length} users`)

    // Create additional battles
    const additionalBattles = [
      {
        challenger_id: vendors[0].id, // Pupusas María
        opponent_id: vendors[1].id,   // Tacos El Rey
        category: 'pupusas',
        zone_id: vendors[0].zone_id,
        status: 'completed',
        start_date: new Date('2024-07-10T14:00:00Z'),
        end_date: new Date('2024-07-10T20:00:00Z'),
        winner_id: vendors[0].id,
        total_votes: 89,
        verified_votes: 67,
        description: 'Batalla de pupusas tradicionales vs tacos modernos',
        territory_impact: false
      },
      {
        challenger_id: vendors[2].id, // Café Aroma
        opponent_id: vendors[3].id,   // Pizza Napoli
        category: 'bebidas',
        zone_id: vendors[2].zone_id,
        status: 'completed',
        start_date: new Date('2024-07-12T09:00:00Z'),
        end_date: new Date('2024-07-12T17:00:00Z'),
        winner_id: vendors[2].id,
        total_votes: 134,
        verified_votes: 112,
        description: 'Café de especialidad vs pizza italiana',
        territory_impact: true
      },
      {
        challenger_id: vendors[4].id, // Sushi Express
        opponent_id: vendors[0].id,   // Pupusas María
        category: 'otros',
        zone_id: vendors[4].zone_id,
        status: 'active',
        start_date: new Date('2024-08-02T16:00:00Z'),
        end_date: new Date('2024-08-02T23:59:59Z'),
        winner_id: null,
        total_votes: 67,
        verified_votes: 45,
        description: 'Sushi fresco vs pupusas tradicionales',
        territory_impact: false
      },
      {
        challenger_id: vendors[1].id, // Tacos El Rey
        opponent_id: vendors[2].id,   // Café Aroma
        category: 'tacos',
        zone_id: vendors[1].zone_id,
        status: 'pending',
        start_date: new Date('2024-08-10T12:00:00Z'),
        end_date: new Date('2024-08-10T23:59:59Z'),
        winner_id: null,
        total_votes: 0,
        verified_votes: 0,
        description: 'Tacos al pastor vs café de especialidad',
        territory_impact: true
      }
    ]

    // Insert battles
    console.log('⚔️ Inserting additional battles...')
    const { data: battlesData, error: battlesError } = await supabase
      .from('battles')
      .insert(additionalBattles)
      .select()

    if (battlesError) {
      console.error('❌ Error inserting battles:', battlesError)
      return
    }
    console.log(`✅ Inserted ${battlesData.length} additional battles`)

    // Add votes for the new battles
    console.log('🗳️ Adding votes for new battles...')
    const votesToInsert: any[] = []
    
    battlesData.forEach((battle, battleIndex) => {
      // Add votes for challenger
      for (let i = 0; i < Math.min(2, users.length); i++) {
        votesToInsert.push({
          voter_fid: users[i].fid,
          battle_id: battle.id,
          vendor_id: battle.challenger_id,
          is_verified: i % 2 === 0,
          token_reward: 15 + (i * 3),
          multiplier: 1.0 + (i * 0.1),
          reason: `Voto adicional ${i + 1} para el challenger en batalla ${battleIndex + 1}`
        })
      }
      
      // Add votes for opponent
      for (let i = 0; i < Math.min(1, users.length - 2); i++) {
        votesToInsert.push({
          voter_fid: users[i + 2].fid,
          battle_id: battle.id,
          vendor_id: battle.opponent_id,
          is_verified: i % 2 === 0,
          token_reward: 12 + (i * 3),
          multiplier: 1.0 + (i * 0.05),
          reason: `Voto adicional ${i + 1} para el opponent en batalla ${battleIndex + 1}`
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
    console.log(`✅ Inserted ${votesData.length} additional votes`)

    console.log('🎉 Additional battles migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addMoreBattles()
}

export { addMoreBattles } 