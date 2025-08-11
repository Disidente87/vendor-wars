import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkVotesSchema() {
  try {
    console.log('🔍 Checking votes table schema...')

    // Check current columns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'votes')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError)
      return
    }

    console.log('📋 Votes table columns:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })

    // Check constraints
    console.log('\n🔒 Checking constraints...')
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'votes')
      .eq('table_schema', 'public')

    if (constraintsError) {
      console.error('❌ Error checking constraints:', constraintsError)
    } else {
      console.log('📋 Table constraints:')
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`)
      })
    }

    // Check indexes
    console.log('\n📊 Checking indexes...')
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .eq('tablename', 'votes')
      .eq('schemaname', 'public')

    if (indexesError) {
      console.error('❌ Error checking indexes:', indexesError)
    } else {
      console.log('📋 Table indexes:')
      indexes.forEach(index => {
        console.log(`  - ${index.indexname}: ${index.indexdef}`)
      })
    }

    // Try to insert a test record to see what happens
    console.log('\n🧪 Testing vote insertion...')
    const testVote = {
      voter_fid: 12345,
      vendor_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      vote_date: new Date().toISOString().split('T')[0],
      is_verified: false,
      token_reward: 10,
      multiplier: 1,
      reason: 'Test vote'
    }

    console.log('🗳️ Test vote record:', testVote)

    const { data: testInsert, error: testError } = await supabase
      .from('votes')
      .insert(testVote)
      .select('id')

    if (testError) {
      console.error('❌ Test insertion failed:', testError)
      console.error('🔍 Error details:', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code
      })
    } else {
      console.log('✅ Test insertion successful:', testInsert)
      
      // Clean up test record
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('id', testInsert[0].id)
      
      if (deleteError) {
        console.warn('⚠️ Could not clean up test record:', deleteError.message)
      } else {
        console.log('🧹 Test record cleaned up')
      }
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkVotesSchema()
  .then(() => {
    console.log('\n🎉 Schema check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Schema check failed:', error)
    process.exit(1)
  })
