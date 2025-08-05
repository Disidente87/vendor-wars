// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔧 Testing Supabase Connection...\n')
  
  // Check environment variables
  console.log('Environment Variables:')
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`   Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Missing'}`)
  console.log('')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('❌ Missing Supabase environment variables')
    return
  }

  try {
    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    console.log('🔍 Testing connection...')
    
    // Try a simple query
    const { data, error } = await supabase
      .from('vendors')
      .select('count')
      .limit(1)

    if (error) {
      console.log('❌ Supabase error:', error)
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('   Data:', data)
    }

  } catch (error) {
    console.log('❌ Connection failed:', error.message)
  }
}

// Run the test
testSupabaseConnection().catch(console.error) 