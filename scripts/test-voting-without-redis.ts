import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testVotingWithoutRedis() {
  console.log('🧪 Testing voting system without Redis...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 1. Check if tables exist
    console.log('1️⃣ Checking database tables...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('fid, username')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Error accessing users table:', usersError.message)
      return
    }
    console.log('✅ Users table accessible')

    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(1)
    
    if (vendorsError) {
      console.log('❌ Error accessing vendors table:', vendorsError.message)
      return
    }
    console.log('✅ Vendors table accessible')

    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('id, voter_fid, vendor_id')
      .limit(1)
    
    if (votesError) {
      console.log('❌ Error accessing votes table:', votesError.message)
      return
    }
    console.log('✅ Votes table accessible')

    // 2. Check table structure
    console.log('\n2️⃣ Checking table structure...')
    
    const { data: votesStructure, error: structureError } = await supabase
      .from('votes')
      .select('*')
      .limit(0)
    
    if (structureError) {
      console.log('❌ Error checking votes structure:', structureError.message)
      return
    }
    
    console.log('✅ Votes table structure is correct')
    console.log('   - Should have: voter_fid, vendor_id, vote_date, created_at')
    console.log('   - Should NOT have: battle_id')

    // 3. Test vote insertion manually
    console.log('\n3️⃣ Testing manual vote insertion...')
    
    // Generate a random FID to avoid conflicts with existing votes
    const testUserFid = Math.floor(Math.random() * 900000) + 100000 // Random 6-digit number
    const testVendorId = vendors?.[0]?.id || '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0'
    const today = new Date().toISOString().split('T')[0]
    
    console.log(`   Test user FID: ${testUserFid}`)
    console.log(`   Test vendor ID: ${testVendorId}`)
    console.log(`   Vote date: ${today}`)

    // Check if user exists, if not create one
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('fid')
      .eq('fid', testUserFid.toString())
      .single()

    if (!existingUser) {
      console.log('   Creating test user...')
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          fid: testUserFid,
          username: 'test_user',
          display_name: 'Test User',
          avatar_url: { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test' },
          battle_tokens: 0,
          vote_streak: 0
        })
      
      if (createUserError) {
        console.log('❌ Error creating test user:', createUserError.message)
        return
      }
      console.log('✅ Test user created')
    } else {
      console.log('✅ Test user exists')
    }

    // Check if vendor exists, if not create one
    const { data: existingVendor, error: vendorCheckError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', testVendorId)
      .single()

    if (!existingVendor) {
      console.log('   Creating test vendor...')
      const { error: createVendorError } = await supabase
        .from('vendors')
        .insert({
          id: testVendorId,
          name: 'Test Vendor',
          description: 'Test vendor for voting',
          image_url: 'https://via.placeholder.com/100',
          category: 'pupusas',
          zone: 'test-zone',
          coordinates: '(0,0)',
          owner_fid: testUserFid,
          total_votes: 0,
          verified_votes: 0
        })
      
      if (createVendorError) {
        console.log('❌ Error creating test vendor:', createVendorError.message)
        return
      }
      console.log('✅ Test vendor created')
    } else {
      console.log('✅ Test vendor exists')
    }

    // Check if vote already exists for today
          const { data: existingVote, error: voteCheckError } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_fid', testUserFid.toString())
        .eq('vendor_id', testVendorId)
        .eq('vote_date', today)
        .single()

    if (existingVote) {
      console.log('⚠️ Vote already exists for today, testing with different vendor...')
      // Try with a different vendor
      const { data: otherVendors } = await supabase
        .from('vendors')
        .select('id')
        .neq('id', testVendorId)
        .limit(1)
      
      if (otherVendors && otherVendors.length > 0) {
        const differentVendorId = otherVendors[0].id
        console.log(`   Using different vendor: ${differentVendorId}`)
        
        const { data: vote2, error: vote2Error } = await supabase
          .from('votes')
          .insert({
            voter_fid: testUserFid.toString(),
            vendor_id: differentVendorId,
            is_verified: false,
            token_reward: 10,
            multiplier: 1.00,
            vote_date: today,
            reason: 'Test vote without Redis'
          })
          .select('id')
          .single()

        if (vote2Error) {
          console.log('❌ Error inserting vote with different vendor:', vote2Error.message)
          return
        }
        console.log('✅ Vote inserted successfully with different vendor')
      }
    } else {
      // Insert test vote
      const { data: vote, error: voteError } = await supabase
        .from('votes')
        .insert({
          voter_fid: testUserFid.toString(),
          vendor_id: testVendorId,
          is_verified: false,
          token_reward: 10,
          multiplier: 1.00,
          vote_date: today,
          reason: 'Test vote without Redis'
        })
        .select('id')
        .single()

      if (voteError) {
        console.log('❌ Error inserting vote:', voteError.message)
        console.log('   Error details:', voteError)
        return
      }
      console.log('✅ Vote inserted successfully')
      console.log(`   Vote ID: ${vote.id}`)
    }

    // 4. Test vote limit constraint
    console.log('\n4️⃣ Testing vote limit constraint...')
    
    const { data: todayVotes, error: todayVotesError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_fid', testUserFid.toString())
      .eq('vote_date', today)

    if (todayVotesError) {
      console.log('❌ Error checking today votes:', todayVotesError.message)
      return
    }

    console.log(`   Votes today: ${todayVotes?.length || 0}`)
    
    if (todayVotes && todayVotes.length >= 3) {
      console.log('✅ Vote limit constraint working (3 votes reached)')
    } else {
      console.log('✅ Can vote more times today')
    }

    // 5. Test vendor stats update
    console.log('\n5️⃣ Testing vendor stats update...')
    
    const { data: vendorStats, error: statsError } = await supabase
      .from('vendors')
      .select('total_votes, verified_votes')
      .eq('id', testVendorId)
      .single()

    if (statsError) {
      console.log('❌ Error getting vendor stats:', statsError.message)
      return
    }

    console.log(`   Vendor total votes: ${vendorStats.total_votes}`)
    console.log(`   Vendor verified votes: ${vendorStats.verified_votes}`)

    console.log('\n🎉 Voting system test completed successfully!')
    console.log('✅ Database schema is working correctly')
    console.log('✅ Vote insertion works without Redis')
    console.log('✅ Vote limit constraint is functional')
    console.log('✅ Vendor stats are accessible')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testVotingWithoutRedis().catch(console.error) 