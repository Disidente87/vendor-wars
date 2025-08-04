import { supabase } from '../src/lib/supabase'

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...')

  try {
    // Seed zones
    const zones = [
      {
        id: '49298ccd-5b91-4a41-839d-98c3b2cc504b',
        name: 'Zona Centro',
        description: 'Historic center of CDMX',
        color: '#FF6B6B',
        coordinates: [19.4326, -99.1332],
        heat_level: 85,
        total_votes: 1247,
        active_vendors: 12
      },
      {
        id: '61bace3e-ae39-4bb5-997b-1737122e8849',
        name: 'Zona Norte',
        description: 'Northern neighborhoods',
        color: '#4ECDC4',
        coordinates: [19.4500, -99.1500],
        heat_level: 72,
        total_votes: 892,
        active_vendors: 8
      },
      {
        id: '100b486d-5859-4ab1-9112-2d4bbabcba46',
        name: 'Zona Sur',
        description: 'Southern districts',
        color: '#45B7D1',
        coordinates: [19.4000, -99.1200],
        heat_level: 65,
        total_votes: 634,
        active_vendors: 6
      },
      {
        id: '1ac86da4-0e2f-43fd-9dcb-0ac5a877048d',
        name: 'Zona Este',
        description: 'Eastern areas',
        color: '#96CEB4',
        coordinates: [19.4200, -99.1000],
        heat_level: 58,
        total_votes: 445,
        active_vendors: 5
      },
      {
        id: 'a3914cda-f3c5-4c90-b7d2-d46d141f4bfc',
        name: 'Zona Oeste',
        description: 'Western neighborhoods',
        color: '#FFEAA7',
        coordinates: [19.4200, -99.1600],
        heat_level: 78,
        total_votes: 756,
        active_vendors: 7
      }
    ]

    console.log('📍 Inserting zones...')
    for (const zone of zones) {
      const { error } = await supabase
        .from('zones')
        .upsert(zone, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error inserting zone ${zone.name}:`, error)
      } else {
        console.log(`✅ Zone "${zone.name}" inserted`)
      }
    }

    // Seed vendors
    const vendors = [
      {
        id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
        name: 'Pupusas María',
        description: 'Authentic Salvadoran pupusas made with love and tradition',
        image_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
        category: 'pupusas',
        zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b',
        coordinates: [19.4326, -99.1332],
        owner_fid: 12345,
        is_verified: true,
        total_battles: 45,
        wins: 32,
        losses: 13,
        win_rate: 71.1,
        total_revenue: 12500,
        average_rating: 4.8,
        review_count: 156,
        territory_defenses: 8,
        territory_conquests: 3,
        current_zone_rank: 1,
        total_votes: 456,
        verified_votes: 234
      },
      {
        id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
        name: 'Tacos El Rey',
        description: 'The best tacos in the north, authentic Mexican flavors',
        image_url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
        category: 'tacos',
        zone_id: '61bace3e-ae39-4bb5-997b-1737122e8849',
        coordinates: [19.4500, -99.1500],
        owner_fid: 12346,
        is_verified: true,
        total_battles: 38,
        wins: 28,
        losses: 10,
        win_rate: 73.7,
        total_revenue: 9800,
        average_rating: 4.7,
        review_count: 134,
        territory_defenses: 6,
        territory_conquests: 2,
        current_zone_rank: 1,
        total_votes: 389,
        verified_votes: 198
      },
      {
        id: '525c09b3-dc92-409b-a11d-896bcf4d15b2',
        name: 'Café Aroma',
        description: 'Artisanal coffee and pastries in a cozy atmosphere',
        image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        category: 'bebidas',
        zone_id: '100b486d-5859-4ab1-9112-2d4bbabcba46',
        coordinates: [19.4000, -99.1200],
        owner_fid: 12347,
        is_verified: true,
        total_battles: 29,
        wins: 22,
        losses: 7,
        win_rate: 75.9,
        total_revenue: 7200,
        average_rating: 4.6,
        review_count: 98,
        territory_defenses: 4,
        territory_conquests: 1,
        current_zone_rank: 1,
        total_votes: 267,
        verified_votes: 145
      },
      {
        id: '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1',
        name: 'Pizza Napoli',
        description: 'Authentic Italian pizza with traditional recipes',
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        category: 'otros',
        zone_id: '1ac86da4-0e2f-43fd-9dcb-0ac5a877048d',
        coordinates: [19.4200, -99.1000],
        owner_fid: 12348,
        is_verified: true,
        total_battles: 31,
        wins: 19,
        losses: 12,
        win_rate: 61.3,
        total_revenue: 8900,
        average_rating: 4.5,
        review_count: 112,
        territory_defenses: 3,
        territory_conquests: 1,
        current_zone_rank: 1,
        total_votes: 234,
        verified_votes: 123
      },
      {
        id: 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28',
        name: 'Sushi Express',
        description: 'Fresh sushi and Japanese cuisine made to order',
        image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        category: 'otros',
        zone_id: 'a3914cda-f3c5-4c90-b7d2-d46d141f4bfc',
        coordinates: [19.4200, -99.1600],
        owner_fid: 12349,
        is_verified: true,
        total_battles: 26,
        wins: 18,
        losses: 8,
        win_rate: 69.2,
        total_revenue: 11500,
        average_rating: 4.9,
        review_count: 89,
        territory_defenses: 5,
        territory_conquests: 2,
        current_zone_rank: 1,
        total_votes: 312,
        verified_votes: 167
      }
    ]

    console.log('🏪 Inserting vendors...')
    for (const vendor of vendors) {
      const { error } = await supabase
        .from('vendors')
        .upsert(vendor, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error inserting vendor ${vendor.name}:`, error)
      } else {
        console.log(`✅ Vendor "${vendor.name}" inserted`)
      }
    }

    // Seed users (simplified for demo)
    const users = [
      {
        fid: 12345,
        username: 'pupusas_maria',
        display_name: 'Pupusas María',
        pfp_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face',
        bio: 'Authentic Salvadoran pupusas made with love and tradition',
        battle_tokens: 1250,
        credibility_score: 95,
        verified_purchases: 234,
        credibility_tier: 'gold',
        vote_streak: 15,
        weekly_vote_count: 45,
        weekly_territory_bonus: 120
      },
      {
        fid: 12346,
        username: 'tacos_el_rey',
        display_name: 'Tacos El Rey',
        pfp_url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face',
        bio: 'The best tacos in the north, authentic Mexican flavors',
        battle_tokens: 980,
        credibility_score: 88,
        verified_purchases: 198,
        credibility_tier: 'gold',
        vote_streak: 12,
        weekly_vote_count: 38,
        weekly_territory_bonus: 95
      }
    ]

    console.log('👤 Inserting users...')
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'fid' })
      
      if (error) {
        console.error(`Error inserting user ${user.username}:`, error)
      } else {
        console.log(`✅ User "${user.username}" inserted`)
      }
    }

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// Run the seeding function
seedDatabase() 