import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkVendors() {
  console.log('🏪 Checking Vendors in Database')
  console.log('==============================')

  try {
    // Get all vendors
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id, name, category, zone_id')
      .order('name')

    if (error) {
      console.error('❌ Error fetching vendors:', error)
      return
    }

    console.log(`\n✅ Found ${vendors.length} vendors in database:`)
    console.log('')

    vendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.name}`)
      console.log(`   ID: ${vendor.id}`)
      console.log(`   Category: ${vendor.category}`)
      console.log(`   Zone: ${vendor.zone_id}`)
      console.log('')
    })

    // Show sample vote data
    console.log('🗳️ Sample Vote Data:')
    console.log('====================')
    
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('voter_fid, vendor_id, vote_date, token_reward')
      .limit(5)
      .order('created_at', { ascending: false })

    if (votesError) {
      console.error('❌ Error fetching votes:', votesError)
    } else {
      console.log(`\n📊 Found ${votes.length} recent votes:`)
      votes.forEach((vote, index) => {
        console.log(`${index + 1}. User ${vote.voter_fid} voted for vendor ${vote.vendor_id}`)
        console.log(`   Date: ${vote.vote_date}`)
        console.log(`   Tokens: ${vote.token_reward}`)
        console.log('')
      })
    }

    // Check zones
    console.log('🗺️ Zones:')
    console.log('========')
    
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name')
      .order('name')

    if (zonesError) {
      console.error('❌ Error fetching zones:', zonesError)
    } else {
      console.log(`\n📍 Found ${zones.length} zones:`)
      zones.forEach((zone, index) => {
        console.log(`${index + 1}. ${zone.name} (ID: ${zone.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkVendors() 