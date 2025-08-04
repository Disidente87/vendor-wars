import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createBattlesTable() {
  console.log('🏗️ Creating battles table...\n')

  try {
    // Check if battles table already exists
    const { data: existingBattles, error: checkError } = await supabase
      .from('battles')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === 'PGRST116') {
      console.log('📋 Battles table does not exist, creating...')
      
      // For now, we'll create a simple battles table using the Supabase dashboard
      // or we can work with the existing votes table structure
      console.log('⚠️  Please create the battles table manually in Supabase dashboard')
      console.log('   Or we can modify the voting system to work without battles for now')
      
      return
    }

    console.log('✅ Battles table already exists')

    // Insert some sample battles
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id, name, zone_id')
      .limit(4)

    if (vendors && vendors.length >= 2) {
      const sampleBattles = [
        {
          name: 'Battle of the Tacos',
          description: 'Who makes the best tacos in the zone?',
          zone_id: vendors[0].zone_id,
          challenger_vendor_id: vendors[0].id,
          defender_vendor_id: vendors[1].id,
          status: 'active'
        },
        {
          name: 'Pupusas Showdown',
          description: 'Traditional vs Modern pupusas',
          zone_id: vendors[2]?.zone_id || vendors[0].zone_id,
          challenger_vendor_id: vendors[2]?.id || vendors[0].id,
          defender_vendor_id: vendors[3]?.id || vendors[1].id,
          status: 'active'
        }
      ]

      for (const battle of sampleBattles) {
        const { error: insertError } = await supabase
          .from('battles')
          .insert(battle)

        if (insertError) {
          console.error('❌ Error inserting sample battle:', insertError)
        } else {
          console.log(`✅ Sample battle "${battle.name}" created`)
        }
      }
    }

    console.log('\n🎉 Battles table setup completed!')
    console.log('\nNext steps:')
    console.log('1. Update voting system to use battle_id')
    console.log('2. Create battle management interface')
    console.log('3. Implement battle results calculation')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createBattlesTable() 