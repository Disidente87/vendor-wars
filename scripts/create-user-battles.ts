import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Function to get battle ID based on user FID (same as in voting.ts)
function getUserBattleId(userFid: string, voteNumber: number = 1): string {
  // Format: 0000{userFid}-0000-0000-0000-{voteNumber padded to 12 digits}
  // Example: 0000465823-0000-0000-0000-000000000001
  const paddedFid = userFid.padStart(10, '0')
  const paddedVoteNumber = voteNumber.toString().padStart(12, '0')
  return `${paddedFid}-0000-0000-0000-${paddedVoteNumber}`
}

async function createUserBattles() {
  console.log('🔧 Creating user-based battle IDs in database...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test user FIDs (you can modify these)
  const testUserFids = [
    '465823', // Your test user
    '12345',  // Another test user
    '67890',  // Another test user
    '11111',  // Another test user
    '22222'   // Another test user
  ]

  const battlesToCreate = []

  // Generate battle IDs for each user (up to 10 votes per user)
  for (const userFid of testUserFids) {
    for (let voteNumber = 1; voteNumber <= 10; voteNumber++) {
      const battleId = getUserBattleId(userFid, voteNumber)
      battlesToCreate.push({
        id: battleId,
        name: `Battle for User ${userFid} - Vote ${voteNumber}`,
        description: `Auto-generated battle for user ${userFid}, vote number ${voteNumber}`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  console.log(`📋 Creating ${battlesToCreate.length} battle IDs...`)
  console.log('Sample battle IDs:')
  battlesToCreate.slice(0, 5).forEach(battle => {
    console.log(`  - ${battle.id}: ${battle.name}`)
  })
  console.log()

  try {
    // Insert all battles
    const { data, error } = await supabase
      .from('battles')
      .insert(battlesToCreate)
      .select('id, name')

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('⚠️ Some battle IDs already exist, checking which ones...')
        
        // Check which battles already exist
        for (const battle of battlesToCreate) {
          const { data: existing, error: checkError } = await supabase
            .from('battles')
            .select('id')
            .eq('id', battle.id)
            .single()

          if (existing) {
            console.log(`  ✅ Battle ${battle.id} already exists`)
          } else {
            console.log(`  ❌ Battle ${battle.id} missing, creating...`)
            const { error: insertError } = await supabase
              .from('battles')
              .insert(battle)
            
            if (insertError) {
              console.log(`    ❌ Failed to create ${battle.id}: ${insertError.message}`)
            } else {
              console.log(`    ✅ Created ${battle.id}`)
            }
          }
        }
      } else {
        console.error('❌ Error creating battles:', error.message)
        return
      }
    } else {
      console.log(`✅ Successfully created ${data?.length || 0} battle IDs`)
    }

    // Verify the battles exist
    console.log('\n🔍 Verifying battle IDs exist...')
    const { data: allBattles, error: fetchError } = await supabase
      .from('battles')
      .select('id, name')
      .order('id')

    if (fetchError) {
      console.error('❌ Error fetching battles:', fetchError.message)
    } else {
      console.log(`✅ Found ${allBattles?.length || 0} total battles in database`)
      
      // Show some examples
      console.log('\n📋 Sample battles in database:')
      allBattles?.slice(0, 10).forEach(battle => {
        console.log(`  - ${battle.id}: ${battle.name}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }

  console.log('\n✅ User battle creation complete!')
}

createUserBattles().catch(console.error) 