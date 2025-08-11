import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDefaultBattle() {
  try {
    console.log('🔍 Checking if default battle already exists...')
    
    // Check if default battle exists
    const { data: existingBattle, error: checkError } = await supabase
      .from('battles')
      .select('id, status')
      .eq('id', 'default-battle-0000-0000-0000-000000000000')
      .single()
    
    if (existingBattle) {
      console.log('✅ Default battle already exists:', existingBattle.id)
      console.log('   Status:', existingBattle.status)
      return existingBattle.id
    }
    
    console.log('📋 Creating default battle...')
    
    // Get first two vendors to use as challenger and opponent
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, category, zone_id')
      .limit(2)
    
    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      throw vendorsError
    }
    
    if (!vendors || vendors.length < 2) {
      console.error('❌ Need at least 2 vendors to create a battle')
      throw new Error('Insufficient vendors')
    }
    
    // Get a zone for the battle
    const { data: zone, error: zoneError } = await supabase
      .from('zones')
      .select('id, name')
      .limit(1)
      .single()
    
    if (zoneError) {
      console.error('❌ Error fetching zone:', zoneError)
      throw zoneError
    }
    
    // Create default battle
    const defaultBattle = {
      id: 'default-battle-0000-0000-0000-000000000000',
      challenger_id: vendors[0].id,
      opponent_id: vendors[1].id,
      category: vendors[0].category,
      zone_id: zone.id,
      status: 'active',
      start_date: new Date().toISOString(),
      description: 'Default battle for votes without specific battles',
      territory_impact: false
    }
    
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert(defaultBattle)
      .select()
      .single()
    
    if (battleError) {
      console.error('❌ Error creating default battle:', battleError)
      throw battleError
    }
    
    console.log('✅ Default battle created successfully:')
    console.log('   ID:', battle.id)
    console.log('   Challenger:', vendors[0].name)
    console.log('   Opponent:', vendors[1].name)
    console.log('   Zone:', zone.name)
    console.log('   Status:', battle.status)
    
    return battle.id
    
  } catch (error) {
    console.error('❌ Failed to create default battle:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting default battle creation...')
    
    const battleId = await createDefaultBattle()
    
    console.log('\n🎯 Next steps:')
    console.log('1. Update VotingService to use this battle ID')
    console.log('2. Test voting functionality')
    console.log('\n✅ Default battle setup complete!')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

main()
