// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

// Now import the services
import { VotingService } from '../src/services/voting'
import { VendorService } from '../src/services/vendors'

async function testVotingServiceFixed() {
  console.log('🧪 Testing Voting Service with Fixed Supabase Client...\n')

  // Test 1: Vendor lookup with VendorService
  console.log('1️⃣ Testing VendorService.getVendor...')
  const testVendorId = '772cdbda-2cbb-4c67-a73a-3656bf02a4c1' // Pupusas María
  
  try {
    const vendor = await VendorService.getVendor(testVendorId)
    if (vendor) {
      console.log(`✅ Found vendor: ${vendor.name} (${vendor.id})`)
    } else {
      console.log(`❌ Vendor not found: ${testVendorId}`)
    }
  } catch (error) {
    console.log(`❌ Error looking up vendor: ${error.message}`)
  }

  // Test 2: Voting process with VotingService
  console.log('\n2️⃣ Testing VotingService.registerVote...')
  const voteData = {
    userFid: '12345',
    vendorId: testVendorId,
    voteType: 'regular' as const,
  }

  try {
    const voteResult = await VotingService.registerVote(voteData)
    
    if (voteResult.success) {
      console.log(`✅ Vote successful!`)
      console.log(`💰 Tokens earned: ${voteResult.tokensEarned}`)
      console.log(`📊 New balance: ${voteResult.newBalance}`)
      console.log(`🔥 Streak bonus: ${voteResult.streakBonus}`)
    } else {
      console.log(`❌ Vote failed: ${voteResult.error}`)
    }
  } catch (error) {
    console.log(`❌ Voting error: ${error.message}`)
  }

  // Test 3: Test vendor slug lookup
  console.log('\n3️⃣ Testing vendor slug lookup...')
  const testSlugs = ['pupusas-maria', 'tacos-el-rey', 'cafe-aroma']
  
  for (const slug of testSlugs) {
    try {
      const vendor = await VendorService.getVendor(slug)
      if (vendor) {
        console.log(`✅ Found vendor by slug "${slug}": ${vendor.name}`)
      } else {
        console.log(`❌ No vendor found for slug: "${slug}"`)
      }
    } catch (error) {
      console.log(`❌ Error looking up slug "${slug}": ${error.message}`)
    }
  }

  console.log('\n🎉 Voting service test completed!')
}

// Run the test
testVotingServiceFixed().catch(console.error) 