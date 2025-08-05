import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function checkBattlesTable() {
  console.log('🔍 Checking battles table structure...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Try to get table info
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .limit(1)

    if (error) {
      console.log('❌ Error accessing battles table:', error.message)
      return
    }

    console.log('✅ Battles table accessible')
    console.log('📋 Sample battle record structure:')
    if (data && data.length > 0) {
      const sample = data[0]
      Object.keys(sample).forEach(key => {
        console.log(`  - ${key}: ${typeof sample[key]} = ${sample[key]}`)
      })
    } else {
      console.log('  No battles found in table')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkBattlesTable().catch(console.error) 