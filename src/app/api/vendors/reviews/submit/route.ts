import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPaymentOnBlockchain } from '@/services/blockchain'

const PAYMENT_CONFIG = {
  BATTLE_TOKEN: {
    REQUIRED_AMOUNT: 15, // 15 $BATTLE tokens for reviews
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendorId, content, userAddress, paymentAmount, reviewData } = body

    // Validate required fields
    if (!vendorId || !content || !userAddress || !paymentAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate payment amount (should be 15 $BATTLE tokens)
    const expectedAmount = PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT.toString()
    if (paymentAmount !== expectedAmount) {
      return NextResponse.json(
        { success: false, error: `Invalid payment amount. Expected ${expectedAmount} $BATTLE tokens, got ${paymentAmount}` },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Review must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'Review must be less than 500 characters' },
        { status: 400 }
      )
    }

    // Get user from Farcaster auth
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile from database
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('fid, username, display_name, avatar_url')
      .eq('fid', user.user_metadata?.fid)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 400 }
      )
    }

    // Type assertion to help TypeScript understand the structure
    const userProfileData = userProfile as {
      fid: number
      username: string
      display_name: string
      avatar_url: string
    }

    // Verify payment on blockchain
    const paymentVerification = await verifyPaymentOnBlockchain(userAddress, vendorId)
    if (!paymentVerification.success) {
      return NextResponse.json(
        { success: false, error: `Payment verification failed: ${paymentVerification.error}` },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this vendor
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { data: existingReview, error: existingReviewError } = await supabaseAdmin
      .from('vendor_reviews')
      .select('id')
      .eq('vendor_id', vendorId)
      .eq('user_fid', userProfileData.fid)
      .single()

    if (existingReview && !existingReviewError) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this vendor' },
        { status: 400 }
      )
    }

    // Create review record
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('vendor_reviews')
      .insert({
        vendor_id: vendorId,
        user_fid: userProfileData.fid,
        content: content.trim(),
        tokens_paid: parseInt(paymentAmount),
        payment_transaction_hash: paymentVerification.transactionHash,
        review_data: reviewData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json(
        { success: false, error: 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        message: 'Review submitted successfully'
      }
    })

  } catch (error) {
    console.error('Error in review submission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
