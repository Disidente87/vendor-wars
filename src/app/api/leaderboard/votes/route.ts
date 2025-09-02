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
      // Votes received per vendor
      const { data: counts, error } = await supabase
        .from('votes')
        .select('vendor_id, count:vendor_id.count()', { count: 'exact', head: false })
        .group('vendor_id')
        .order('count', { ascending: false })
        .limit(limit)

      if (error) throw error

      const vendorIds = (counts || []).map((c: any) => c.vendor_id).filter(Boolean)
      let vendorsById: Record<string, any> = {}
      if (vendorIds.length) {
        const { data: vendorsData, error: vErr } = await supabase
          .from('vendors')
          .select('id, name, image_url, zone_id, delegation, category')
          .in('id', vendorIds)
        if (vErr) throw vErr
        vendorsById = Object.fromEntries((vendorsData || []).map((v: any) => [v.id, v]))
      }

      const result = (counts || []).map((c: any, idx: number) => {
        const v = vendorsById[c.vendor_id] || null
        return {
          id: c.vendor_id,
          rank: idx + 1,
          name: v?.name || 'Unknown Vendor',
          avatar: v?.image_url || '',
          zoneId: v?.zone_id || null,
          votesReceived: c.count as number,
        }
      })

      return NextResponse.json({ success: true, data: result })
    }

    if (type === 'users') {
      // Votes given per user (voter_fid)
      const { data: counts, error } = await supabase
        .from('votes')
        .select('voter_fid, count:voter_fid.count()', { count: 'exact', head: false })
        .group('voter_fid')
        .order('count', { ascending: false })
        .limit(limit)
      if (error) throw error

      const fids = (counts || []).map((c: any) => c.voter_fid)
      let usersByFid: Record<string, any> = {}
      if (fids.length) {
        const { data: users, error: uErr } = await supabase
          .from('users')
          .select('fid, username, display_name, avatar_url')
          .in('fid', fids)
        if (uErr) throw uErr
        usersByFid = Object.fromEntries((users || []).map((u: any) => [String(u.fid), u]))
      }

      const result = (counts || []).map((c: any, idx: number) => {
        const u = usersByFid[String(c.voter_fid)] || null
        return {
          id: String(c.voter_fid),
          rank: idx + 1,
          name: u?.display_name || u?.username || `FID ${c.voter_fid}`,
          avatar: u?.avatar_url || '',
          votesGiven: c.count as number,
        }
      })

      return NextResponse.json({ success: true, data: result })
    }

    if (type === 'zones') {
      // Votes received per zone (aggregate vendor votes by zone)
      // First get counts per vendor
      const { data: counts, error } = await supabase
        .from('votes')
        .select('vendor_id, count:vendor_id.count()', { count: 'exact', head: false })
        .group('vendor_id')
      if (error) throw error

      const vendorIds = (counts || []).map((c: any) => c.vendor_id).filter(Boolean)
      let vendors: any[] = []
      if (vendorIds.length) {
        const { data: vendorsData, error: vErr } = await supabase
          .from('vendors')
          .select('id, zone_id, delegation, name, image_url')
          .in('id', vendorIds)
        if (vErr) throw vErr
        vendors = vendorsData || []
      }

      const voteByVendor: Record<string, number> = Object.fromEntries(
        (counts || []).map((c: any) => [c.vendor_id, c.count as number])
      )

      const zoneCounts: Record<string, { zoneId: string; votes: number }> = {}
      for (const v of vendors) {
        const zoneId = String(v.zone_id)
        if (!zoneCounts[zoneId]) zoneCounts[zoneId] = { zoneId, votes: 0 }
        zoneCounts[zoneId].votes += voteByVendor[v.id] || 0
      }

      // Map zone names by a helper RPC or a static mapping if present
      const zones = Object.values(zoneCounts)
        .sort((a, b) => b.votes - a.votes)
        .slice(0, limit)
        .map((z, idx) => ({ id: z.zoneId, rank: idx + 1, name: `Zone ${z.zoneId}`, votesReceived: z.votes }))

      return NextResponse.json({ success: true, data: zones })
    }

    return NextResponse.json({ success: false, error: 'Invalid leaderboard type' }, { status: 400 })
  } catch (error: any) {
    console.error('❌ Leaderboard votes error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}


