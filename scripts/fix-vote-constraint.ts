import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixVoteConstraint() {
  console.log('🔧 Fixing Vote Constraint to Allow 3 Votes per Day')
  console.log('================================================')

  try {
    // 1. Check current votes table structure
    console.log('\n1. Checking current votes table structure...')
    
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(5)

    if (votesError) {
      console.error('❌ Error accessing votes table:', votesError)
      return
    }

    console.log('✅ Votes table accessible')
    console.log('Sample vote structure:', votes[0])

    // 2. Check current constraints
    console.log('\n2. Checking current constraints...')
    
    // Try to insert a duplicate vote to see the current constraint
    const testVote = {
      voter_fid: 497866,
      vendor_id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
      vote_date: new Date().toISOString().split('T')[0],
      is_verified: false,
      token_reward: 10,
      multiplier: 1,
      reason: 'Test vote for constraint check'
    }

    console.log('Testing with vote:', testVote)

    const { error: insertError } = await supabase
      .from('votes')
      .insert(testVote)

    if (insertError) {
      console.log('❌ Insert failed (expected):', insertError.message)
      
      if (insertError.message.includes('duplicate key')) {
        console.log('🔍 Current constraint: Only 1 vote per user per vendor per day allowed')
        console.log('📋 Need to change to: Up to 3 votes per user per vendor per day')
      }
    } else {
      console.log('✅ First vote inserted successfully')
      
      // Try to insert a second vote
      const { error: secondVoteError } = await supabase
        .from('votes')
        .insert(testVote)

      if (secondVoteError) {
        console.log('❌ Second vote failed:', secondVoteError.message)
      } else {
        console.log('✅ Second vote inserted successfully')
      }
    }

    // 3. Show current vote count for the test user
    console.log('\n3. Checking current vote count for test user...')
    
    const { data: userVotes, error: countError } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_fid', 497866)
      .eq('vendor_id', '772cdbda-2cbb-4c67-a73a-3656bf02a4c1')
      .eq('vote_date', new Date().toISOString().split('T')[0])

    if (countError) {
      console.error('❌ Error counting votes:', countError)
    } else {
      console.log(`📊 Current votes for user 497866 on vendor 772cdbda-2cbb-4c67-a73a-3656bf02a4c1 today: ${userVotes.length}`)
    }

    // 4. Provide solution
    console.log('\n🎯 SOLUTION NEEDED:')
    console.log('The current database constraint only allows 1 vote per user per vendor per day.')
    console.log('According to the PRD, users should be able to vote up to 3 times per vendor per day.')
    console.log('')
    console.log('📋 To fix this, you need to:')
    console.log('1. Remove the current unique constraint on (voter_fid, vendor_id, vote_date)')
    console.log('2. Add a check constraint to limit votes to 3 per day')
    console.log('3. Or implement the limit in application code')
    console.log('')
    console.log('🔧 SQL to fix (run in Supabase SQL editor):')
    console.log(`
-- Option 1: Remove unique constraint and add check constraint
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_voter_vendor_date_unique;

-- Option 2: Or implement in application code (recommended)
-- Keep the unique constraint but modify the voting logic to allow up to 3 votes
    `)

    console.log('\n💡 Recommended approach:')
    console.log('1. Keep the unique constraint for data integrity')
    console.log('2. Modify the voting service to check vote count before insertion')
    console.log('3. Only block insertion if user has already voted 3 times today')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixVoteConstraint() 