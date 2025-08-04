import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function modifyVotesTable() {
  console.log('🔧 Modifying votes table to handle battle_id...\n')

  try {
    // First, let's check the current structure
    const { data: votes, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('❌ Error accessing votes table:', checkError)
      return
    }

    console.log('✅ Votes table accessible')
    console.log('📊 Current vote structure:', Object.keys(votes[0] || {}))

    // For now, let's create a simple battles table with a default battle
    console.log('\n🏗️ Creating a default battle...')
    
    // Try to insert a default battle
    const { data: defaultBattle, error: battleError } = await supabase
      .from('battles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Default Battle',
        description: 'Default battle for votes without specific battles',
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()

    if (battleError) {
      if (battleError.code === '23505') { // Unique violation
        console.log('✅ Default battle already exists')
      } else {
        console.log('⚠️  Could not create default battle:', battleError.message)
        console.log('   This might be because the battles table doesn\'t exist')
        
        // Alternative: Let's try to make battle_id nullable
        console.log('\n🔄 Trying to make battle_id nullable...')
        console.log('   Please run this SQL in your Supabase dashboard:')
        console.log('   ALTER TABLE votes ALTER COLUMN battle_id DROP NOT NULL;')
        
        return
      }
    } else {
      console.log('✅ Default battle created successfully')
    }

    // Test inserting a vote with the default battle
    console.log('\n🧪 Testing vote insertion with default battle...')
    
    const { data: testVendors } = await supabase
      .from('vendors')
      .select('id')
      .limit(1)

    if (testVendors && testVendors.length > 0) {
      const { data: testVote, error: testVoteError } = await supabase
        .from('votes')
        .insert({
          vendor_id: testVendors[0].id,
          voter_fid: 99999, // Test user
          battle_id: '00000000-0000-0000-0000-000000000000',
          is_verified: false,
          token_reward: 10,
          created_at: new Date().toISOString()
        })
        .select()

      if (testVoteError) {
        console.error('❌ Test vote insertion failed:', testVoteError)
      } else {
        console.log('✅ Test vote inserted successfully')
        
        // Clean up test vote
        await supabase
          .from('votes')
          .delete()
          .eq('id', testVote[0].id)
        
        console.log('✅ Test vote cleaned up')
      }
    }

    console.log('\n🎉 Votes table modification completed!')
    console.log('\nNext steps:')
    console.log('1. If battles table doesn\'t exist, create it manually')
    console.log('2. Or make battle_id nullable in the votes table')
    console.log('3. Test the voting system again')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

modifyVotesTable() 