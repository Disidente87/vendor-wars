import { FARCASTER_CONFIG } from '../src/config/farcaster'

async function checkFarcasterSetup() {
  console.log('🔍 Checking Farcaster integration setup...')

  // Check configuration
  console.log('\n📋 Configuration Check:')
  console.log('=======================')
  console.log(`Neynar API Key: ${FARCASTER_CONFIG.NEYNAR_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`Neynar Base URL: ${FARCASTER_CONFIG.NEYNAR_BASE_URL}`)
  console.log(`Hub URL: ${FARCASTER_CONFIG.HUB_URL}`)
  console.log(`App Name: ${FARCASTER_CONFIG.APP_NAME}`)

  // Check environment variables
  console.log('\n🌍 Environment Variables:')
  console.log('=========================')
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`NEYNAR_API_KEY: ${process.env.NEYNAR_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`UPSTASH_REDIS_REST_URL: ${process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`UPSTASH_REDIS_REST_TOKEN: ${process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ Missing'}`)

  // Test Neynar API if key is available
  if (FARCASTER_CONFIG.NEYNAR_API_KEY && FARCASTER_CONFIG.NEYNAR_API_KEY !== 'your_neynar_api_key_here') {
    console.log('\n🧪 Testing Neynar API:')
    console.log('=====================')
    
    try {
      const response = await fetch(`${FARCASTER_CONFIG.NEYNAR_BASE_URL}/farcaster/user/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': FARCASTER_CONFIG.NEYNAR_API_KEY,
        },
        body: JSON.stringify({
          fids: [1] // Test with FID 1 (vbuterin)
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Neynar API connection successful')
        if (data.users && data.users.length > 0) {
          console.log(`✅ Retrieved user: ${data.users[0].displayName} (@${data.users[0].username})`)
        }
      } else {
        console.log(`❌ Neynar API error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ Neynar API connection failed: ${error}`)
    }
  } else {
    console.log('\n⚠️  Neynar API Key not configured - skipping API test')
  }

  // Check voting restrictions
  console.log('\n🗳️ Voting Configuration:')
  console.log('========================')
  console.log(`Vote Cooldown: ${FARCASTER_CONFIG.FEATURES.VOTE_COOLDOWN_MINUTES} minutes`)
  console.log(`Weekly Vote Cap: ${FARCASTER_CONFIG.FEATURES.WEEKLY_VOTE_CAP} votes`)
  console.log(`Weekly Territory Cap: ${FARCASTER_CONFIG.FEATURES.WEEKLY_TERRITORY_CAP} tokens`)
  console.log(`Base Vote Tokens: ${FARCASTER_CONFIG.FEATURES.BASE_VOTE_TOKENS} tokens`)
  console.log(`Verified Vote Multiplier: ${FARCASTER_CONFIG.FEATURES.VERIFIED_VOTE_MULTIPLIER}x`)

  // Instructions
  console.log('\n📝 Setup Instructions:')
  console.log('=====================')
  console.log('1. Get a Neynar API key from: https://neynar.com/')
  console.log('2. Add it to your .env.local file:')
  console.log('   NEYNAR_API_KEY=your_actual_api_key_here')
  console.log('3. Set up Upstash Redis for rate limiting:')
  console.log('   UPSTASH_REDIS_REST_URL=your_redis_url')
  console.log('   UPSTASH_REDIS_REST_TOKEN=your_redis_token')
  console.log('4. Deploy to Vercel or similar platform')
  console.log('5. Test the Mini App in Farcaster')

  console.log('\n🎉 Setup check completed!')
}

// Run check if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkFarcasterSetup()
}

export { checkFarcasterSetup } 