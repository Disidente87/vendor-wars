import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testVendorImages() {
  console.log('🧪 Testing vendor images...')
  
  try {
    // Test the vendors API endpoint
    console.log('📡 Testing /api/vendors endpoint...')
    
    const response = await fetch('http://localhost:3000/api/vendors')
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Vendors API working correctly!')
      console.log(`📊 Found ${data.data.length} vendors`)
      
      console.log('\n📋 Vendor images:')
      data.data.forEach((vendor: any, index: number) => {
        console.log(`${index + 1}. ${vendor.name}:`)
        console.log(`   Image URL: ${vendor.imageUrl}`)
        console.log(`   Category: ${vendor.category}`)
        console.log(`   Zone: ${vendor.zone}`)
        console.log('')
      })
      
      // Check if all vendors have images
      const vendorsWithoutImages = data.data.filter((vendor: any) => !vendor.imageUrl)
      if (vendorsWithoutImages.length > 0) {
        console.log('⚠️ Vendors without images:')
        vendorsWithoutImages.forEach((vendor: any) => {
          console.log(`   - ${vendor.name}`)
        })
      } else {
        console.log('✅ All vendors have images!')
      }
      
    } else {
      console.log('❌ Vendors API failed:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error testing vendor images:', error)
    console.log('\n💡 Make sure the development server is running:')
    console.log('   npm run dev')
  }
}

testVendorImages()
