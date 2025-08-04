import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testVendorService() {
  console.log('🧪 Testing vendor query directly...\n')

  try {
    const { data: vendors, error, count } = await supabase
      .from('vendors')
      .select(`
        *,
        zones!inner(name)
      `, { count: 'exact' })
      .range(0, 49)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return
    }

    console.log('📊 Supabase Result:')
    console.log(`Total count: ${count}`)
    console.log(`Vendors found: ${vendors?.length || 0}`)
    
    if (vendors && vendors.length > 0) {
      console.log(`\n✅ Found ${vendors.length} vendors:`)
      vendors.forEach((vendor, index) => {
        console.log(`   ${index + 1}. ${vendor.name} - Zone: ${(vendor.zones as any)?.name}`)
      })
    } else {
      console.log('\n❌ No vendors found')
    }

    console.log('\n✅ Test completed!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testVendorService() 