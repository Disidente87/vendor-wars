#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Script to create temporary battle IDs for multiple voting
async function createTempBattles() {
  console.log('🏗️ Creating temporary battle IDs for multiple voting...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Check if battles table exists and get current battles
    const { data: existingBattles, error: fetchError } = await supabase
      .from('battles')
      .select('id, name')
      .limit(10)

    if (fetchError) {
      console.error('❌ Error fetching battles:', fetchError)
      return
    }

    console.log(`📊 Found ${existingBattles.length} existing battles`)

    // Create temporary battle IDs for multiple voting
    const tempBattles = []
    const vendors = [
      '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', // Pupusas María
      '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', // Tacos El Rey
      '525c09b3-dc92-409b-a11d-896bcf4d15b2', // Café Aroma
      '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1', // Pizza Napoli
      'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28'  // Sushi Express
    ]

    // Generate multiple temporary battle IDs for each vendor
    for (const vendorId of vendors) {
      for (let voteNumber = 2; voteNumber <= 10; voteNumber++) { // Allow up to 10 votes per vendor
        const timestamp = Date.now() + Math.floor(Math.random() * 1000000)
        const random = Math.floor(Math.random() * 1000000)
        const battleId = `temp-battle-${vendorId}-${voteNumber}-${timestamp}-${random}`
        
        tempBattles.push({
          id: battleId,
          name: `Temporary Battle ${voteNumber} for Vendor ${vendorId}`,
          description: `Temporary battle ID for ${voteNumber}th vote of the day`,
          zone_id: '49298ccd-5b91-4a41-839d-98c3b2cc504b', // Default zone
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }

    console.log(`📝 Creating ${tempBattles.length} temporary battle IDs...`)

    // Insert temporary battles in batches
    const batchSize = 50
    for (let i = 0; i < tempBattles.length; i += batchSize) {
      const batch = tempBattles.slice(i, i + batchSize)
      
      const { error: insertError } = await supabase
        .from('battles')
        .insert(batch)

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError)
      } else {
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} battles)`)
      }
    }

    // Verify the insertions
    const { data: totalBattles, error: countError } = await supabase
      .from('battles')
      .select('id')
      .like('id', 'temp-battle-%')

    if (countError) {
      console.error('❌ Error counting temporary battles:', countError)
    } else {
      console.log(`✅ Successfully created ${totalBattles.length} temporary battle IDs`)
    }

    console.log('\n🎉 Temporary battle IDs creation completed!')
    console.log('💡 These battle IDs will be used for multiple votes per vendor per day')

  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the script
createTempBattles() 