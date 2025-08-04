import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkAllVendors() {
  console.log('🔍 Checking all vendors and their routes...\n')

  try {
    // Get all vendors from Supabase
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        zones!inner(name)
      `)
      .order('created_at', { ascending: true })

    if (vendorsError) {
      console.error('❌ Error fetching vendors:', vendorsError)
      return
    }

    console.log(`📊 Found ${vendors?.length || 0} vendors in database:`)
    console.log('')

    if (vendors && vendors.length > 0) {
      vendors.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.name}`)
        console.log(`   - ID: ${vendor.id}`)
        console.log(`   - Zone: ${(vendor.zones as any)?.name || 'Unknown'}`)
        console.log(`   - Route: /vendors/${vendor.id}`)
        console.log(`   - Slug Route: /vendors/${vendor.name.toLowerCase().replace(/\s+/g, '-')}`)
        console.log('')
      })
    }

    // Test API endpoints for each vendor
    console.log('🧪 Testing API endpoints for each vendor...')
    console.log('')

    if (vendors && vendors.length > 0) {
      for (const vendor of vendors) {
        try {
          const response = await fetch(`http://localhost:3000/api/vendors/${vendor.id}`)
          const result = await response.json()
          
          if (result.success) {
            console.log(`✅ ${vendor.name}: API working`)
            console.log(`   - Zone: ${result.data.zone}`)
            console.log(`   - Description: ${result.data.description?.substring(0, 50)}...`)
          } else {
            console.log(`❌ ${vendor.name}: API failed - ${result.error}`)
          }
        } catch (error) {
          console.log(`❌ ${vendor.name}: Network error - ${error}`)
        }
      }
    }

    console.log('\n✅ Check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkAllVendors() 