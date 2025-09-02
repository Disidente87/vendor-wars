import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from '@/services/vendors'

const _VendorService = VendorService

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const zone = searchParams.get('zone')
    const verified = searchParams.get('verified')

    console.log('🔍 API /vendors called with params:', { limit, offset, category, zone, verified })

    // Use direct Supabase query like the working test endpoint
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: vendors, error, count } = await supabase
      .from('vendors')
      .select(`
        *,
        zones!inner(name)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('📊 Direct Supabase response:', { vendorsCount: vendors?.length, count })

    // Map vendors using the same function
    const mappedVendors = vendors.map((vendor: any) => {
      return {
        id: vendor.id,
        name: vendor.name,
        description: vendor.description,
        imageUrl: vendor.image_url,
        category: vendor.category,
        subcategories: vendor.subcategories || [], // Include subcategories
        zone: vendor.zones?.name || vendor.zone_id || 'Unknown',
        zoneId: vendor.zone_id, // Add zone ID for filtering
        delegation: vendor.delegation, // Add delegation field
        isVerified: vendor.is_verified,
        stats: {
          totalVotes: vendor.total_votes || 0,
          verifiedVotes: vendor.verified_votes || 0,
          winRate: vendor.win_rate || 0,
          totalBattles: vendor.total_battles || 0,
        },
        createdAt: vendor.created_at,
      }
    })

    console.log('✅ Mapped vendors:', mappedVendors.length)

    return NextResponse.json({
      success: true,
      data: mappedVendors,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0)
      }
    })

  } catch (error) {
    console.error('❌ Error fetching vendors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, imageUrl, category, zone, ownerFid } = body

    // Validate required fields
    if (!name || !description || !category || !zone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create vendor
    const vendor = await VendorService.createVendor({
      name,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
      category,
      owner: {
        fid: parseInt(ownerFid) || 12345,
        username: '',
        displayName: '',
        pfpUrl: '',
        bio: '',
        followerCount: 0,
        followingCount: 0,
        verifiedAddresses: [],
        battleTokens: 0,
        credibilityScore: 0,
        verifiedPurchases: 0,
        credibilityTier: 'bronze',
        voteStreak: 0,
        weeklyVoteCount: 0,
        weeklyTerritoryBonus: 0
      }
    })

    return NextResponse.json({
      success: true,
      data: vendor,
      message: 'Vendor created successfully'
    })

  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
} 