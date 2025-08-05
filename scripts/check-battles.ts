import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkBattles() {
  console.log('🔍 Checking existing battles in database...')

  try {
    const { data: battles, error } = await supabase
      .from('battles')
      .select('id, challenger_id, opponent_id, status, start_date, end_date')

    if (error) {
      console.error('❌ Error fetching battles:', error)
      return
    }

    console.log(`📋 Found ${battles.length} battles:`)
    battles.forEach((battle, index) => {
      console.log(`  ${index + 1}. Battle ID: ${battle.id}`)
      console.log(`     Challenger: ${battle.challenger_id}`)
      console.log(`     Opponent: ${battle.opponent_id}`)
      console.log(`     Status: ${battle.status}`)
      console.log(`     Start: ${battle.start_date}`)
      console.log(`     End: ${battle.end_date}`)
      console.log('')
    })

    // Also check vendors
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name')

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }

    console.log(`📋 Found ${vendors.length} vendors:`)
    vendors.forEach((vendor, index) => {
      console.log(`  ${index + 1}. ${vendor.name} (ID: ${vendor.id})`)
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkBattles() 