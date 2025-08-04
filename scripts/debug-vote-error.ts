import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function debugVoteError() {
  console.log('🔍 Debugging vote registration error...\n')

  try {
    // 1. Check if Redis is configured
    console.log('1. Checking Redis configuration...')
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (!redisUrl || !redisToken) {
      console.log('⚠️  Redis not configured - this might cause issues')
      console.log(`  - UPSTASH_REDIS_REST_URL: ${redisUrl ? 'Set' : 'Missing'}`)
      console.log(`  - UPSTASH_REDIS_REST_TOKEN: ${redisToken ? 'Set' : 'Missing'}`)
    } else {
      console.log('✅ Redis configuration found')
    }

    // 2. Check if we can connect to Supabase
    console.log('\n2. Testing Supabase connection...')
    const { data: testVendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(1)
      .single()

    if (vendorError) {
      console.error('❌ Supabase connection error:', vendorError)
      return
    }
    console.log('✅ Supabase connection successful')
    console.log(`  - Test vendor: ${testVendor.name} (${testVendor.id})`)

    // 3. Check if user exists
    console.log('\n3. Checking if test user exists...')
    const testUserFid = '12345' // The mock user FID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('fid, username')
      .eq('fid', testUserFid)
      .single()

    if (userError) {
      console.log('⚠️  Test user not found in database')
      console.log('  - This might cause foreign key constraint errors')
    } else {
      console.log('✅ Test user found:', user.username)
    }

    // 4. Check votes table structure
    console.log('\n4. Checking votes table structure...')
    const { data: votesSample, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1)

    if (votesError) {
      console.error('❌ Error accessing votes table:', votesError)
      return
    }
    console.log('✅ Votes table accessible')
    console.log('  - Sample vote columns:', Object.keys(votesSample?.[0] || {}))

    // 5. Test direct vote insertion
    console.log('\n5. Testing direct vote insertion...')
    const testVoteData = {
      id: crypto.randomUUID(),
      voter_fid: testUserFid,
      vendor_id: testVendor.id,
      is_verified: false,
      token_reward: 5,
      multiplier: 1,
      reason: 'Test vote',
      attestation_id: null,
      created_at: new Date().toISOString()
    }

    // Try without battle_id first
    let { error: insertError } = await supabase
      .from('votes')
      .insert(testVoteData)

    if (insertError) {
      console.log('⚠️  Vote insertion failed without battle_id:', insertError.message)
      
      // Try with battle_id
      const testVoteWithBattle = {
        ...testVoteData,
        battle_id: '216b4979-c7e4-44db-a002-98860913639c'
      }
      
      const { error: insertError2 } = await supabase
        .from('votes')
        .insert(testVoteWithBattle)

      if (insertError2) {
        console.error('❌ Vote insertion failed with battle_id:', insertError2.message)
      } else {
        console.log('✅ Vote insertion successful with battle_id')
      }
    } else {
      console.log('✅ Vote insertion successful without battle_id')
    }

    // 6. Test API endpoint
    console.log('\n6. Testing API endpoint...')
    try {
      const response = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: testUserFid,
          vendorId: testVendor.id,
          voteType: 'regular'
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ API vote registration successful')
        console.log(`  - Tokens earned: ${result.data.tokensEarned}`)
        console.log(`  - New balance: ${result.data.newBalance}`)
      } else {
        console.error('❌ API vote registration failed:', result.error)
      }
    } catch (apiError) {
      console.error('❌ API request failed:', apiError)
    }

    console.log('\n✅ Debug completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugVoteError() 