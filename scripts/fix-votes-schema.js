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

async function fixVotesSchema() {
  try {
    console.log('🔧 Starting votes table schema fix...')

    // 1. First, let's check the current schema
    console.log('📋 Checking current votes table schema...')
    const { data: currentSchema, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'votes')
      .eq('table_schema', 'public')

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError)
      return
    }

    console.log('📋 Current votes table columns:')
    currentSchema.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })

    // 2. Check if battle_id column exists
    const hasBattleId = currentSchema.some(col => col.column_name === 'battle_id')
    console.log(`🔍 battle_id column exists: ${hasBattleId}`)

    // 3. Check constraints
    console.log('🔍 Checking table constraints...')
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'votes' })

    if (constraintError) {
      console.log('⚠️ Could not check constraints, proceeding with fixes...')
    } else {
      console.log('📋 Current constraints:', constraints)
    }

    // 4. Fix the schema step by step
    console.log('🔧 Applying schema fixes...')

    // Step 1: Add missing columns if they don't exist
    const missingColumns = []
    
    if (!currentSchema.some(col => col.column_name === 'vote_date')) {
      missingColumns.push('vote_date DATE')
    }
    
    if (!currentSchema.some(col => col.column_name === 'battle_id')) {
      missingColumns.push('battle_id UUID REFERENCES battles(id)')
    }

    if (missingColumns.length > 0) {
      console.log('➕ Adding missing columns:', missingColumns)
      
      for (const columnDef of missingColumns) {
        const [columnName] = columnDef.split(' ')
        try {
          const { error: addError } = await supabase.rpc('add_column_if_not_exists', {
            table_name: 'votes',
            column_name: columnName,
            column_definition: columnDef
          })
          
          if (addError) {
            console.log(`⚠️ Could not add column ${columnName}:`, addError.message)
          } else {
            console.log(`✅ Added column ${columnName}`)
          }
        } catch (error) {
          console.log(`⚠️ Error adding column ${columnName}:`, error.message)
        }
      }
    }

    // Step 2: Drop the problematic unique constraint if it exists
    console.log('🗑️ Attempting to drop unique constraint...')
    try {
      const { error: dropError } = await supabase.rpc('drop_constraint_if_exists', {
        table_name: 'votes',
        constraint_name: 'votes_voter_fid_battle_id_key'
      })
      
      if (dropError) {
        console.log('⚠️ Could not drop constraint:', dropError.message)
      } else {
        console.log('✅ Dropped unique constraint')
      }
    } catch (error) {
      console.log('⚠️ Error dropping constraint:', error.message)
    }

    // Step 3: Create a new, more appropriate unique constraint
    console.log('🔒 Creating new unique constraint...')
    try {
      const { error: constraintError } = await supabase.rpc('add_constraint_if_not_exists', {
        table_name: 'votes',
        constraint_name: 'votes_voter_fid_vendor_id_vote_date_key',
        constraint_definition: 'UNIQUE(voter_fid, vendor_id, vote_date)'
      })
      
      if (constraintError) {
        console.log('⚠️ Could not add new constraint:', constraintError.message)
      } else {
        console.log('✅ Added new unique constraint (voter_fid, vendor_id, vote_date)')
      }
    } catch (error) {
      console.log('⚠️ Error adding new constraint:', error.message)
    }

    // Step 4: Update existing votes to have proper vote_date if missing
    console.log('📅 Updating existing votes with vote_date...')
    try {
      const { error: updateError } = await supabase
        .from('votes')
        .update({ vote_date: supabase.sql`created_at::date` })
        .is('vote_date', null)

      if (updateError) {
        console.log('⚠️ Could not update vote_date:', updateError.message)
      } else {
        console.log('✅ Updated existing votes with vote_date')
      }
    } catch (error) {
      console.log('⚠️ Error updating vote_date:', error.message)
    }

    // 5. Verify the final schema
    console.log('🔍 Verifying final schema...')
    const { data: finalSchema, error: finalError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'votes')
      .eq('table_schema', 'public')

    if (finalError) {
      console.error('❌ Error checking final schema:', finalError)
      return
    }

    console.log('📋 Final votes table columns:')
    finalSchema.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })

    console.log('✅ Votes table schema fix completed!')

  } catch (error) {
    console.error('❌ Error fixing votes schema:', error)
  }
}

// Run the fix
fixVotesSchema()
  .then(() => {
    console.log('🎉 Schema fix process completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Schema fix failed:', error)
    process.exit(1)
  })
