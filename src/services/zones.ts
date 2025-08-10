import type { BattleZone } from '@/types'
import { supabase } from '@/lib/supabase'

// Mock data for development when Supabase is not available
const MOCK_ZONES: BattleZone[] = [
  {
    id: '1',
    name: 'Zona Centro',
    description: 'Historic center of CDMX',
    color: '#FF6B6B',
    coordinates: [19.4326, -99.1332],
    currentOwner: undefined,
    heatLevel: 85,
    totalVotes: 1247,
    activeVendors: 12
  },
  {
    id: '2',
    name: 'Zona Norte',
    description: 'Northern neighborhoods',
    color: '#4ECDC4',
    coordinates: [19.4500, -99.1500],
    currentOwner: undefined,
    heatLevel: 72,
    totalVotes: 892,
    activeVendors: 8
  },
  {
    id: '3',
    name: 'Zona Sur',
    description: 'Southern districts',
    color: '#45B7D1',
    coordinates: [19.4000, -99.1200],
    currentOwner: undefined,
    heatLevel: 65,
    totalVotes: 634,
    activeVendors: 6
  },
  {
    id: '4',
    name: 'Zona Este',
    description: 'Eastern areas',
    color: '#96CEB4',
    coordinates: [19.4200, -99.1000],
    currentOwner: undefined,
    heatLevel: 58,
    totalVotes: 445,
    activeVendors: 5
  },
  {
    id: '5',
    name: 'Zona Oeste',
    description: 'Western neighborhoods',
    color: '#FFEAA7',
    coordinates: [19.4200, -99.1600],
    currentOwner: undefined,
    heatLevel: 78,
    totalVotes: 756,
    activeVendors: 7
  }
]

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
    try {
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
          // Fallback to mock data only if Supabase is not available
          console.warn('Zone not found in Supabase, using mock data:', id)
          return this.getMockZone(id)
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
          console.warn('Failed to fetch zone vendors:', vendorsError.message)
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
            isVerified: topVendor.is_verified,
            verificationProof: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }

        return battleZone
      }

      if (error) {
        // Fallback to mock data only if Supabase is not available
        console.warn('Error fetching zone from Supabase, using mock data:', error)
        return this.getMockZone(id)
      }

      return mapSupabaseZoneToZone(zone)
    } catch (error) {
      console.error('Error fetching zone from Supabase, falling back to mock data:', error)
      return this.getMockZone(id)
    }
  }

  // Fallback method to get mock zone data
  private static getMockZone(id: string): BattleZone | null {
    // Try to find by ID first (UUID)
    let zone = MOCK_ZONES.find(z => z.id === id)
    
    // If not found by ID, try to find by name/slug
    if (!zone) {
      const normalizedId = id.toLowerCase()
      if (normalizedId === 'centro' || normalizedId === 'zona-centro') {
        zone = MOCK_ZONES.find(z => z.name === 'Zona Centro')
      } else if (normalizedId === 'norte' || normalizedId === 'zona-norte') {
        zone = MOCK_ZONES.find(z => z.name === 'Zona Norte')
      } else if (normalizedId === 'sur' || normalizedId === 'zona-sur') {
        zone = MOCK_ZONES.find(z => z.name === 'Zona Sur')
      } else if (normalizedId === 'este' || normalizedId === 'zona-este') {
        zone = MOCK_ZONES.find(z => z.name === 'Zona Este')
      } else if (normalizedId === 'oeste' || normalizedId === 'zona-oeste') {
        zone = MOCK_ZONES.find(z => z.name === 'Zona Oeste')
      } else {
        // Try to find by any part of the name
        zone = MOCK_ZONES.find(z => 
          z.name.toLowerCase().includes(normalizedId) ||
          normalizedId.includes(z.name.toLowerCase())
        )
      }
    }
    
    return zone || null
  }

  static async getAllZones(): Promise<BattleZone[]> {
    try {
      const { data: zones, error } = await supabase
        .from('zones')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.warn('Error fetching zones from Supabase, using mock data:', error)
        return MOCK_ZONES
      }

      return zones.map(zone => mapSupabaseZoneToZone(zone))
    } catch (error) {
      console.error('Error fetching zones from Supabase, using mock data:', error)
      return MOCK_ZONES
    }
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