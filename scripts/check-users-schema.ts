import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsersSchema() {
  console.log('🔍 Checking users table schema...')
  
  try {
    // Try to get table information
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.log('❌ Error accessing users table:', tableError.message)
      return
    }
    
    console.log('✅ Users table is accessible')
    
    // Get a sample user to see the structure
    const { data: sampleUser, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleError) {
      console.log('❌ Error getting sample user:', sampleError.message)
      return
    }
    
    if (sampleUser) {
      console.log('📋 Users table structure:')
      console.log('Columns found:')
      Object.keys(sampleUser).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleUser[key]} (${sampleUser[key]})`)
      })
    } else {
      console.log('ℹ️ No users found in table')
    }
    
    // Try to get table schema information
    console.log('\n🔍 Attempting to get schema information...')
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'users' })
    
    if (schemaError) {
      console.log('❌ Could not get schema info:', schemaError.message)
      console.log('This is normal - RPC function may not exist')
    } else {
      console.log('📋 Schema info:', schemaInfo)
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error)
  }
}

checkUsersSchema() 