import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function createDefaultBattle() {
  console.log('🛠️  Creating default battle for voting system...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const defaultBattleId = 'default-battle-00000000-0000-0000-0000-000000000000'
    
    // Check if default battle already exists
    console.log('1️⃣ Checking if default battle exists...')
    const { data: existingBattle, error: checkError } = await supabase
      .from('battles')
      .select('id')
      .eq('id', defaultBattleId)
      .single()

    if (existingBattle) {
      console.log('✅ Default battle already exists')
      return
    }

    // Create default battle
    console.log('2️⃣ Creating default battle...')
    const { error: createError } = await supabase
      .from('battles')
      .insert({
        id: defaultBattleId,
        challenger_id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Use first vendor as default
        opponent_id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
        category: 'pupusas',
        zone_id: '1',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        description: 'Default battle for voting system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (createError) {
      console.error('❌ Error creating default battle:', createError.message)
      return
    }

    console.log('✅ Default battle created successfully')
    console.log('\n🎉 Voting system is now ready!')
    console.log('📝 You can now vote without needing to create battle IDs manually')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createDefaultBattle().catch(console.error) 