import { NextResponse } from 'next/server'
import { DelegationService } from '@/services/delegations'

export async function GET() {
  try {
    const delegations = await DelegationService.getAllDelegations()
    
    return NextResponse.json({
      success: true,
      data: delegations
    })
  } catch (error) {
    console.error('Error fetching delegations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delegations' },
      { status: 500 }
    )
  }
}
