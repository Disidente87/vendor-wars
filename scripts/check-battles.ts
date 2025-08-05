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

console.log('🔍 Checking Battles Table and Foreign Key Constraints...\n')

async function checkBattles() {
  const supabase = getSupabaseClient()

  console.log('📋 Test 1: Check battles table structure')
  console.log('=' .repeat(50))

  try {
    const { data: battles, error } = await supabase
      .from('battles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching battles:', error)
      return
    }

    console.log(`📊 Found ${battles.length} battles in database:`)
    console.log('\nRecent battles:')
    battles.slice(0, 10).forEach((battle, index) => {
      console.log(`   ${index + 1}. Battle ID: ${battle.id}`)
      console.log(`      - Zone: ${battle.zone_id}`)
      console.log(`      - Created: ${battle.created_at}`)
      console.log(`      - Status: ${battle.status}`)
    })

    if (battles.length > 10) {
      console.log(`   ... and ${battles.length - 10} more battles`)
    }

  } catch (error) {
    console.error('❌ Error checking battles:', error)
  }

  console.log('\n📋 Test 2: Check votes table foreign key constraints')
  console.log('=' .repeat(50))

  try {
    // Get a sample of votes to see what battle_ids are being used
    const { data: votes, error } = await supabase
      .from('votes')
      .select('battle_id, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ Error fetching votes:', error)
      return
    }

    console.log(`📊 Found ${votes.length} recent votes:`)
    console.log('\nBattle IDs used in votes:')
    const uniqueBattleIds = new Set(votes.map(vote => vote.battle_id))
    Array.from(uniqueBattleIds).forEach((battleId, index) => {
      console.log(`   ${index + 1}. ${battleId}`)
    })

  } catch (error) {
    console.error('❌ Error checking votes:', error)
  }

  console.log('\n📋 Test 3: Check if battle IDs in votes exist in battles table')
  console.log('=' .repeat(50))

  try {
    // Get unique battle IDs from votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('battle_id')
      .limit(100)

    if (votesError) {
      console.error('❌ Error fetching votes:', votesError)
      return
    }

    const uniqueBattleIds = [...new Set(votes.map(vote => vote.battle_id))]
    console.log(`📊 Checking ${uniqueBattleIds.length} unique battle IDs from votes...`)

    let existingCount = 0
    let missingCount = 0

    for (const battleId of uniqueBattleIds) {
      const { data: battle, error } = await supabase
        .from('battles')
        .select('id')
        .eq('id', battleId)
        .single()

      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ Battle ID ${battleId} NOT found in battles table`)
        missingCount++
      } else if (battle) {
        console.log(`   ✅ Battle ID ${battleId} found in battles table`)
        existingCount++
      } else {
        console.log(`   ❌ Battle ID ${battleId} error: ${error?.message}`)
        missingCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Existing battle IDs: ${existingCount}`)
    console.log(`   ❌ Missing battle IDs: ${missingCount}`)

  } catch (error) {
    console.error('❌ Error checking battle ID existence:', error)
  }

  console.log('\n📋 Test 4: Check database schema for votes table')
  console.log('=' .repeat(50))

  try {
    // Try to get table information
    const { data: tableInfo, error } = await supabase
      .from('votes')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error accessing votes table:', error)
    } else {
      console.log('✅ Votes table is accessible')
      console.log('📋 Table columns available:')
      if (tableInfo && tableInfo.length > 0) {
        const columns = Object.keys(tableInfo[0])
        columns.forEach((column, index) => {
          console.log(`   ${index + 1}. ${column}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error checking table schema:', error)
  }

  console.log('\n✅ Battles Check Completed!')
}

// Run the check
checkBattles().catch(console.error) 