import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars')
  return createClient(url, serviceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    const userFid = searchParams.get('userFid')

    if (!userFid) {
      return NextResponse.json(
        { success: false, error: 'User FID is required' },
        { status: 400 }
      )
    }

    // Get all votes by this user
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        vendor_id,
        vendors!inner(
          id,
          zone_id,
          zones(
            id,
            name
          )
        )
      `)
      .eq('voter_fid', userFid)

    if (votesError) {
      console.error('Error fetching user votes:', votesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user votes' },
        { status: 500 }
      )
    }

    // Group votes by zone
    const zoneVotes: Record<string, { count: number; zoneName: string }> = {}
    
    for (const vote of votes || []) {
      const vendor = vote.vendors as any
      const zoneId = vendor?.zone_id
      const zoneName = vendor?.zones?.name || `Zone ${zoneId}`
      
      if (zoneId) {
        if (!zoneVotes[zoneId]) {
          zoneVotes[zoneId] = { count: 0, zoneName }
        }
        zoneVotes[zoneId].count += 1
      }
    }

    // Get total votes per zone to determine control
    const { data: allZoneVotes, error: allVotesError } = await supabase
      .from('votes')
      .select(`
        vendor_id,
        vendors!inner(
          zone_id
        )
      `)

    if (allVotesError) {
      console.error('Error fetching all zone votes:', allVotesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch zone votes' },
        { status: 500 }
      )
    }

    // Calculate total votes per zone
    const totalZoneVotes: Record<string, number> = {}
    for (const vote of allZoneVotes || []) {
      const vendor = vote.vendors as any
      const zoneId = vendor?.zone_id
      if (zoneId) {
        totalZoneVotes[zoneId] = (totalZoneVotes[zoneId] || 0) + 1
      }
    }

    // Determine controlled territories (user has >30% of votes in a zone)
    const controlledTerritories = Object.entries(zoneVotes)
      .filter(([zoneId, userVotes]) => {
        const totalVotes = totalZoneVotes[zoneId] || 0
        const percentage = totalVotes > 0 ? (userVotes.count / totalVotes) * 100 : 0
        return percentage > 30 // User controls zone if they have >30% of votes
      })
      .map(([zoneId, userVotes]) => ({
        zoneId,
        zoneName: userVotes.zoneName,
        userVotes: userVotes.count,
        totalVotes: totalZoneVotes[zoneId] || 0,
        percentage: totalZoneVotes[zoneId] > 0 ? 
          ((userVotes.count / totalZoneVotes[zoneId]) * 100).toFixed(1) : '0'
      }))

    return NextResponse.json({
      success: true,
      data: {
        controlledTerritories,
        count: controlledTerritories.length
      }
    })

  } catch (error: any) {
    console.error('Error calculating territories:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
