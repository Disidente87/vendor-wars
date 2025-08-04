import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Additional users data
const additionalUsers = [
  {
    fid: 67890,
    username: 'tamales_doña_lupe',
    display_name: 'Doña Lupe Martínez',
    pfp_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Tamales tradicionales desde 1985 🌽',
    follower_count: 3200,
    following_count: 89,
    verified_addresses: [],
    battle_tokens: 2100,
    credibility_score: 92,
    verified_purchases: 67,
    credibility_tier: 'gold',
    vote_streak: 12,
    weekly_vote_count: 15,
    weekly_territory_bonus: 200
  },
  {
    fid: 78901,
    username: 'quesadillas_el_rincon',
    display_name: 'Roberto Sánchez',
    pfp_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'Quesadillas gourmet con ingredientes frescos 🧀',
    follower_count: 1850,
    following_count: 145,
    verified_addresses: [],
    battle_tokens: 1450,
    credibility_score: 85,
    verified_purchases: 42,
    credibility_tier: 'silver',
    vote_streak: 8,
    weekly_vote_count: 11,
    weekly_territory_bonus: 140
  },
  {
    fid: 89012,
    username: 'tortas_la_esquina',
    display_name: 'Carmen Vega',
    pfp_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Las mejores tortas de la esquina 🥪',
    follower_count: 2100,
    following_count: 178,
    verified_addresses: [],
    battle_tokens: 1680,
    credibility_score: 88,
    verified_purchases: 55,
    credibility_tier: 'silver',
    vote_streak: 6,
    weekly_vote_count: 9,
    weekly_territory_bonus: 120
  },
  {
    fid: 90123,
    username: 'postres_mama_rosa',
    display_name: 'Rosa González',
    pfp_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Postres caseros con amor de mamá 🍰',
    follower_count: 2800,
    following_count: 234,
    verified_addresses: [],
    battle_tokens: 1950,
    credibility_score: 90,
    verified_purchases: 78,
    credibility_tier: 'gold',
    vote_streak: 10,
    weekly_vote_count: 14,
    weekly_territory_bonus: 180
  },
  {
    fid: 1234,
    username: 'agua_fresca_el_parque',
    display_name: 'Miguel Ángel',
    pfp_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Aguas frescas naturales del parque 🌺',
    follower_count: 1650,
    following_count: 112,
    verified_addresses: [],
    battle_tokens: 1200,
    credibility_score: 82,
    verified_purchases: 38,
    credibility_tier: 'bronze',
    vote_streak: 4,
    weekly_vote_count: 7,
    weekly_territory_bonus: 90
  }
]

async function addMoreUsers() {
  console.log('👥 Adding more users to Supabase...')

  try {
    // Check if users already exist
    console.log('📋 Checking existing users...')
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('fid')
      .in('fid', additionalUsers.map(u => u.fid))

    if (checkError) {
      console.error('❌ Error checking users:', checkError)
      return
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log(`✅ ${existingUsers.length} users already exist, skipping...`)
      return
    }

    // Insert new users
    console.log('👥 Inserting new users...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .insert(additionalUsers)
      .select()

    if (usersError) {
      console.error('❌ Error inserting users:', usersError)
      return
    }

    console.log(`✅ Inserted ${usersData.length} new users`)
    console.log('🎉 Users migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addMoreUsers()
}

export { addMoreUsers } 