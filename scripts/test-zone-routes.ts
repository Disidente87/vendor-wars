import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/lib/supabase'
import { ZONE_ROUTES } from '../src/lib/route-utils'

async function testZoneRoutes() {
  console.log('🧪 Testing zone routes...')
  
  try {
    // Test 1: Get all zones from Supabase
    console.log('1. Fetching all zones from Supabase...')
    const { data: zones, error } = await supabase
      .from('zones')
      .select('*')
    
    if (error) {
      console.error('❌ Error fetching zones:', error)
      return
    }
    
    console.log(`✅ Found ${zones?.length || 0} zones in database`)
    
    if (zones && zones.length > 0) {
      console.log('\n📍 Zones found:')
      zones.forEach(zone => {
        console.log(`  - ${zone.name} (ID: ${zone.id})`)
        console.log(`    Route: /zones/${zone.id}`)
        console.log(`    Slug: ${zone.name.toLowerCase().replace(/\s+/g, '-')}`)
        console.log(`    Description: ${zone.description}`)
        console.log(`    Heat Level: ${zone.heat_level}`)
        console.log(`    Total Votes: ${zone.total_votes}`)
      })
      
      // Test 2: Test each zone route
      console.log('\n2. Testing zone routes...')
      for (const zone of zones) {
        console.log(`\n🔍 Testing zone: ${zone.name}`)
        
        // Test the API endpoint
        const response = await fetch(`http://localhost:3000/api/zones/${zone.id}`)
        const result = await response.json()
        
        if (result.success) {
          console.log(`  ✅ API route works: /api/zones/${zone.id}`)
          console.log(`  📊 Zone data: ${result.data.name} - ${result.data.description}`)
        } else {
          console.log(`  ❌ API route failed: /api/zones/${zone.id}`)
          console.log(`  📝 Error: ${result.error}`)
        }
      }
      
      // Test 3: Test known zone routes
      console.log('\n3. Testing known zone routes...')
      for (const [slug, id] of Object.entries(ZONE_ROUTES)) {
        console.log(`\n🔍 Testing known route: ${slug} -> ${id}`)
        
        const response = await fetch(`http://localhost:3000/api/zones/${id}`)
        const result = await response.json()
        
        if (result.success) {
          console.log(`  ✅ Known route works: /zones/${slug} -> /zones/${id}`)
        } else {
          console.log(`  ❌ Known route failed: /zones/${slug} -> /zones/${id}`)
        }
      }
      
      // Test 4: Test zone by name
      console.log('\n4. Testing zone by name...')
      for (const zone of zones) {
        const zoneName = zone.name.toLowerCase().replace(/\s+/g, '-')
        console.log(`\n🔍 Testing zone by name: ${zoneName}`)
        
        const response = await fetch(`http://localhost:3000/api/zones/${zoneName}`)
        const result = await response.json()
        
        if (result.success) {
          console.log(`  ✅ Zone by name works: /zones/${zoneName}`)
        } else {
          console.log(`  ❌ Zone by name failed: /zones/${zoneName}`)
        }
      }
    }
    
    console.log('\n🎉 Zone routes test completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testZoneRoutes() 