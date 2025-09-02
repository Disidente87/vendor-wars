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
    const type = searchParams.get('type') || 'vendors' // vendors | users | zones
    const limit = parseInt(searchParams.get('limit') || '20')

    if (type === 'vendors') {
      // Votes received per vendor (aggregate client-side)
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vendor_id')
      if (error) throw error

      const countsMap: Record<string, number> = {}
      for (const v of votes || []) {
        const id = String(v.vendor_id)
        if (!id) continue
        countsMap[id] = (countsMap[id] || 0) + 1
      }

      const sorted = Object.entries(countsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)

      const vendorIds = sorted.map(([id]) => id)
      let vendorsById: Record<string, any> = {}
      if (vendorIds.length) {
        const { data: vendorsData, error: vErr } = await supabase
          .from('vendors')
          .select('id, name, image_url, zone_id, delegation, category')
          .in('id', vendorIds)
        if (vErr) throw vErr
        vendorsById = Object.fromEntries((vendorsData || []).map((v: any) => [v.id, v]))
      }

      const result = sorted.map(([vendorId, count], idx) => {
        const v = vendorsById[vendorId] || null
        return {
          id: vendorId,
          rank: idx + 1,
          name: v?.name || 'Unknown Vendor',
          avatar: v?.image_url || '',
          zoneId: v?.zone_id || null,
          votesReceived: count as number,
        }
      })

      return NextResponse.json({ success: true, data: result })
    }

    if (type === 'users') {
      // Votes given per user (aggregate client-side)
      const { data: votes, error } = await supabase
        .from('votes')
        .select('voter_fid')
      if (error) throw error

      const countsMap: Record<string, number> = {}
      for (const v of votes || []) {
        const fid = String(v.voter_fid)
        if (!fid) continue
        countsMap[fid] = (countsMap[fid] || 0) + 1
      }

      const sorted = Object.entries(countsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)

      const fids = sorted.map(([fid]) => fid)
      let usersByFid: Record<string, any> = {}
      if (fids.length) {
        const { data: users, error: uErr } = await supabase
          .from('users')
          .select('fid, username, display_name, avatar_url')
          .in('fid', fids)
        if (uErr) throw uErr
        usersByFid = Object.fromEntries((users || []).map((u: any) => [String(u.fid), u]))
      }

      const result = sorted.map(([fid, count], idx) => {
        const u = usersByFid[String(fid)] || null
        return {
          id: String(fid),
          rank: idx + 1,
          name: u?.display_name || u?.username || `FID ${fid}`,
          avatar: u?.avatar_url || '',
          votesGiven: count as number,
        }
      })

      return NextResponse.json({ success: true, data: result })
    }

    if (type === 'zones') {
      // Votes received per zone (aggregate client-side)
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vendor_id')
      if (error) throw error

      const vendorCountMap: Record<string, number> = {}
      for (const v of votes || []) {
        const id = String(v.vendor_id)
        if (!id) continue
        vendorCountMap[id] = (vendorCountMap[id] || 0) + 1
      }

      const vendorIds = Object.keys(vendorCountMap)
      let vendors: any[] = []
      if (vendorIds.length) {
        const { data: vendorsData, error: vErr } = await supabase
          .from('vendors')
          .select('id, zone_id, delegation, name, image_url')
          .in('id', vendorIds)
        if (vErr) throw vErr
        vendors = vendorsData || []
      }

      const zoneCounts: Record<string, number> = {}
      for (const v of vendors) {
        const zoneId = String(v.zone_id)
        const vendorVotes = vendorCountMap[v.id] || 0
        zoneCounts[zoneId] = (zoneCounts[zoneId] || 0) + vendorVotes
      }

      const zones = Object.entries(zoneCounts)
        .map(([zoneId, votes]) => ({ id: zoneId, votes }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, limit)
        .map((z, idx) => ({ id: z.id, rank: idx + 1, name: `Zone ${z.id}`, votesReceived: z.votes }))

      return NextResponse.json({ success: true, data: zones })
    }

    return NextResponse.json({ success: false, error: 'Invalid leaderboard type' }, { status: 400 })
  } catch (error: any) {
    console.error('❌ Leaderboard votes error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}


