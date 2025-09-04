import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    // Get reviews for the vendor with user data via JOIN
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('vendor_reviews')
      .select(`
        id,
        user_fid,
        content,
        tokens_paid,
        created_at,
        users!inner(
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    // Transform reviews to match the expected format
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      userId: review.user_fid,
      username: review.users?.username || 'Unknown',
      displayName: review.users?.display_name || review.users?.username || 'Unknown',
      avatar: review.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown',
      content: review.content,
      tokensPaid: review.tokens_paid,
      createdAt: review.created_at
    }))

    return NextResponse.json({
      success: true,
      data: transformedReviews
    })

  } catch (error) {
    console.error('Error in reviews fetch:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
