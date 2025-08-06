import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function resetTokensDB() {
  console.log('🔄 Resetting tokens in database...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 1. Get all users from database
    console.log('1️⃣ Fetching users from database...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid, battle_tokens')
      .order('fid')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }

    console.log(`✅ Found ${users?.length || 0} users in database`)
    console.log()

    // 2. Show current token balances
    console.log('2️⃣ Current token balances:')
    for (const user of users || []) {
      console.log(`  User ${user.fid}: ${user.battle_tokens || 0} tokens`)
    }
    console.log()

    // 3. Reset all tokens to 0
    console.log('3️⃣ Resetting all tokens to 0...')
    let updatedCount = 0
    
    for (const user of users || []) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ battle_tokens: 0 })
        .eq('fid', user.fid)

      if (updateError) {
        console.error(`❌ Error updating user ${user.fid}:`, updateError.message)
      } else {
        updatedCount++
        console.log(`  ✅ Reset user ${user.fid}: ${user.battle_tokens || 0} → 0`)
      }
    }

    console.log(`✅ ${updatedCount} users reset to 0`)
    console.log()

    // 4. Verify the reset
    console.log('4️⃣ Verifying reset...')
    const { data: updatedUsers, error: verifyError } = await supabase
      .from('users')
      .select('fid, battle_tokens')
      .order('fid')

    if (verifyError) {
      console.error('❌ Error verifying reset:', verifyError.message)
      return
    }

    console.log('✅ Verification complete:')
    for (const user of updatedUsers || []) {
      console.log(`  User ${user.fid}: ${user.battle_tokens || 0} tokens`)
    }

    console.log('\n🎉 Token reset complete!')
    console.log('📝 Note: You may need to clear Redis cache manually or restart the application')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

resetTokensDB().catch(console.error) 