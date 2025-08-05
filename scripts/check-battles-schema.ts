import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkBattlesSchema() {
  console.log('🔍 Checking battles table schema...\n')

  try {
    // Get a sample battle to see the structure
    const { data: battles, error } = await supabase
      .from('battles')
      .select('*')
      .limit(1)

    if (error) {
      console.log('❌ Cannot access battles table:', error.message)
      return
    }

    if (battles && battles.length > 0) {
      console.log('✅ Battles table accessible')
      console.log('📊 Battles table structure:')
      console.log(Object.keys(battles[0]))
      console.log('\n📋 Sample battle data:')
      console.log(JSON.stringify(battles[0], null, 2))
    } else {
      console.log('✅ Battles table accessible but empty')
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error)
  }
}

checkBattlesSchema() 