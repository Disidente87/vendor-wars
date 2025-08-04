import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://pncwlterhkclvpgcbuce.supabase.co'
const supabaseServiceKey = 'sb_secret_inLKDcfYd8qz6ZeqYvajuQ_qcCUvLt0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Supabase database...')
    
    // Test connection
    console.log('🔗 Testing connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('📋 Users table does not exist, creating tables...')
      
      // Since we can't create tables via the client, we'll use the migration script
      console.log('📝 Please run the following SQL in your Supabase SQL Editor:')
      console.log('')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the contents of supabase/schema.sql')
      console.log('4. Click "Run" to execute the schema')
      console.log('')
      console.log('After creating the tables, run: npx tsx scripts/migrate-to-supabase.ts')
      
    } else if (error) {
      console.error('❌ Error testing connection:', error)
    } else {
      console.log('✅ Database connection successful')
      console.log('📊 Tables already exist, proceeding to migrate data...')
      
      // Run the migration script
      console.log('🔄 Running data migration...')
      await migrateData()
    }
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

async function migrateData() {
  try {
    console.log('📦 Migrating sample data to Supabase...')
    
    // Import the migration function
    const { migrateData } = await import('./migrate-to-supabase')
    await migrateData()
    
    console.log('🎉 Data migration completed!')
    
  } catch (error) {
    console.error('❌ Error migrating data:', error)
  }
}

setupDatabase() 