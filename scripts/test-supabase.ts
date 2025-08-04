import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/lib/supabase'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('📡 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing')
  console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n1. Testing basic connection...')
    const { data: zones, error } = await supabase
      .from('zones')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error)
      return
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log(`📊 Found ${zones?.length || 0} zones in database`)
    
    if (zones && zones.length > 0) {
      console.log('\n📍 Zones found:')
      zones.forEach(zone => {
        console.log(`  - ${zone.name} (${zone.id})`)
      })
    }
    
    // Test 2: Try to fetch a specific zone
    console.log('\n2. Testing specific zone fetch...')
    const { data: centroZone, error: centroError } = await supabase
      .from('zones')
      .select('*')
      .eq('name', 'Centro')
      .single()
    
    if (centroError) {
      console.error('❌ Error fetching Centro zone:', centroError)
    } else {
      console.log('✅ Successfully fetched Centro zone:', centroZone?.name)
    }
    
    // Test 3: Check if vendors table exists
    console.log('\n3. Testing vendors table...')
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .limit(3)
    
    if (vendorsError) {
      console.log('⚠️  Vendors table not found or empty:', vendorsError.message)
      console.log('💡 You may need to run: npm run seed:vendors')
    } else {
      console.log(`✅ Found ${vendors?.length || 0} vendors in database`)
      if (vendors && vendors.length > 0) {
        console.log('🏪 Vendors found:')
        vendors.forEach(vendor => {
          console.log(`  - ${vendor.name} (${vendor.category})`)
        })
      }
    }
    
    console.log('\n🎉 Supabase connection test completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testSupabaseConnection() 