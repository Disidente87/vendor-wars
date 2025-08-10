import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: zones, error } = await supabase
      .from('zones')
      .select('id, name, description, color, heat_level, total_votes, active_vendors')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching zones:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch zones' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: zones || []
    })

  } catch (error) {
    console.error('Zones API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch zones' },
      { status: 500 }
    )
  }
}
