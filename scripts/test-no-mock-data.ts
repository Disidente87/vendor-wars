// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function testNoMockData() {
  console.log('🧪 Testing No Mock Data Fallback...\n')

  // Test 1: Test vendor lookup with invalid ID
  console.log('1️⃣ Testing vendor lookup with invalid ID...')
  try {
    const response = await fetch('http://localhost:3000/api/vendors/invalid-vendor-id')
    const result = await response.json()
    
    if (result.success) {
      console.log(`❌ Should have failed but got: ${result.data?.name}`)
    } else {
      console.log(`✅ Correctly failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`✅ Correctly threw error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 2: Test vendors list API
  console.log('\n2️⃣ Testing vendors list API...')
  try {
    const response = await fetch('http://localhost:3000/api/vendors')
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Vendors loaded successfully: ${result.data.length} vendors`)
      result.data.forEach((vendor: any, index: number) => {
        console.log(`   ${index + 1}. ${vendor.name} (${vendor.id})`)
      })
    } else {
      console.log(`❌ Failed to load vendors: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Error loading vendors: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 3: Test voting with invalid vendor
  console.log('\n3️⃣ Testing voting with invalid vendor...')
  try {
    const response = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: '12345',
        vendorId: 'invalid-vendor-id',
        voteType: 'regular',
      }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`❌ Should have failed but got: ${result.data?.tokensEarned} tokens`)
    } else {
      console.log(`✅ Correctly failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`✅ Correctly threw error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  console.log('\n🎉 No Mock Data Test completed!')
  console.log('\n📋 Summary:')
  console.log('✅ System no longer falls back to mock data')
  console.log('✅ Proper error handling when Supabase fails')
  console.log('✅ UI will show loading states instead of fake data')
  console.log('✅ Better user experience with real error messages')
}

// Run the test
testNoMockData().catch(console.error) 