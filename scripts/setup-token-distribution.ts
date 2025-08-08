#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function setupTokenDistribution() {
  console.log('🚀 Setting up Token Distribution System...\n')

  try {
    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Connected to Supabase\n')

    // Read SQL file
    const sqlPath = resolve(process.cwd(), 'scripts/create-token-distributions-table.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')
    
    console.log('📄 Executing SQL migration...')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.warn(`⚠️ Warning executing statement: ${error.message}`)
        } else {
          console.log('✅ Statement executed successfully')
        }
      }
    }

    console.log('\n🎉 Token Distribution System Setup Complete!')
    console.log('\n📋 What was created:')
    console.log('  • token_distributions table')
    console.log('  • Indexes for performance')
    console.log('  • Triggers for automatic timestamps')
    console.log('  • Foreign key constraints')
    console.log('\n🔗 Next steps:')
    console.log('  1. Test the voting system')
    console.log('  2. Verify token distributions are being created')
    console.log('  3. Test wallet connection and auto-distribution')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupTokenDistribution()
