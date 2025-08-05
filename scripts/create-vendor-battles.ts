import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createVendorBattles() {
  console.log('🏗️ Creating battles for vendors...\n')

  try {
    // 1. Get all vendors
    console.log('1. Getting all vendors...')
    
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, category')

    if (vendorsError) {
      console.log('❌ Cannot get vendors:', vendorsError.message)
      return
    }

    console.log(`✅ Found ${vendors.length} vendors`)

    // 2. Create a battle for each vendor
    for (const vendor of vendors) {
      console.log(`\n2. Creating battle for vendor: ${vendor.name} (${vendor.id})...`)
      
      const battleId = uuidv4()
      const now = new Date()
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now

      const battle = {
        id: battleId,
        challenger_id: vendor.id,
        opponent_id: vendor.id, // Use same vendor as opponent for now
        category: vendor.category,
        zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b', // Use existing zone
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        description: `Battle for ${vendor.name}`,
        territory_impact: false,
        created_at: now.toISOString()
      }

      const { data: createdBattle, error: battleError } = await supabase
        .from('battles')
        .insert(battle)
        .select()

      if (battleError) {
        console.log(`❌ Failed to create battle for ${vendor.name}:`, battleError.message)
      } else {
        console.log(`✅ Created battle ${battleId} for ${vendor.name}`)
      }
    }

    console.log('\n🎉 Battle creation completed!')
    console.log('\nNext steps:')
    console.log('1. Update the voting service to use vendor-specific battles')
    console.log('2. Test voting with the new battle system')

  } catch (error) {
    console.error('❌ Battle creation failed:', error)
  }
}

createVendorBattles() 