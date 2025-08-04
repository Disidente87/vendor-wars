import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/lib/supabase'
import { VENDOR_ROUTES } from '../src/lib/route-utils'

async function testVendorRoutes() {
  console.log('🧪 Testing vendor routes...')
  
  try {
    // Test 1: Get all vendors from Supabase
    console.log('1. Fetching all vendors from Supabase...')
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
    
    if (error) {
      console.error('❌ Error fetching vendors:', error)
      return
    }
    
    console.log(`✅ Found ${vendors?.length || 0} vendors in database`)
    
    if (vendors && vendors.length > 0) {
      console.log('\n🏪 Vendors found:')
      vendors.forEach(vendor => {
        console.log(`  - ${vendor.name} (ID: ${vendor.id})`)
        console.log(`    Route: /vendors/${vendor.id}`)
        console.log(`    Slug: ${vendor.name.toLowerCase().replace(/\s+/g, '-')}`)
      })
      
      // Test 2: Test each vendor route
      console.log('\n2. Testing vendor routes...')
      for (const vendor of vendors) {
        console.log(`\n🔍 Testing vendor: ${vendor.name}`)
        
        // Test the API endpoint
        const response = await fetch(`http://localhost:3000/api/vendors/${vendor.id}`)
        const result = await response.json()
        
        if (result.success) {
          console.log(`  ✅ API route works: /api/vendors/${vendor.id}`)
          console.log(`  📊 Vendor data: ${result.data.name} - ${result.data.category}`)
        } else {
          console.log(`  ❌ API route failed: /api/vendors/${vendor.id}`)
          console.log(`  📝 Error: ${result.error}`)
        }
      }
      
      // Test 3: Test known vendor routes
      console.log('\n3. Testing known vendor routes...')
      for (const [slug, id] of Object.entries(VENDOR_ROUTES)) {
        console.log(`\n🔍 Testing known route: ${slug} -> ${id}`)
        
        const response = await fetch(`http://localhost:3000/api/vendors/${id}`)
        const result = await response.json()
        
        if (result.success) {
          console.log(`  ✅ Known route works: /vendors/${slug} -> /vendors/${id}`)
        } else {
          console.log(`  ❌ Known route failed: /vendors/${slug} -> /vendors/${id}`)
        }
      }
    }
    
    console.log('\n🎉 Vendor routes test completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testVendorRoutes() 