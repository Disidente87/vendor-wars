import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testAuthEndpoint() {
  console.log('🧪 Testing auth endpoint...')
  
  try {
    // Import the auth function directly
    const { GET } = await import('../src/app/api/auth/farcaster/route')
    
    // Create a mock request
    const url = new URL('http://localhost:3000/api/auth/farcaster?fid=497866')
    const request = new Request(url.toString())
    
    console.log('📡 Calling auth endpoint for user 497866...')
    
    // Call the GET function
    const response = await GET(request)
    const data = await response.json()
    
    console.log('📊 Response:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.success && data.data) {
      console.log('')
      console.log('✅ Auth successful!')
      console.log(`Username: ${data.data.username}`)
      console.log(`Display Name: ${data.data.displayName}`)
      console.log(`Avatar URL: ${data.data.pfpUrl}`)
      console.log(`Battle Tokens: ${data.data.battleTokens}`)
      console.log(`Vote Streak: ${data.data.voteStreak}`)
    } else {
      console.log('❌ Auth failed:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error testing auth endpoint:', error)
  }
}

testAuthEndpoint()
