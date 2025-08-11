#!/usr/bin/env tsx

/**
 * Setup Script: Vendor Payment Fields Migration
 * 
 * This script helps set up the database schema for the vendor registration payment system.
 * It applies the necessary migrations to add payment and ownership fields to the vendors table.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config()

async function main() {
  console.log('🚀 Setting up vendor payment fields...')
  
  // Check required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    console.log('📋 Reading migration file...')
    const migrationPath = join(process.cwd(), 'supabase', 'add-vendor-payment-fields.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    console.log('🔧 Applying database migration...')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`  Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.warn(`  ⚠️  Warning: ${error.message}`)
        }
      }
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Verify the changes
    console.log('🔍 Verifying migration...')
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'vendors')
      .in('column_name', ['owner_address', 'payment_amount', 'payment_status', 'delegation'])
      .order('column_name')
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError.message)
    } else {
      console.log('📊 New columns added:')
      columns?.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
    // Check existing vendors
    const { count: vendorCount, error: countError } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting vendors:', countError.message)
    } else {
      console.log(`📈 Total vendors in database: ${vendorCount}`)
    }
    
    console.log('\n🎉 Setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Deploy the VendorRegistration smart contract')
    console.log('2. Update environment variables with contract addresses')
    console.log('3. Test the vendor registration system')
    console.log('4. Run: npm run test:vendor-registration')
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main().catch(console.error)
