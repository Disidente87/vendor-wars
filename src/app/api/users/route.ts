import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Use service role key for user creation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const userSchema = z.object({
  fid: z.number(),
  username: z.string(),
  displayName: z.string(),
  pfpUrl: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('fid', validatedData.fid)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to check existing user' },
        { status: 500 }
      )
    }

    if (existingUser) {
      // User exists, return existing data
      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User already exists'
      })
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        fid: validatedData.fid,
        username: validatedData.username,
        display_name: validatedData.displayName,
        avatar_url: { url: validatedData.pfpUrl },
        battle_tokens: 0,
        vote_streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in user creation:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json(
        { success: false, error: 'FID parameter is required' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('fid', parseInt(fid))
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Error in user retrieval:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 