import { NextRequest, NextResponse } from 'next/server'
import { DelegationService } from '@/services/delegations'

export async function POST(request: NextRequest) {
  try {
    const { delegationName } = await request.json()
    
    if (!delegationName) {
      return NextResponse.json(
        { success: false, error: 'Delegation name is required' },
        { status: 400 }
      )
    }
    
    const zoneId = await DelegationService.getZoneByDelegation(delegationName)
    
    if (!zoneId) {
      return NextResponse.json(
        { success: false, error: 'Zone not found for this delegation' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: { zoneId }
    })
  } catch (error) {
    console.error('Error getting zone by delegation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get zone by delegation' },
      { status: 500 }
    )
  }
}
