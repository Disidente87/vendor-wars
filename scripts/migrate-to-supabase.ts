import { supabase } from '@/lib/supabase'

// Sample data for migration
const sampleUsers = [
  {
    fid: 12345,
    username: 'maria_pupusas',
    display_name: 'María González',
    pfp_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Pupusera de corazón ❤️',
    follower_count: 2340,
    following_count: 156,
    verified_addresses: [],
    battle_tokens: 1250,
    credibility_score: 95,
    verified_purchases: 45,
    credibility_tier: 'gold',
    vote_streak: 7,
    weekly_vote_count: 12,
    weekly_territory_bonus: 150
  },
  {
    fid: 23456,
    username: 'tacos_el_rey',
    display_name: 'Carlos Mendoza',
    pfp_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Rey de los tacos 👑',
    follower_count: 1890,
    following_count: 89,
    verified_addresses: [],
    battle_tokens: 980,
    credibility_score: 88,
    verified_purchases: 32,
    credibility_tier: 'silver',
    vote_streak: 5,
    weekly_vote_count: 8,
    weekly_territory_bonus: 120
  },
  {
    fid: 34567,
    username: 'cafe_aroma',
    display_name: 'Ana Rodríguez',
    pfp_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Barista y amante del café ☕',
    follower_count: 1560,
    following_count: 234,
    verified_addresses: [],
    battle_tokens: 820,
    credibility_score: 82,
    verified_purchases: 28,
    credibility_tier: 'bronze',
    vote_streak: 3,
    weekly_vote_count: 6,
    weekly_territory_bonus: 80
  },
  {
    fid: 45678,
    username: 'pizza_napoli',
    display_name: 'Marco Rossi',
    pfp_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'Pizzaiolo italiano 🇮🇹',
    follower_count: 2100,
    following_count: 178,
    verified_addresses: [],
    battle_tokens: 1120,
    credibility_score: 85,
    verified_purchases: 38,
    credibility_tier: 'silver',
    vote_streak: 4,
    weekly_vote_count: 7,
    weekly_territory_bonus: 90
  },
  {
    fid: 56789,
    username: 'sushi_express',
    display_name: 'Yuki Tanaka',
    pfp_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Sushi master 🍣',
    follower_count: 1780,
    following_count: 145,
    verified_addresses: [],
    battle_tokens: 890,
    credibility_score: 78,
    verified_purchases: 25,
    credibility_tier: 'bronze',
    vote_streak: 2,
    weekly_vote_count: 5,
    weekly_territory_bonus: 60
  }
]

const sampleZones = [
  {
    id: 'centro',
    name: 'Centro',
    description: 'El corazón de la ciudad, donde todo sucede',
    color: '#FF6B35',
    coordinates: [19.4326, -99.1332],
    current_owner_id: null,
    heat_level: 85,
    total_votes: 12500,
    active_vendors: 12
  },
  {
    id: 'norte',
    name: 'Norte',
    description: 'Zona residencial con los mejores tacos',
    color: '#4ECDC4',
    coordinates: [19.4426, -99.1432],
    current_owner_id: null,
    heat_level: 72,
    total_votes: 8900,
    active_vendors: 8
  },
  {
    id: 'sur',
    name: 'Sur',
    description: 'Área comercial con cafés de especialidad',
    color: '#45B7D1',
    coordinates: [19.4226, -99.1232],
    current_owner_id: null,
    heat_level: 65,
    total_votes: 7600,
    active_vendors: 6
  },
  {
    id: 'este',
    name: 'Este',
    description: 'Zona industrial con pizza auténtica',
    color: '#96CEB4',
    coordinates: [19.4326, -99.1132],
    current_owner_id: null,
    heat_level: 58,
    total_votes: 6800,
    active_vendors: 5
  },
  {
    id: 'oeste',
    name: 'Oeste',
    description: 'Área moderna con sushi fresco',
    color: '#FFEAA7',
    coordinates: [19.4326, -99.1532],
    current_owner_id: null,
    heat_level: 45,
    total_votes: 5200,
    active_vendors: 4
  }
]

const sampleVendors = [
  {
    id: '1',
    name: 'Pupusas María',
    description: 'Las mejores pupusas de la ciudad. Receta familiar de 3 generaciones. Especialidad en pupusas de queso con loroco y revueltas.',
    image_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
    category: 'pupusas',
    zone: 'centro',
    coordinates: [19.4326, -99.1332],
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
    id: '2',
    name: 'Tacos El Rey',
    description: 'Tacos al pastor y de suadero que te harán llorar de felicidad. Salsas caseras y tortillas hechas a mano.',
    image_url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
    category: 'tacos',
    zone: 'norte',
    coordinates: [19.4426, -99.1432],
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
    id: '3',
    name: 'Café Aroma',
    description: 'Café de especialidad tostado artesanalmente. Granos de Chiapas y Oaxaca. Ambiente perfecto para trabajar.',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    category: 'bebidas',
    zone: 'sur',
    coordinates: [19.4226, -99.1232],
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
    id: '4',
    name: 'Pizza Napoli',
    description: 'Pizza auténtica napolitana con masa fermentada por 72 horas. Horno de leña y ingredientes importados de Italia.',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    category: 'otros',
    zone: 'este',
    coordinates: [19.4326, -99.1132],
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
    id: '5',
    name: 'Sushi Express',
    description: 'Sushi fresco preparado al momento. Pescado de la mejor calidad y arroz perfectamente sazonado.',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    category: 'otros',
    zone: 'oeste',
    coordinates: [19.4326, -99.1532],
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

async function migrateData() {
  console.log('🚀 Starting data migration to Supabase...')

  try {
    // 1. Insert users
    console.log('📝 Inserting users...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select()

    if (usersError) {
      console.error('❌ Error inserting users:', usersError)
      return
    }
    console.log(`✅ Inserted ${usersData.length} users`)

    // 2. Insert zones
    console.log('🗺️ Inserting zones...')
    const { data: zonesData, error: zonesError } = await supabase
      .from('zones')
      .insert(sampleZones)
      .select()

    if (zonesError) {
      console.error('❌ Error inserting zones:', zonesError)
      return
    }
    console.log(`✅ Inserted ${zonesData.length} zones`)

    // 3. Insert vendors
    console.log('🏪 Inserting vendors...')
    const { data: vendorsData, error: vendorsError } = await supabase
      .from('vendors')
      .insert(sampleVendors)
      .select()

    if (vendorsError) {
      console.error('❌ Error inserting vendors:', vendorsError)
      return
    }
    console.log(`✅ Inserted ${vendorsData.length} vendors`)

    console.log('🎉 Data migration completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Users: ${usersData.length}`)
    console.log(`   - Zones: ${zonesData.length}`)
    console.log(`   - Vendors: ${vendorsData.length}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData()
}

export { migrateData } 