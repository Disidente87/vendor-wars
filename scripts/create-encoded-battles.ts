import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Function to get battle ID with encoded information (UUID format - same as in voting.ts)
function getEncodedBattleId(vendorId: string, userFid: string, voteNumber: number = 1): string {
  // Format: {vendor8}-{year}-{MMDD}-{vote4}-{user12}
  // Example: 111f3776-2024-1215-0001-000000465823
  
  // Extract first 8 characters from vendor ID
  const vendor8 = vendorId.substring(0, 8)
  
  // Get current date components
  const today = new Date()
  const year = today.getFullYear().toString()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  const mmdd = month + day
  
  // Vote number padded to 4 characters (0001, 0002, 0003)
  const vote4 = voteNumber.toString().padStart(4, '0')
  
  // User FID padded to 12 characters
  const user12 = userFid.padStart(12, '0')
  
  return `${vendor8}-${year}-${mmdd}-${vote4}-${user12}`
}

async function createEncodedBattles() {
  console.log('🔧 Creating encoded battle IDs in database...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test user FIDs
  const testUserFids = [
    '465823', // Your test user
    '12345',  // Another test user
    '67890',  // Another test user
    '11111',  // Another test user
    '22222'   // Another test user
  ]

  // Test vendors with zone IDs
  const testVendors = [
    { id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', name: 'Pupusas María', zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b', category: 'pupusas' },
    { id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', name: 'Tacos El Rey', zone_id: '61bace3e-ae39-4bb5-997b-1737122e8849', category: 'tacos' },
    { id: '525c09b3-dc92-409b-a11d-896bcf4d15b2', name: 'Café Aroma', zone_id: '100b486d-5859-4ab1-9112-2d4bbabcba46', category: 'bebidas' },
    { id: '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1', name: 'Pizza Napoli', zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b', category: 'otros' },
    { id: 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28', name: 'Sushi Express', zone_id: '61bace3e-ae39-4bb5-997b-1737122e8849', category: 'otros' }
  ]

  const battlesToCreate = []

  // Generate battle IDs for each user and vendor combination (up to 3 votes per vendor per day)
  for (const userFid of testUserFids) {
    for (const vendor of testVendors) {
      for (let voteNumber = 1; voteNumber <= 3; voteNumber++) {
        const battleId = getEncodedBattleId(vendor.id, userFid, voteNumber)
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
        
        battlesToCreate.push({
          id: battleId,
          challenger_id: vendor.id, // Use vendor ID as challenger
          opponent_id: vendor.id, // Use same vendor ID as opponent for now
          category: vendor.category, // Use vendor's category
          zone_id: vendor.zone_id, // Use vendor's zone ID
          status: 'active',
          start_date: startDate,
          end_date: endDate,
          description: `Vote battle for ${vendor.name} - User ${userFid} - Vote ${voteNumber}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }
  }

  console.log(`📋 Creating ${battlesToCreate.length} encoded battle IDs...`)
  console.log('Sample battle IDs:')
  battlesToCreate.slice(0, 5).forEach(battle => {
    console.log(`  - ${battle.id}`)
  })
  console.log()

  try {
    // Insert all battles
    const { data, error } = await supabase
      .from('battles')
      .insert(battlesToCreate)
      .select('id')

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
      console.log(`✅ Successfully created ${data?.length || 0} encoded battle IDs`)
    }

    // Verify the battles exist
    console.log('\n🔍 Verifying encoded battle IDs exist...')
    const { data: allBattles, error: fetchError } = await supabase
      .from('battles')
      .select('id')
      .order('id')

    if (fetchError) {
      console.error('❌ Error fetching battles:', fetchError.message)
    } else {
      console.log(`✅ Found ${allBattles?.length || 0} total battles in database`)
      
      // Show some examples
      console.log('\n📋 Sample encoded battles in database:')
      allBattles?.slice(0, 10).forEach(battle => {
        console.log(`  - ${battle.id}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }

  console.log('\n✅ Encoded battle creation complete!')
  console.log('\n📋 Summary:')
  console.log('- Each battle ID encodes: Vendor prefix, Year, Month/Day, Vote number, User FID')
  console.log('- Format: {vendor8}-{year}-{MMDD}-{vote4}-{user12}')
  console.log('- Clean UUID format with meaningful information')
  console.log('- Fully decodable and human-readable')
  console.log('- Deterministic and predictable')
  console.log('- Contains all the information you requested!')
}

createEncodedBattles().catch(console.error) 