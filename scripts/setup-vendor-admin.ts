#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import { supabase } from '../src/lib/supabase'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function setupVendorAdmin() {
  console.log('🚀 Setting up vendor admin column...')
  
  try {
    // Read the SQL file
    const sqlPath = join(__dirname, 'add-vendor-admin-column.sql')
    const sqlContent = readFileSync(sqlPath, 'utf-8')
    
    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...`)
    
    for (const [index, statement] of statements.entries()) {
      console.log(`⚡ Executing statement ${index + 1}/${statements.length}`)
      console.log(`   ${statement.substring(0, 50)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error executing statement ${index + 1}:`, error.message)
      } else {
        console.log(`✅ Statement ${index + 1} executed successfully`)
      }
    }
    
    console.log('🎉 Vendor admin column setup completed!')
    
    // Verify the column was added
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'vendors')
      .eq('column_name', 'owner_fid')
    
    if (error) {
      console.log('⚠️  Could not verify column creation:', error.message)
    } else if (data && data.length > 0) {
      console.log('✅ Verified: owner_fid column exists')
      console.log('   Column details:', data[0])
    } else {
      console.log('⚠️  owner_fid column not found - you may need to run the SQL manually')
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupVendorAdmin()
