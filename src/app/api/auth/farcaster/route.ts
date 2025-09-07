import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { FarcasterService } from '@/services/farcaster'

// Use service role key for authentication checks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const authSchema = z.object({
  fid: z.number(),
  username: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = authSchema.parse(body)

    // Get user from Farcaster
    const user = await FarcasterService.getUserByFid(validatedData.fid)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // In a real implementation, you would:
    // 1. Validate the user's signature
    // 2. Create or update a session
    // 3. Return a JWT token or session cookie

    return NextResponse.json({
      success: true,
      data: {
        user,
        // token: 'jwt_token_here', // In real implementation
        // expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error authenticating user:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const username = searchParams.get('username')

    if (!fid && !username) {
      return NextResponse.json(
        { success: false, error: 'FID or username is required' },
        { status: 400 }
      )
    }

    let user = null

    if (fid) {
      // Check directly in our database
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('fid', parseInt(fid))
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      if (dbUser) {
        console.log('🔍 Database user found:', { fid: dbUser.fid, avatar_url: dbUser.avatar_url })
        
        // Handle avatar_url - could be a direct URL or JSON object
        let pfpUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        if (dbUser.avatar_url) {
          try {
            if (typeof dbUser.avatar_url === 'string') {
              // Check if it's a JSON string or a direct URL
              if (dbUser.avatar_url.startsWith('{') || dbUser.avatar_url.startsWith('[')) {
                // It's JSON, parse it
                const parsedAvatar = JSON.parse(dbUser.avatar_url)
                pfpUrl = parsedAvatar.url || pfpUrl
              } else {
                // It's a direct URL, use it as is
                pfpUrl = dbUser.avatar_url
              }
            } else if (typeof dbUser.avatar_url === 'object' && dbUser.avatar_url.url) {
              pfpUrl = dbUser.avatar_url.url
            }
            console.log('✅ Parsed pfpUrl:', pfpUrl)
          } catch (error) {
            console.warn('Failed to parse avatar_url:', error)
            // If parsing fails, try to use the raw value as URL
            if (typeof dbUser.avatar_url === 'string' && dbUser.avatar_url.startsWith('http')) {
              pfpUrl = dbUser.avatar_url
              console.log('✅ Using raw avatar_url as URL:', pfpUrl)
            }
          }
        } else {
          console.log('⚠️ No avatar_url in database, using default')
        }

        // Handle wallet address - could be array or string
        let walletAddress = ''
        if (dbUser.wallet_address) {
          if (Array.isArray(dbUser.wallet_address) && dbUser.wallet_address.length > 0) {
            walletAddress = dbUser.wallet_address[0]
          } else if (typeof dbUser.wallet_address === 'string') {
            walletAddress = dbUser.wallet_address
          }
        }

        // Map database user to our User type
        user = {
          fid: dbUser.fid,
          username: dbUser.username,
          displayName: dbUser.display_name,
          pfpUrl: pfpUrl,
          followerCount: 0, // Not stored in simplified schema
          followingCount: 0, // Not stored in simplified schema
          bio: 'Vendor Wars enthusiast', // Default value
          verifiedAddresses: [], // Not stored in simplified schema
          battleTokens: dbUser.battle_tokens || 0,
          credibilityScore: 50, // Default value
          verifiedPurchases: 0, // Default value
          credibilityTier: 'bronze' as const, // Default value
          voteStreak: dbUser.vote_streak || 0,
          weeklyVoteCount: 0, // Default value
          weeklyTerritoryBonus: 0, // Default value
          walletAddress: walletAddress, // Add wallet address
        }
      }
    } else if (username) {
      // Check by username
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !dbUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

        // Parse avatar_url if it's a JSON string
        let pfpUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        if (dbUser.avatar_url) {
          try {
            if (typeof dbUser.avatar_url === 'string') {
              const parsedAvatar = JSON.parse(dbUser.avatar_url)
              pfpUrl = parsedAvatar.url || pfpUrl
            } else if (typeof dbUser.avatar_url === 'object' && dbUser.avatar_url.url) {
              pfpUrl = dbUser.avatar_url.url
            }
          } catch (error) {
            console.warn('Failed to parse avatar_url:', error)
          }
        }

        // Handle wallet address - could be array or string
        let walletAddress = ''
        if (dbUser.wallet_address) {
          if (Array.isArray(dbUser.wallet_address) && dbUser.wallet_address.length > 0) {
            walletAddress = dbUser.wallet_address[0]
          } else if (typeof dbUser.wallet_address === 'string') {
            walletAddress = dbUser.wallet_address
          }
        }

        // Map database user to our User type
        user = {
          fid: dbUser.fid,
          username: dbUser.username,
          displayName: dbUser.display_name,
          pfpUrl: pfpUrl,
          followerCount: 0,
          followingCount: 0,
          bio: 'Vendor Wars enthusiast',
          verifiedAddresses: [],
          battleTokens: dbUser.battle_tokens || 0,
          credibilityScore: 50,
          verifiedPurchases: 0,
          credibilityTier: 'bronze' as const,
          voteStreak: dbUser.vote_streak || 0,
          weeklyVoteCount: 0,
          weeklyTerritoryBonus: 0,
          walletAddress: walletAddress, // Add wallet address
        }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
} 