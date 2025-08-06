import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function cleanupBattles() {
  console.log('🧹 Cleaning up existing battles...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 1. Get all battles
    console.log('1️⃣ Fetching all battles...')
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('id, challenger_id, category')
      .order('created_at')

    if (battlesError) {
      console.error('❌ Error fetching battles:', battlesError.message)
      return
    }

    console.log(`✅ Found ${battles?.length || 0} battles`)
    console.log()

    // 2. Show battles to be deleted
    console.log('2️⃣ Battles to be deleted:')
    for (const battle of battles || []) {
      console.log(`   - ${battle.id} (${battle.category})`)
    }
    console.log()

    // 3. Delete all battles
    console.log('3️⃣ Deleting all battles...')
    let deletedCount = 0
    
    for (const battle of battles || []) {
      const { error: deleteError } = await supabase
        .from('battles')
        .delete()
        .eq('id', battle.id)

      if (deleteError) {
        console.error(`❌ Error deleting battle ${battle.id}:`, deleteError.message)
      } else {
        deletedCount++
        console.log(`   ✅ Deleted: ${battle.id}`)
      }
    }

    console.log(`✅ ${deletedCount} battles deleted`)
    console.log()

    // 4. Verify deletion
    console.log('4️⃣ Verifying deletion...')
    const { data: remainingBattles, error: verifyError } = await supabase
      .from('battles')
      .select('id')

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError.message)
      return
    }

    if (remainingBattles && remainingBattles.length === 0) {
      console.log('✅ All battles successfully deleted')
    } else {
      console.log(`⚠️  ${remainingBattles?.length || 0} battles still remain`)
    }

    console.log('\n🎉 Battle cleanup complete!')
    console.log('📝 Next step: Run "npm run create:encoded-battles" to create new battles')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

cleanupBattles().catch(console.error) 