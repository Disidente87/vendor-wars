#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUsersSchema() {
  console.log('🔍 Checking users table schema...')
  
  try {
    // Get a sample user to check available columns
    const { data: sampleUser, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('❌ Error accessing users table:', sampleError)
      return false
    }

    if (!sampleUser || sampleUser.length === 0) {
      console.log('📭 Users table is empty, but accessible')
      return true
    }

    const userColumns = Object.keys(sampleUser[0])
    console.log('✅ Users table found with the following columns:')
    console.log('')

    const expectedColumns = [
      'fid',
      'username', 
      'display_name',
      'avatar_url',
      'battle_tokens',
      'vote_streak',
      'created_at',
      'updated_at'
    ]

    let allColumnsMatch = true

    for (const column of userColumns) {
      if (expectedColumns.includes(column)) {
        console.log(`✅ ${column}`)
      } else {
        console.log(`⚠️  ${column} - Unexpected column`)
      }
    }

    console.log('')
    
    // Check for missing expected columns
    for (const expected of expectedColumns) {
      if (!userColumns.includes(expected)) {
        console.log(`❌ Missing expected column: ${expected}`)
        allColumnsMatch = false
      }
    }

    // Check primary key constraint
    console.log('🔍 Checking primary key constraint...')
    
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .eq('constraint_type', 'PRIMARY KEY')

    if (!constraintError && constraints && constraints.length > 0) {
      console.log('✅ Primary key constraint found:', constraints[0].constraint_name)
    } else {
      console.log('❌ Primary key constraint not found')
      allColumnsMatch = false
    }

    // Check key columns for primary key
    const { data: keyColumns, error: keyError } = await supabase
      .from('information_schema.key_column_usage')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .eq('constraint_name', 'users_pkey')

    if (!keyError && keyColumns && keyColumns.length > 0) {
      console.log('✅ Primary key column:', keyColumns[0].column_name)
      if (keyColumns[0].column_name !== 'fid') {
        console.log('❌ Expected primary key column to be "fid"')
        allColumnsMatch = false
      }
    }

    console.log('')
    
    if (allColumnsMatch) {
      console.log('✅ Users table schema is valid and matches expected structure!')
      return true
    } else {
      console.log('❌ Users table schema has issues. Please check the differences above.')
      return false
    }

  } catch (error) {
    console.error('❌ Error checking users schema:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting users schema validation...')
  console.log('')
  
  const success = await checkUsersSchema()
  
  console.log('')
  if (success) {
    console.log('🎉 Users schema check completed successfully!')
    process.exit(0)
  } else {
    console.log('💥 Users schema check failed!')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
}) 