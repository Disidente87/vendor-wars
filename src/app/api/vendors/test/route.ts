import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing direct Supabase query in API...')
    
    const { data: vendors, error, count } = await supabase
      .from('vendors')
      .select(`
        *,
        zones!inner(name)
      `, { count: 'exact' })
      .range(0, 49)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${vendors?.length || 0} vendors in API`)

    return NextResponse.json({
      success: true,
      data: vendors,
      total: count,
      message: `Found ${vendors?.length || 0} vendors`
    })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
} 