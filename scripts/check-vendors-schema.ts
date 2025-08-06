import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkVendorsSchema() {
  console.log('🔍 Checking vendors table schema...')
  
  try {
    // Get a sample vendor to see the structure
    const { data: sampleVendor, error: sampleError } = await supabase
      .from('vendors')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleError) {
      console.log('❌ Error getting sample vendor:', sampleError.message)
      return
    }
    
    if (sampleVendor) {
      console.log('📋 Vendors table structure:')
      console.log('Columns found:')
      Object.keys(sampleVendor).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleVendor[key]} (${sampleVendor[key]})`)
      })
    } else {
      console.log('ℹ️ No vendors found in table')
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error)
  }
}

checkVendorsSchema() 