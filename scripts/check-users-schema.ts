#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'

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
    // Get table information
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (tableError) {
      console.error('❌ Error fetching table schema:', tableError)
      return false
    }

    if (!tableInfo || tableInfo.length === 0) {
      console.error('❌ Users table not found or no columns returned')
      return false
    }

    console.log('✅ Users table found with the following columns:')
    console.log('')

    const expectedColumns = [
      { name: 'fid', type: 'bigint', nullable: 'NO' },
      { name: 'username', type: 'text', nullable: 'YES' },
      { name: 'display_name', type: 'text', nullable: 'YES' },
      { name: 'avatar_url', type: 'text', nullable: 'YES' },
      { name: 'battle_tokens', type: 'integer', nullable: 'YES' },
      { name: 'vote_streak', type: 'integer', nullable: 'YES' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: 'YES' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: 'YES' }
    ]

    let allColumnsMatch = true
    const foundColumns = new Set()

    for (const column of tableInfo) {
      foundColumns.add(column.column_name)
      const expected = expectedColumns.find(c => c.name === column.column_name)
      
      if (expected) {
        const typeMatch = column.data_type === expected.type
        const nullableMatch = column.is_nullable === expected.nullable
        
        if (typeMatch && nullableMatch) {
          console.log(`✅ ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
        } else {
          console.log(`❌ ${column.column_name}:`)
          console.log(`   Expected: ${expected.type} (${expected.nullable === 'YES' ? 'nullable' : 'not null'})`)
          console.log(`   Found: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
          allColumnsMatch = false
        }
      } else {
        console.log(`⚠️  ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'}) - Unexpected column`)
      }
    }

    console.log('')
    
    // Check for missing expected columns
    for (const expected of expectedColumns) {
      if (!foundColumns.has(expected.name)) {
        console.log(`❌ Missing expected column: ${expected.name} (${expected.type})`)
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