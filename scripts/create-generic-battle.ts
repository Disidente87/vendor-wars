import { createClient } from '@supabase/supabase-js'

// Function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

console.log('🔧 Creating Generic Battle ID for Subsequent Votes...\n')

async function createGenericBattle() {
  const supabase = getSupabaseClient()
  const genericBattleId = '99999999-9999-9999-9999-999999999999'

  console.log('📋 Step 1: Check if generic battle already exists')
  console.log('=' .repeat(50))

  try {
    const { data: existingBattle, error: checkError } = await supabase
      .from('battles')
      .select('id, zone_id, status')
      .eq('id', genericBattleId)
      .single()

    if (existingBattle) {
      console.log('✅ Generic battle already exists:')
      console.log(`   - Battle ID: ${existingBattle.id}`)
      console.log(`   - Zone ID: ${existingBattle.zone_id}`)
      console.log(`   - Status: ${existingBattle.status}`)
      return
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      console.log('❌ Generic battle does not exist, creating it...')
    } else {
      console.error('❌ Error checking generic battle:', error)
      return
    }
  }

  console.log('\n📋 Step 2: Create generic battle')
  console.log('=' .repeat(50))

  const genericBattle = {
    id: genericBattleId,
    zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b', // Default zone
    status: 'active',
    created_at: new Date().toISOString()
  }

  try {
    const { data: newBattle, error: createError } = await supabase
      .from('battles')
      .insert(genericBattle)
      .select()

    if (createError) {
      console.error('❌ Error creating generic battle:', createError)
      console.error('   Code:', createError.code)
      console.error('   Message:', createError.message)
    } else {
      console.log('✅ Generic battle created successfully:')
      console.log(`   - Battle ID: ${newBattle[0].id}`)
      console.log(`   - Zone ID: ${newBattle[0].zone_id}`)
      console.log(`   - Status: ${newBattle[0].status}`)
    }
  } catch (error) {
    console.error('❌ Exception creating generic battle:', error)
  }

  console.log('\n📋 Step 3: Verify generic battle exists')
  console.log('=' .repeat(50))

  try {
    const { data: verifyBattle, error: verifyError } = await supabase
      .from('battles')
      .select('id, zone_id, status, created_at')
      .eq('id', genericBattleId)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying generic battle:', verifyError)
    } else {
      console.log('✅ Generic battle verified:')
      console.log(`   - Battle ID: ${verifyBattle.id}`)
      console.log(`   - Zone ID: ${verifyBattle.zone_id}`)
      console.log(`   - Status: ${verifyBattle.status}`)
      console.log(`   - Created: ${verifyBattle.created_at}`)
    }
  } catch (error) {
    console.error('❌ Error verifying generic battle:', error)
  }

  console.log('\n✅ Generic Battle Creation Completed!')
  console.log('\n📋 Summary:')
  console.log('   - Generic battle ID: 99999999-9999-9999-9999-999999999999')
  console.log('   - Used for second and third votes per vendor per day')
  console.log('   - Keeps subsequent votes separate from main battle system')
  console.log('   - Ready for multiple voting functionality')
}

// Run the script
createGenericBattle().catch(console.error) 