import { NextRequest, NextResponse } from 'next/server'
import { ZoneService } from '@/services/zones'
import { getZoneIdFromSlug } from '@/lib/route-utils'

export async function GET(
  request: NextRequest
) {
  const id = request.nextUrl.pathname.split('/').pop()
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Zone ID is required' },
      { status: 400 }
    )
  }

  try {
    // Try to get zone ID from slug first
    const actualZoneId = getZoneIdFromSlug(id) || id
    const zone = await ZoneService.getZone(actualZoneId)
    
    if (!zone) {
      return NextResponse.json(
        { success: false, error: 'Zone not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: zone })
  } catch (error) {
    console.error('Error fetching zone:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch zone' },
      { status: 500 }
    )
  }
} 