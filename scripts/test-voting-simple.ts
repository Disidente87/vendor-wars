import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testVotingSimple() {
  console.log('🧪 Testing voting system (simple)...\n')

  try {
    // 1. Get a test vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(1)
      .single()

    if (vendorError) {
      console.error('❌ Error getting vendor:', vendorError)
      return
    }

    console.log(`✅ Using vendor: ${vendor.name} (${vendor.id})`)

    // 2. Test user FID
    const testUserFid = '12345'
    console.log(`✅ Using test user FID: ${testUserFid}`)

    // 3. Test the API endpoint directly
    console.log('\n📡 Testing API endpoint...')
    
    const response = await fetch('http://localhost:3000/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFid: testUserFid,
        vendorId: vendor.id,
        voteType: 'regular'
      }),
    })

    console.log(`📊 Response status: ${response.status}`)
    
    const responseText = await response.text()
    console.log(`📄 Response text: ${responseText.substring(0, 200)}...`)

    try {
      const result = JSON.parse(responseText)
      
      if (result.success) {
        console.log('🎉 SUCCESS: Vote registered successfully!')
        console.log(`  - Tokens earned: ${result.data.tokensEarned}`)
        console.log(`  - New balance: ${result.data.newBalance}`)
        console.log(`  - Streak bonus: ${result.data.streakBonus}`)
        console.log(`  - Territory bonus: ${result.data.territoryBonus}`)
      } else {
        console.error('❌ Vote registration failed:', result.error)
      }
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
    }

    console.log('\n✅ Test completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testVotingSimple() 