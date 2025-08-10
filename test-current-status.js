// Test current database status
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseKey = 'sb_publishable_KcPHxYNbMQeqmJVlPJm2sw_o_AvyXc4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCurrentStatus() {
  console.log('🔍 Testing current database status...')
  
  try {
    // Test 1: Check if function exists and works
    console.log('\n🧪 Testing get_zone_by_delegation function...')
    const { data: zoneResult, error: zoneError } = await supabase
      .rpc('get_zone_by_delegation', { input_delegation_name: 'Coyoacán' })
    
    if (zoneError) {
      console.error('❌ Function still has error:', zoneError)
      console.log('\n💡 The function needs to be fixed in Supabase!')
      console.log('📋 Run the fix-database.sql script in your Supabase SQL Editor')
    } else {
      console.log('✅ Function works! Zone result for Coyoacán:', zoneResult)
    }
    
    // Test 2: Check delegations manually
    console.log('\n📋 Checking delegations manually...')
    const { data: delegations, error: delegationsError } = await supabase
      .from('zone_delegations')
      .select('delegation_name, zone_id')
      .eq('delegation_name', 'Coyoacán')
    
    if (delegationsError) {
      console.error('❌ Error fetching delegations:', delegationsError)
    } else {
      console.log('✅ Coyoacán delegation found:', delegations)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testCurrentStatus()
