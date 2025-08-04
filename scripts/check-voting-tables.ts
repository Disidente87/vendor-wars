import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkVotingTables() {
  console.log('🔍 Checking Voting Tables Structure...\n')

  try {
    // Check votes table structure
    console.log('1️⃣ Checking votes table...')
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1)

    if (votesError) {
      console.log('❌ Error accessing votes table:', votesError)
    } else {
      console.log('✅ Votes table accessible')
      if (votesData && votesData.length > 0) {
        console.log('📊 Sample vote record:')
        console.log(JSON.stringify(votesData[0], null, 2))
      }
    }

    // Check attestations table structure
    console.log('\n2️⃣ Checking attestations table...')
    const { data: attestationsData, error: attestationsError } = await supabase
      .from('attestations')
      .select('*')
      .limit(1)

    if (attestationsError) {
      console.log('❌ Error accessing attestations table:', attestationsError)
    } else {
      console.log('✅ Attestations table accessible')
      if (attestationsData && attestationsData.length > 0) {
        console.log('📊 Sample attestation record:')
        console.log(JSON.stringify(attestationsData[0], null, 2))
      }
    }

    // Check sample data counts
    console.log('\n3️⃣ Checking data counts...')
    
    const { count: votesCount, error: votesCountError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })

    if (votesCountError) {
      console.log('❌ Error counting votes:', votesCountError)
    } else {
      console.log(`📊 Total votes: ${votesCount}`)
    }

    const { count: attestationsCount, error: attestationsCountError } = await supabase
      .from('attestations')
      .select('*', { count: 'exact', head: true })

    if (attestationsCountError) {
      console.log('❌ Error counting attestations:', attestationsCountError)
    } else {
      console.log(`📊 Total attestations: ${attestationsCount}`)
    }

    // Check vendors table for reference
    console.log('\n4️⃣ Checking vendors table...')
    const { data: vendorsData, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name, zone')
      .limit(5)

    if (vendorsError) {
      console.log('❌ Error accessing vendors table:', vendorsError)
    } else {
      console.log('✅ Vendors table accessible')
      console.log('📊 Sample vendors:')
      vendorsData?.forEach(vendor => {
        console.log(`   - ${vendor.name} (${vendor.id}) in ${vendor.zone}`)
      })
    }

    console.log('\n🎉 Table structure check completed!')

  } catch (error) {
    console.error('❌ Error checking tables:', error)
  }
}

// Run the check
checkVotingTables()
  .then(() => {
    console.log('\nScript completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 