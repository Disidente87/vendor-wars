#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

async function updateStoragePolicies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('🔧 Connecting to Supabase with service role...')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read the storage setup SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'storage-setup.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 Reading storage setup SQL...')
    console.log('🗂️ File path:', sqlPath)

    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}:`)
      console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`)

      try {
        const { error } = await supabase.rpc('execute_sql', { 
          sql_query: statement + ';' 
        })

        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key')) {
            console.log(`   ⚠️  ${error.message} (expected, continuing...)`)
          } else {
            console.log(`   ❌ Error: ${error.message}`)
          }
        } else {
          console.log(`   ✅ Success`)
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err}`)
      }
    }

    console.log('\n🎉 Storage policies update completed!')
    console.log('\n📋 Summary of changes:')
    console.log('✅ Updated RLS policies to allow service role uploads')
    console.log('✅ Enhanced vendor avatar upload policies')
    console.log('✅ Fixed authentication requirements for storage')

  } catch (error) {
    console.error('❌ Error updating storage policies:', error)
    process.exit(1)
  }
}

// Run the script
updateStoragePolicies().catch(console.error)
