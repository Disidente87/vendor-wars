import type { BattleZone } from '@/types'
import { supabase } from '@/lib/supabase'

// Helper function to convert Supabase zone to app zone
function mapSupabaseZoneToZone(supabaseZone: any): BattleZone {
  return {
    id: supabaseZone.id,
    name: supabaseZone.name,
    description: supabaseZone.description,
    color: supabaseZone.color,
    coordinates: supabaseZone.coordinates,
    currentOwner: undefined, // Will be fetched separately if needed
    heatLevel: supabaseZone.heat_level,
    totalVotes: supabaseZone.total_votes,
    activeVendors: supabaseZone.active_vendors,
  }
}

// Helper function to convert app zone to Supabase zone
function mapZoneToSupabase(zone: Partial<BattleZone>): any {
  return {
    id: zone.id,
    name: zone.name,
    description: zone.description,
    color: zone.color,
    coordinates: zone.coordinates,
    current_owner_id: zone.currentOwner?.id,
    heat_level: zone.heatLevel,
    total_votes: zone.totalVotes,
    active_vendors: zone.activeVendors,
  }
}

export class ZoneService {
  static async getZone(id: string): Promise<BattleZone | null> {
    const { data: zone, error } = await supabase
      .from('zones')
      .select(`
        *,
        vendors!zones_current_owner_id_fkey (
          id,
          name,
          description,
          image_url,
          category,
          zone,
          coordinates,
          owner_fid,
          is_verified,
          total_battles,
          wins,
          losses,
          win_rate,
          total_revenue,
          average_rating,
          review_count,
          territory_defenses,
          territory_conquests,
          current_zone_rank,
          total_votes,
          verified_votes
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Zone not found
      }
      throw new Error(`Failed to fetch zone: ${error.message}`)
    }

    const battleZone = mapSupabaseZoneToZone(zone)
    
    // Map current owner if exists
    if (zone.vendors) {
      battleZone.currentOwner = {
        id: zone.vendors.id,
        name: zone.vendors.name,
        description: zone.vendors.description,
        imageUrl: zone.vendors.image_url,
        category: zone.vendors.category,
        zone: zone.vendors.zone,
        coordinates: zone.vendors.coordinates,
        owner: { fid: zone.vendors.owner_fid } as any, // Simplified owner
        isVerified: zone.vendors.is_verified,
        verificationProof: [],
        stats: {
          totalBattles: zone.vendors.total_battles,
          wins: zone.vendors.wins,
          losses: zone.vendors.losses,
          winRate: zone.vendors.win_rate,
          totalRevenue: zone.vendors.total_revenue,
          averageRating: zone.vendors.average_rating,
          reviewCount: zone.vendors.review_count,
          territoryDefenses: zone.vendors.territory_defenses,
          territoryConquests: zone.vendors.territory_conquests,
          currentZoneRank: zone.vendors.current_zone_rank,
          totalVotes: zone.vendors.total_votes,
          verifiedVotes: zone.vendors.verified_votes,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return battleZone
  }

  static async getAllZones(): Promise<BattleZone[]> {
    const { data: zones, error } = await supabase
      .from('zones')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch zones: ${error.message}`)
    }

    return zones.map(zone => mapSupabaseZoneToZone(zone))
  }

  static async createZone(zoneData: Omit<BattleZone, 'id'>): Promise<BattleZone> {
    const { data: zone, error } = await supabase
      .from('zones')
      .insert(mapZoneToSupabase(zoneData))
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create zone: ${error.message}`)
    }

    return mapSupabaseZoneToZone(zone)
  }

  static async updateZone(id: string, updates: Partial<BattleZone>): Promise<BattleZone | null> {
    const updateData = mapZoneToSupabase(updates)
    delete updateData.id // Don't update the primary key

    const { data: zone, error } = await supabase
      .from('zones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Zone not found
      }
      throw new Error(`Failed to update zone: ${error.message}`)
    }

    return mapSupabaseZoneToZone(zone)
  }

  static async updateZoneStats(id: string, stats: Partial<Pick<BattleZone, 'heatLevel' | 'totalVotes' | 'activeVendors'>>): Promise<BattleZone | null> {
    const updateData: any = {}
    
    if (stats.heatLevel !== undefined) updateData.heat_level = stats.heatLevel
    if (stats.totalVotes !== undefined) updateData.total_votes = stats.totalVotes
    if (stats.activeVendors !== undefined) updateData.active_vendors = stats.activeVendors

    const { data: zone, error } = await supabase
      .from('zones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Zone not found
      }
      throw new Error(`Failed to update zone stats: ${error.message}`)
    }

    return mapSupabaseZoneToZone(zone)
  }

  static async setZoneOwner(zoneId: string, vendorId: string | null): Promise<BattleZone | null> {
    const { data: zone, error } = await supabase
      .from('zones')
      .update({ current_owner_id: vendorId })
      .eq('id', zoneId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Zone not found
      }
      throw new Error(`Failed to set zone owner: ${error.message}`)
    }

    return mapSupabaseZoneToZone(zone)
  }

  static async getZoneCount(): Promise<number> {
    const { count, error } = await supabase
      .from('zones')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to get zone count: ${error.message}`)
    }

    return count || 0
  }

  static async getTopZones(limit: number = 5): Promise<BattleZone[]> {
    const { data: zones, error } = await supabase
      .from('zones')
      .select('*')
      .order('total_votes', { ascending: false })
      .order('heat_level', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch top zones: ${error.message}`)
    }

    return zones.map(zone => mapSupabaseZoneToZone(zone))
  }
} 