const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCategoryDebug() {
  console.log('🔍 Testing category debug...')
  
  // 1. Check what categories exist in the database
  console.log('\n📋 Checking existing categories in database:')
  const { data: categories, error: categoriesError } = await supabase
    .from('vendors')
    .select('category')
    .limit(10)
  
  if (categoriesError) {
    console.error('❌ Error fetching categories:', categoriesError)
  } else {
    console.log('✅ Categories found:', categories.map(v => v.category))
  }
  
  // 2. Check the ENUM values directly
  console.log('\n🔍 Checking vendor_category ENUM values:')
  const { data: enumValues, error: enumError } = await supabase
    .rpc('get_vendor_categories')
    .catch(() => {
      // If function doesn't exist, try direct query
      return supabase.rpc('get_enum_values', { enum_name: 'vendor_category' })
    })
  
  if (enumError) {
    console.log('⚠️  RPC failed, trying direct SQL query...')
    // Try to get enum values directly
    const { data: directEnum, error: directError } = await supabase
      .from('pg_enum')
      .select('enumlabel')
      .eq('enumtypid', '(SELECT oid FROM pg_type WHERE typname = \'vendor_category\')')
    
    if (directError) {
      console.error('❌ Error getting enum values:', directError)
    } else {
      console.log('✅ ENUM values found:', directEnum?.map(e => e.enumlabel))
    }
  } else {
    console.log('✅ ENUM values from RPC:', enumValues)
  }
  
  // 3. Test creating a vendor with 'tortas' category
  console.log('\n🧪 Testing vendor creation with "tortas" category:')
  
  // First, get a valid user FID
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('fid')
    .limit(1)
  
  if (usersError || !users?.length) {
    console.error('❌ No users found:', usersError)
    return
  }
  
  const testUserFid = users[0].fid
  console.log('✅ Using test user FID:', testUserFid)
  
  // Get a valid zone ID
  const { data: zones, error: zonesError } = await supabase
    .from('zones')
    .select('id')
    .limit(1)
  
  if (zonesError || !zones?.length) {
    console.error('❌ No zones found:', zonesError)
    return
  }
  
  const testZoneId = zones[0].id
  console.log('✅ Using test zone ID:', testZoneId)
  
  // Try to create vendor with 'tortas' category
  const testVendor = {
    name: 'Test Tortas Vendor',
    description: 'Testing tortas category',
    image_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
    category: 'tortas', // This should match the ENUM
    zone_id: testZoneId,
    owner_fid: testUserFid,
    is_verified: false
  }
  
  console.log('📝 Test vendor data:', testVendor)
  
  const { data: newVendor, error: insertError } = await supabase
    .from('vendors')
    .insert(testVendor)
    .select()
  
  if (insertError) {
    console.error('❌ Error creating vendor with "tortas" category:')
    console.error('   Error details:', insertError)
    
    // Check if it's a constraint violation
    if (insertError.code === '23514') {
      console.log('\n🔍 This is a CHECK constraint violation!')
      console.log('   The category "tortas" is not in the allowed ENUM values')
    }
  } else {
    console.log('✅ Successfully created vendor with "tortas" category:', newVendor)
    
    // Clean up - delete the test vendor
    await supabase
      .from('vendors')
      .delete()
      .eq('id', newVendor[0].id)
    console.log('🧹 Test vendor cleaned up')
  }
}

testCategoryDebug()
  .then(() => {
    console.log('\n✅ Category debug test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
