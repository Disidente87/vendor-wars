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
    // First try to find by UUID
    const { data: zone, error } = await supabase
      .from('zones')
      .select('*')
      .eq('id', id)
      .single()

    // If not found by UUID, try to find by name
    if (error && error.code === 'PGRST116') {
      const { data: zoneByName, error: nameError } = await supabase
        .from('zones')
        .select('*')
        .eq('name', id)
        .single()
      
      if (nameError) {
        return null // Zone not found
      }
      
      // Get vendors for this zone
      const { data: zoneVendors, error: vendorsError } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          description,
          image_url,
          category,
          zone_id,
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
        `)
        .eq('zone_id', zoneByName.id)

      if (vendorsError) {
        throw new Error(`Failed to fetch zone vendors: ${vendorsError.message}`)
      }

      const battleZone = mapSupabaseZoneToZone(zoneByName)
      
      // Set current owner as the top vendor in the zone
      if (zoneVendors && zoneVendors.length > 0) {
        const topVendor = zoneVendors[0] // Assuming they're ordered by rank
        battleZone.currentOwner = {
          id: topVendor.id,
          name: topVendor.name,
          description: topVendor.description,
          imageUrl: topVendor.image_url,
          category: topVendor.category,
          zone: topVendor.zone_id,
          coordinates: topVendor.coordinates,
          owner: { fid: topVendor.owner_fid } as any, // Simplified owner
          isVerified: topVendor.is_verified,
          verificationProof: [],
          stats: {
            totalBattles: topVendor.total_battles,
            wins: topVendor.wins,
            losses: topVendor.losses,
            winRate: topVendor.win_rate,
            totalRevenue: topVendor.total_revenue,
            averageRating: topVendor.average_rating,
            reviewCount: topVendor.review_count,
            territoryDefenses: topVendor.territory_defenses,
            territoryConquests: topVendor.territory_conquests,
            currentZoneRank: topVendor.current_zone_rank,
            totalVotes: topVendor.total_votes,
            verifiedVotes: topVendor.verified_votes,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      return battleZone
    } else if (error) {
      throw new Error(`Failed to fetch zone: ${error.message}`)
    }

    // Get vendors for this zone
    const { data: zoneVendors, error: vendorsError } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        description,
        image_url,
        category,
        zone_id,
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
      `)
      .eq('zone_id', zone.id)

    if (vendorsError) {
      throw new Error(`Failed to fetch zone vendors: ${vendorsError.message}`)
    }

    const battleZone = mapSupabaseZoneToZone(zone)
    
    // Set current owner as the top vendor in the zone
    if (zoneVendors && zoneVendors.length > 0) {
      const topVendor = zoneVendors[0] // Assuming they're ordered by rank
      battleZone.currentOwner = {
        id: topVendor.id,
        name: topVendor.name,
        description: topVendor.description,
        imageUrl: topVendor.image_url,
        category: topVendor.category,
        zone: topVendor.zone_id,
        coordinates: topVendor.coordinates,
        owner: { fid: topVendor.owner_fid } as any, // Simplified owner
        isVerified: topVendor.is_verified,
        verificationProof: [],
        stats: {
          totalBattles: topVendor.total_battles,
          wins: topVendor.wins,
          losses: topVendor.losses,
          winRate: topVendor.win_rate,
          totalRevenue: topVendor.total_revenue,
          averageRating: topVendor.average_rating,
          reviewCount: topVendor.review_count,
          territoryDefenses: topVendor.territory_defenses,
          territoryConquests: topVendor.territory_conquests,
          currentZoneRank: topVendor.current_zone_rank,
          totalVotes: topVendor.total_votes,
          verifiedVotes: topVendor.verified_votes,
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