import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  console.log('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Seeding database with simplified schema...')
  
  try {
    // First, let's check the zones table structure
    console.log('\n🔍 Checking zones table structure...')
    const { data: zoneSample, error: zoneError } = await supabase
      .from('zones')
      .select('*')
      .limit(1)
      .single()
    
    if (zoneError) {
      console.log('   ⚠️ Could not check zones structure: ' + zoneError.message)
    } else if (zoneSample) {
      console.log('   📋 Zones table columns: ' + Object.keys(zoneSample).join(', '))
    }
    
    // Create zones (simplified structure)
    console.log('\n1️⃣ Creating zones...')
    const zones = [
      { id: '1', name: 'Centro', description: 'Centro histórico' },
      { id: '2', name: 'Roma', description: 'Colonia Roma' },
      { id: '3', name: 'Condesa', description: 'Colonia Condesa' }
    ]
    
    for (const zone of zones) {
      const { error } = await supabase
        .from('zones')
        .upsert(zone, { onConflict: 'id' })
      
      if (error) {
        console.log('   ⚠️ Zone ' + zone.name + ': ' + error.message)
      } else {
        console.log('   ✅ Zone ' + zone.name + ' created/updated')
      }
    }
    
    // Create users
    console.log('\n2️⃣ Creating users...')
    const users = [
      {
        fid: 123456,
        username: 'maria_vendor',
        display_name: 'María González',
        avatar_url: { url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face' },
        battle_tokens: 100,
        vote_streak: 5
      },
      {
        fid: 789012,
        username: 'juan_vendor',
        display_name: 'Juan Pérez',
        avatar_url: { url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face' },
        battle_tokens: 75,
        vote_streak: 3
      }
    ]
    
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'fid' })
      
      if (error) {
        console.log('   ⚠️ User ' + user.username + ': ' + error.message)
      } else {
        console.log('   ✅ User ' + user.username + ' created/updated')
      }
    }
    
    // Create vendors
    console.log('\n3️⃣ Creating vendors...')
    const vendors = [
      {
        id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
        name: 'Pupusas María',
        description: 'Las mejores pupusas de la ciudad',
        category: 'pupusas',
        zone_id: '1',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        total_votes: 0,
        verified_votes: 0
      },
      {
        id: '222f3776-b7c4-4ee0-80e1-5ca89e8ea9d1',
        name: 'Tacos El Güero',
        description: 'Tacos auténticos mexicanos',
        category: 'tacos',
        zone_id: '2',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        total_votes: 0,
        verified_votes: 0
      }
    ]
    
    for (const vendor of vendors) {
      const { error } = await supabase
        .from('vendors')
        .upsert(vendor, { onConflict: 'id' })
      
      if (error) {
        console.log('   ⚠️ Vendor ' + vendor.name + ': ' + error.message)
      } else {
        console.log('   ✅ Vendor ' + vendor.name + ' created/updated')
      }
    }
    
    console.log('\n🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

seedDatabase()
