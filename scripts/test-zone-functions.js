import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testZoneFunctions() {
  try {
    console.log('🧪 Testing zone statistics automatic updates...\n')
    
    // 1. Check current zone statistics
    console.log('📊 Current zone statistics:')
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name, total_votes, active_vendors, heat_level, updated_at')
      .order('name')
    
    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
      return
    }
    
    zones.forEach(zone => {
      console.log(`  ${zone.name}: ${zone.total_votes} votes, ${zone.active_vendors} vendors, heat: ${zone.heat_level}`)
    })
    
    // 2. Check vendor statistics
    console.log('\n🏪 Current vendor statistics:')
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, zone_id, total_votes')
      .order('name')
    
    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }
    
    vendors.forEach(vendor => {
      const zone = zones.find(z => z.id === vendor.zone_id)
      console.log(`  ${vendor.name} (${zone?.name || 'Unknown Zone'}): ${vendor.total_votes} votes`)
    })
    
    // 3. Check if triggers exist
    console.log('\n🔍 Checking database triggers...')
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, event_object_table')
      .eq('trigger_schema', 'public')
      .like('trigger_name', '%zone%')
    
    if (triggersError) {
      console.log('⚠️ Could not check triggers (may need manual verification)')
    } else if (triggers.length === 0) {
      console.log('❌ No zone-related triggers found! Functions need to be set up.')
    } else {
      console.log('✅ Found zone triggers:')
      triggers.forEach(trigger => {
        console.log(`  ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`)
      })
    }
    
    // 4. Test manual recalculation
    console.log('\n🔄 Testing manual statistics recalculation...')
    try {
      const { error: recalcError } = await supabase.rpc('recalculate_all_zone_stats')
      
      if (recalcError) {
        console.log('⚠️ Manual recalculation function not available (functions not set up)')
        console.log('Error:', recalcError.message)
      } else {
        console.log('✅ Manual recalculation completed')
        
        // Check updated statistics
        const { data: updatedZones, error: updateError } = await supabase
          .from('zones')
          .select('id, name, total_votes, active_vendors, heat_level, updated_at')
          .order('name')
        
        if (!updateError && updatedZones) {
          console.log('\n📊 Updated zone statistics:')
          updatedZones.forEach(zone => {
            console.log(`  ${zone.name}: ${zone.total_votes} votes, ${zone.active_vendors} vendors, heat: ${zone.heat_level}`)
          })
        }
      }
    } catch (error) {
      console.log('⚠️ Manual recalculation not available:', error.message)
    }
    
    // 5. Recommendations
    console.log('\n💡 Recommendations:')
    
    if (triggers && triggers.length > 0) {
      console.log('✅ Zone functions appear to be set up correctly')
      console.log('   - Triggers are active')
      console.log('   - Statistics should update automatically')
      console.log('   - Test by adding a vendor or registering a vote')
    } else {
      console.log('❌ Zone functions need to be set up:')
      console.log('   1. Go to Supabase Dashboard > SQL Editor')
      console.log('   2. Copy content from supabase/functions.sql')
      console.log('   3. Paste and execute the SQL')
      console.log('   4. Run this test script again')
    }
    
    console.log('\n🎯 Test completed!')
    
  } catch (error) {
    console.error('❌ Error testing zone functions:', error)
  }
}

// Run the test
testZoneFunctions()
