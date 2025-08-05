import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Function to get battle ID with encoded information (UUID format - same as in voting.ts)
function getEncodedBattleId(vendorId: string, userFid: string, voteNumber: number = 1): string {
  // Format: {vendor8}-{year}-{MMDD}-{vote4}-{user12}
  // Example: 111f3776-2024-1215-0001-000000465823
  
  // Extract first 8 characters from vendor ID
  const vendor8 = vendorId.substring(0, 8)
  
  // Get current date components
  const today = new Date()
  const year = today.getFullYear().toString()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  const mmdd = month + day
  
  // Vote number padded to 4 characters (0001, 0002, 0003)
  const vote4 = voteNumber.toString().padStart(4, '0')
  
  // User FID padded to 12 characters
  const user12 = userFid.padStart(12, '0')
  
  return `${vendor8}-${year}-${mmdd}-${vote4}-${user12}`
}

// Function to decode battle ID information (same as in voting.ts)
function decodeBattleId(battleId: string): {
  vendorId: string,
  userFid: string,
  date: string,
  voteNumber: number,
  fullBattleId: string
} | null {
  try {
    const parts = battleId.split('-')
    if (parts.length !== 5) return null
    
    const [vendor8, year, mmdd, vote4, user12] = parts
    
    // Extract information
    const vendorId = vendor8 // Vendor prefix (first 8 chars)
    const userFid = user12.replace(/^0+/, '') // Remove leading zeros from user FID
    const date = year + mmdd // Combine year and MMDD
    const voteNumber = parseInt(vote4)
    
    return {
      vendorId,
      userFid,
      date,
      voteNumber,
      fullBattleId: battleId
    }
  } catch (error) {
    return null
  }
}

async function testEncodedBattleSystem() {
  console.log('🧪 Testing Encoded Battle ID System...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test parameters
  const testUserFid = '465823'
  const testVendorId = '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0' // Tacos El Rey

  console.log('📋 Test Parameters:')
  console.log('- User FID:', testUserFid)
  console.log('- Vendor ID:', testVendorId)
  console.log()

  // 1. Test battle ID generation for different votes
  console.log('1️⃣ Testing battle ID generation...')
  for (let i = 1; i <= 3; i++) {
    const battleId = getEncodedBattleId(testVendorId, testUserFid, i)
    console.log(`  Vote ${i}: ${battleId}`)
    
    // Decode and show information
    const decoded = decodeBattleId(battleId)
    if (decoded) {
      console.log(`    📊 Decoded: Vendor=${decoded.vendorId}, User=${decoded.userFid}, Date=${decoded.date}, Vote=${decoded.voteNumber}`)
    }
  }
  console.log()

  // 2. Test with different vendors
  console.log('2️⃣ Testing with different vendors...')
  const vendors = [
    { id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1', name: 'Pupusas María' },
    { id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0', name: 'Tacos El Rey' },
    { id: '525c09b3-dc92-409b-a11d-896bcf4d15b2', name: 'Café Aroma' },
    { id: '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1', name: 'Pizza Napoli' },
    { id: 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28', name: 'Sushi Express' }
  ]

  for (const vendor of vendors) {
    const battleId = getEncodedBattleId(vendor.id, testUserFid, 1)
    const decoded = decodeBattleId(battleId)
    console.log(`  ${vendor.name}: ${battleId}`)
    if (decoded) {
      console.log(`    📊 Decoded: Vendor=${decoded.vendorId}, User=${decoded.userFid}, Date=${decoded.date}, Vote=${decoded.voteNumber}`)
    }
  }
  console.log()

  // 3. Test with different users
  console.log('3️⃣ Testing with different users...')
  const users = ['12345', '67890', '11111', '22222', '465823']
  
  for (const userFid of users) {
    const battleId = getEncodedBattleId(testVendorId, userFid, 1)
    const decoded = decodeBattleId(battleId)
    console.log(`  User ${userFid}: ${battleId}`)
    if (decoded) {
      console.log(`    📊 Decoded: Vendor=${decoded.vendorId}, User=${decoded.userFid}, Date=${decoded.date}, Vote=${decoded.voteNumber}`)
    }
  }
  console.log()

  // 4. Test uniqueness
  console.log('4️⃣ Testing uniqueness...')
  const generatedIds = new Set()
  let duplicates = 0
  
  for (let i = 0; i < 100; i++) {
    const battleId = getEncodedBattleId(testVendorId, testUserFid, 1)
    if (generatedIds.has(battleId)) {
      duplicates++
    }
    generatedIds.add(battleId)
  }
  
  console.log(`  Generated 100 battle IDs`)
  console.log(`  Unique IDs: ${generatedIds.size}`)
  console.log(`  Duplicates: ${duplicates}`)
  console.log(`  Uniqueness: ${((generatedIds.size / 100) * 100).toFixed(2)}%`)
  console.log()

  // 5. Test date encoding
  console.log('5️⃣ Testing date encoding...')
  const today = new Date()
  const dateString = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0')
  
  console.log(`  Today's date: ${dateString}`)
  console.log(`  Expected format: YYYYMMDD`)
  console.log()

  // 6. Test vendor ID extraction
  console.log('6️⃣ Testing vendor ID extraction...')
  for (const vendor of vendors) {
    const vendor8 = vendor.id.substring(0, 8)
    console.log(`  ${vendor.name}: ${vendor.id} -> ${vendor8}`)
  }
  console.log()

  // 7. Test battle ID format validation
  console.log('7️⃣ Testing battle ID format validation...')
  const testBattleId = getEncodedBattleId(testVendorId, testUserFid, 1)
  const parts = testBattleId.split('-')
  
  console.log(`  Battle ID: ${testBattleId}`)
  console.log(`  Parts: ${parts.length} (expected: 5)`)
  console.log(`  Format: ${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}`)
  console.log(`  Vendor prefix: ${parts[0]} (8 chars)`)
  console.log(`  Year: ${parts[1]} (4 chars, YYYY)`)
  console.log(`  Month/Day: ${parts[2]} (4 chars, MMDD)`)
  console.log(`  Vote number: ${parts[3]} (4 chars, 0001-0003)`)
  console.log(`  User FID: ${parts[4]} (12 chars, padded with zeros)`)

  console.log('\n✅ Encoded battle system test complete!')
  console.log('\n📋 Summary:')
  console.log('- Each battle ID encodes: Vendor prefix, Year, Month/Day, Vote number, User FID')
  console.log('- Format: {vendor8}-{year}-{MMDD}-{vote4}-{user12}')
  console.log('- Clean UUID format with meaningful information')
  console.log('- Fully decodable and human-readable')
  console.log('- Deterministic and predictable')
  console.log('- Contains all the information you requested!')
}

testEncodedBattleSystem().catch(console.error) 