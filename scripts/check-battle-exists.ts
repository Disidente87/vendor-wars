import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function checkBattleExists() {
  console.log('🔍 Checking if specific battle IDs exist...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Test battle IDs for user 465823
  const testBattleIds = [
    '111f3776-2025-0805-0001-000000465823',
    '111f3776-2025-0805-0002-000000465823',
    '111f3776-2025-0805-0003-000000465823'
  ]

  for (const battleId of testBattleIds) {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('id, challenger_id, category')
        .eq('id', battleId)
        .single()

      if (error) {
        console.log(`❌ Battle ${battleId} not found: ${error.message}`)
      } else {
        console.log(`✅ Battle ${battleId} exists: challenger_id=${data.challenger_id}, category=${data.category}`)
      }
    } catch (error) {
      console.log(`❌ Error checking battle ${battleId}: ${error}`)
    }
  }
}

checkBattleExists().catch(console.error) 