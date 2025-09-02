import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: NextRequest) {
  try {
    const { fid, pfpUrl } = await request.json()

    if (!fid || !pfpUrl) {
      return NextResponse.json(
        { success: false, error: 'FID and pfpUrl are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Update the user's profile image in the database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        avatar_url: { url: pfpUrl },
        updated_at: new Date().toISOString()
      })
      .eq('fid', fid)
      .select()

    if (error) {
      console.error('Error updating profile image:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update profile image' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ Profile image updated successfully for user:', fid)

    return NextResponse.json({
      success: true,
      data: {
        fid: data[0].fid,
        avatar_url: data[0].avatar_url,
        updated_at: data[0].updated_at
      }
    })

  } catch (error) {
    console.error('Error in profile image update:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
