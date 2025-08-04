# Farcaster Integration Setup Guide

This guide will help you set up Vendor Wars to work with your real Farcaster account.

## 🚀 Quick Start

### 1. Get a Neynar API Key

1. Go to [Neynar.com](https://neynar.com/)
2. Sign up for a free account
3. Navigate to the API section
4. Generate a new API key
5. Copy the API key

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Neynar API Configuration
NEYNAR_API_KEY=your_actual_neynar_api_key_here

# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://pncwlterhkclvpgcbuce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuY3dsdGVyaGtjdmZwZ2NidWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# Optional: Redis for rate limiting (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

### 3. Check Your Setup

Run the setup checker to verify everything is configured correctly:

```bash
npm run check:farcaster-setup
```

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy

### 5. Test in Farcaster

1. Open Farcaster app
2. Navigate to Mini Apps
3. Find Vendor Wars
4. The app will automatically detect your Farcaster account

## 🔧 How It Works

### Authentication Flow

1. **Automatic Detection**: When you open the Mini App, it automatically detects your Farcaster account
2. **User Profile**: Fetches your profile data from Neynar API
3. **Token Balance**: Tracks your $BATTLE tokens in the database
4. **Voting**: Records your votes with your real FID

### Voting System

- **No Restrictions**: Currently configured for unlimited voting (testing mode)
- **Real FID**: All votes are recorded with your actual Farcaster FID
- **Token Rewards**: Earn $BATTLE tokens for each vote
- **Verified Votes**: Earn 3x tokens for verified purchases

## 🧪 Testing

### Local Development

```bash
# Start the development server
npm run dev

# Check Farcaster setup
npm run check:farcaster-setup

# Test unlimited voting
npm run test:unlimited-voting

# Verify vote counting
npm run verify:vote-counting

# Clear test data
npm run clear:test-votes
```

### Production Testing

1. Deploy to Vercel
2. Open the Mini App in Farcaster
3. Your account will be automatically detected
4. Test voting functionality
5. Check that votes are recorded with your FID

## 📊 Monitoring

### Check Your Votes

```bash
# Verify vote counting and see your stats
npm run verify:vote-counting
```

### Database Queries

You can also check your votes directly in Supabase:

```sql
-- Check your votes
SELECT * FROM votes WHERE voter_fid = YOUR_FID;

-- Check your token balance
SELECT * FROM users WHERE fid = YOUR_FID;
```

## 🔒 Security

- **No Private Keys**: The app never handles your private keys
- **Read-Only Access**: Only reads your public Farcaster data
- **Secure API**: Uses Neynar's secure API for user data
- **Rate Limiting**: Redis-based rate limiting (optional)

## 🐛 Troubleshooting

### Common Issues

1. **"Mini App SDK not loaded"**
   - Make sure you're testing in the Farcaster app
   - Check that the Mini App is properly deployed

2. **"Neynar API error"**
   - Verify your API key is correct
   - Check that you have sufficient API credits

3. **"User not found"**
   - The app will create a new user profile automatically
   - Check the database for your user record

4. **"Vote failed"**
   - Check the server logs for detailed error messages
   - Verify the database connection

### Debug Commands

```bash
# Check all configuration
npm run check:farcaster-setup

# Test API connections
npm run test:unlimited-voting

# Verify database state
npm run verify:vote-counting
```

## 📈 Next Steps

1. **Enable Rate Limiting**: Set up Upstash Redis for production
2. **Add Photo Verification**: Implement photo upload for verified votes
3. **Territory System**: Implement zone-based voting
4. **Token Economics**: Add token burning and utility features
5. **Social Features**: Add sharing and leaderboards

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Run the setup checker: `npm run check:farcaster-setup`
3. Check the server logs for error messages
4. Verify your environment variables are set correctly

---

**Happy voting! 🗳️⚔️** 