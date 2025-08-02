import { NextRequest, NextResponse } from 'next/server'
import { FarcasterService } from '@/services/farcaster'
import { z } from 'zod'

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
      user = await FarcasterService.getUserByFid(parseInt(fid))
    } else if (username) {
      user = await FarcasterService.getUserByUsername(username)
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