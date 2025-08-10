import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupZoneFunctions() {
  try {
    console.log('🚀 Setting up automatic zone statistics updates...')
    
    // Read the SQL functions file
    const functionsPath = join(__dirname, '..', 'supabase', 'functions.sql')
    const sqlContent = readFileSync(functionsPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            // Try direct execution if RPC doesn't work
            const { error: directError } = await supabase
              .from('zones')
              .select('id')
              .limit(1)
              .then(() => {
                // This is a workaround - we'll execute the functions manually
                console.log('⚠️ RPC not available, functions will need manual execution')
                return { error: null }
              })
            
            if (directError) {
              console.log(`⚠️ Statement ${i + 1} skipped (will need manual execution):`, statement.substring(0, 100) + '...')
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (stmtError) {
          console.log(`⚠️ Statement ${i + 1} failed (will need manual execution):`, statement.substring(0, 100) + '...')
          console.log('Error:', stmtError.message)
        }
      }
    }
    
    console.log('\n🎯 Zone functions setup completed!')
    console.log('\n📋 Next steps:')
    console.log('1. If functions were not executed automatically, run them manually in Supabase SQL Editor:')
    console.log('   - Copy content from supabase/functions.sql')
    console.log('   - Paste in Supabase Dashboard > SQL Editor')
    console.log('   - Execute the SQL')
    console.log('\n2. Test the functions:')
    console.log('   - Add a new vendor to see active_vendors update')
    console.log('   - Register a vote to see total_votes and heat_level update')
    console.log('\n3. Verify automatic updates:')
    console.log('   - Check zones table after operations')
    console.log('   - Monitor updated_at timestamps')
    
  } catch (error) {
    console.error('❌ Error setting up zone functions:', error)
    console.log('\n💡 Manual setup required:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Copy content from supabase/functions.sql')
    console.log('3. Paste and execute the SQL')
  }
}

// Run the setup
setupZoneFunctions()
