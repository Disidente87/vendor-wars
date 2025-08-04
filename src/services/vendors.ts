import type { Vendor, User, PaginationParams, PaginatedResponse } from '@/types'
import { VendorCategory } from '@/types'
import { supabase } from '@/lib/supabase'
import { generateVendorId, calculateWinRate } from '@/lib/utils'

// Helper function to convert Supabase vendor to app vendor
function mapSupabaseVendorToVendor(supabaseVendor: any, owner?: any): Vendor {
  return {
    id: supabaseVendor.id,
    name: supabaseVendor.name,
    description: supabaseVendor.description,
    imageUrl: supabaseVendor.image_url,
    category: supabaseVendor.category as VendorCategory,
    zone: supabaseVendor.zone,
    coordinates: supabaseVendor.coordinates,
    owner: owner || {
      fid: supabaseVendor.owner_fid,
      username: '',
      displayName: '',
      pfpUrl: '',
      bio: '',
      followerCount: 0,
      followingCount: 0,
      verifiedAddresses: [],
      battleTokens: 0,
      credibilityScore: 0,
      verifiedPurchases: 0,
      credibilityTier: 'bronze',
      voteStreak: 0,
      weeklyVoteCount: 0,
      weeklyTerritoryBonus: 0
    },
    isVerified: supabaseVendor.is_verified,
    verificationProof: [], // Will be fetched separately if needed
    stats: {
      totalBattles: supabaseVendor.total_battles,
      wins: supabaseVendor.wins,
      losses: supabaseVendor.losses,
      winRate: supabaseVendor.win_rate,
      totalRevenue: supabaseVendor.total_revenue,
      averageRating: supabaseVendor.average_rating,
      reviewCount: supabaseVendor.review_count,
      territoryDefenses: supabaseVendor.territory_defenses,
      territoryConquests: supabaseVendor.territory_conquests,
      currentZoneRank: supabaseVendor.current_zone_rank,
      totalVotes: supabaseVendor.total_votes,
      verifiedVotes: supabaseVendor.verified_votes,
    },
    createdAt: new Date(supabaseVendor.created_at),
    updatedAt: new Date(supabaseVendor.updated_at),
  }
}

// Helper function to convert app vendor to Supabase vendor
function mapVendorToSupabase(vendor: Partial<Vendor>): any {
  return {
    name: vendor.name,
    description: vendor.description,
    image_url: vendor.imageUrl,
    category: vendor.category,
    zone: vendor.zone,
    coordinates: vendor.coordinates,
    owner_fid: vendor.owner?.fid,
    is_verified: vendor.isVerified,
    total_battles: vendor.stats?.totalBattles,
    wins: vendor.stats?.wins,
    losses: vendor.stats?.losses,
    win_rate: vendor.stats?.winRate,
    total_revenue: vendor.stats?.totalRevenue,
    average_rating: vendor.stats?.averageRating,
    review_count: vendor.stats?.reviewCount,
    territory_defenses: vendor.stats?.territoryDefenses,
    territory_conquests: vendor.stats?.territoryConquests,
    current_zone_rank: vendor.stats?.currentZoneRank,
    total_votes: vendor.stats?.totalVotes,
    verified_votes: vendor.stats?.verifiedVotes,
  }
}

export class VendorService {
  static async createVendor(data: {
    name: string
    description: string
    imageUrl: string
    category: VendorCategory
    owner: User
  }): Promise<Vendor> {
    const vendorData = {
      name: data.name,
      description: data.description,
      image_url: data.imageUrl,
      category: data.category,
      zone: 'centro', // Default zone, can be updated later
      coordinates: [19.4326, -99.1332], // Default coordinates
      owner_fid: data.owner.fid,
      is_verified: false,
      total_battles: 0,
      wins: 0,
      losses: 0,
      win_rate: 0,
      total_revenue: 0,
      average_rating: 0,
      review_count: 0,
      territory_defenses: 0,
      territory_conquests: 0,
      current_zone_rank: 0,
      total_votes: 0,
      verified_votes: 0,
    }

    const { data: newVendor, error } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create vendor: ${error.message}`)
    }

    return mapSupabaseVendorToVendor(newVendor, data.owner)
  }

  static async getVendor(id: string): Promise<Vendor | null> {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select(`
        *,
        users!vendors_owner_fid_fkey (
          fid,
          username,
          display_name,
          pfp_url,
          bio,
          follower_count,
          following_count,
          verified_addresses,
          battle_tokens,
          credibility_score,
          verified_purchases,
          credibility_tier,
          vote_streak,
          weekly_vote_count,
          weekly_territory_bonus
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Vendor not found
      }
      throw new Error(`Failed to fetch vendor: ${error.message}`)
    }

    // Map the owner data
    const owner: User = {
      fid: vendor.users.fid,
      username: vendor.users.username,
      displayName: vendor.users.display_name,
      pfpUrl: vendor.users.pfp_url,
      bio: vendor.users.bio,
      followerCount: vendor.users.follower_count,
      followingCount: vendor.users.following_count,
      verifiedAddresses: vendor.users.verified_addresses,
      battleTokens: vendor.users.battle_tokens,
      credibilityScore: vendor.users.credibility_score,
      verifiedPurchases: vendor.users.verified_purchases,
      credibilityTier: vendor.users.credibility_tier,
      voteStreak: vendor.users.vote_streak,
      weeklyVoteCount: vendor.users.weekly_vote_count,
      weeklyTerritoryBonus: vendor.users.weekly_territory_bonus,
    }

    return mapSupabaseVendorToVendor(vendor, owner)
  }

  static async getVendorsByOwner(ownerFid: number): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('owner_fid', ownerFid)

    if (error) {
      throw new Error(`Failed to fetch vendors by owner: ${error.message}`)
    }

    return vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
  }

  static async getVendorsByCategory(category: VendorCategory): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)

    if (error) {
      throw new Error(`Failed to fetch vendors by category: ${error.message}`)
    }

    return vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
  }

  static async getAllVendors(params: PaginationParams): Promise<PaginatedResponse<Vendor>> {
    const { page = 1, limit = 10 } = params
    const offset = (page - 1) * limit

    const { data: vendors, error, count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch vendors: ${error.message}`)
    }

    return {
      data: vendors.map(vendor => mapSupabaseVendorToVendor(vendor)),
      pagination: {
        hasNext: (offset + limit) < (count || 0),
        hasPrev: page > 1,
        total: count || 0,
      }
    }
  }

  static async searchVendors(query: string): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20)

    if (error) {
      throw new Error(`Failed to search vendors: ${error.message}`)
    }

    return vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
  }

  static async updateVendor(id: string, updates: Partial<Pick<Vendor, 'name' | 'description' | 'imageUrl' | 'category'>>): Promise<Vendor | null> {
    const updateData: any = {}
    
    if (updates.name) updateData.name = updates.name
    if (updates.description) updateData.description = updates.description
    if (updates.imageUrl) updateData.image_url = updates.imageUrl
    if (updates.category) updateData.category = updates.category

    const { data: vendor, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Vendor not found
      }
      throw new Error(`Failed to update vendor: ${error.message}`)
    }

    return mapSupabaseVendorToVendor(vendor)
  }

  static async deleteVendor(id: string, ownerFid: number): Promise<boolean> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .eq('owner_fid', ownerFid)

    if (error) {
      throw new Error(`Failed to delete vendor: ${error.message}`)
    }

    return true
  }

  static async updateVendorStats(id: string, stats: Partial<Vendor['stats']>): Promise<Vendor | null> {
    const updateData: any = {}
    
    if (stats.totalBattles !== undefined) updateData.total_battles = stats.totalBattles
    if (stats.wins !== undefined) updateData.wins = stats.wins
    if (stats.losses !== undefined) updateData.losses = stats.losses
    if (stats.winRate !== undefined) updateData.win_rate = stats.winRate
    if (stats.totalRevenue !== undefined) updateData.total_revenue = stats.totalRevenue
    if (stats.averageRating !== undefined) updateData.average_rating = stats.averageRating
    if (stats.reviewCount !== undefined) updateData.review_count = stats.reviewCount
    if (stats.territoryDefenses !== undefined) updateData.territory_defenses = stats.territoryDefenses
    if (stats.territoryConquests !== undefined) updateData.territory_conquests = stats.territoryConquests
    if (stats.currentZoneRank !== undefined) updateData.current_zone_rank = stats.currentZoneRank
    if (stats.totalVotes !== undefined) updateData.total_votes = stats.totalVotes
    if (stats.verifiedVotes !== undefined) updateData.verified_votes = stats.verifiedVotes

    const { data: vendor, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Vendor not found
      }
      throw new Error(`Failed to update vendor stats: ${error.message}`)
    }

    return mapSupabaseVendorToVendor(vendor)
  }

  static async getTopVendors(limit: number = 10): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .order('win_rate', { ascending: false })
      .order('total_battles', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch top vendors: ${error.message}`)
    }

    return vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
  }

  static async getVendorsByWinRate(minWinRate: number = 50): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .gte('win_rate', minWinRate)
      .order('win_rate', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch vendors by win rate: ${error.message}`)
    }

    return vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
  }

  static async getVendorsByBattleCount(minBattles: number = 5): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .gte('total_battles', minBattles)
      .order('total_battles', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch vendors by battle count: ${error.message}`)
    }

    return vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
  }

  static async getVendorCount(): Promise<number> {
    const { count, error } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to get vendor count: ${error.message}`)
    }

    return count || 0
  }

  static async getVendorCountByCategory(category: VendorCategory): Promise<number> {
    const { count, error } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)

    if (error) {
      throw new Error(`Failed to get vendor count by category: ${error.message}`)
    }

    return count || 0
  }

  static async getVendorCountByOwner(ownerFid: number): Promise<number> {
    const { count, error } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('owner_fid', ownerFid)

    if (error) {
      throw new Error(`Failed to get vendor count by owner: ${error.message}`)
    }

    return count || 0
  }

  // Get vendors by zone
  static async getVendorsByZone(zoneId: string): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select(`
        *,
        users!vendors_owner_fid_fkey (
          fid,
          username,
          display_name,
          pfp_url,
          bio,
          follower_count,
          following_count,
          verified_addresses,
          battle_tokens,
          credibility_score,
          verified_purchases,
          credibility_tier,
          vote_streak,
          weekly_vote_count,
          weekly_territory_bonus
        )
      `)
      .eq('zone', zoneId)
      .order('current_zone_rank', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch vendors by zone: ${error.message}`)
    }

    return vendors.map(vendor => {
      const owner: User = {
        fid: vendor.users.fid,
        username: vendor.users.username,
        displayName: vendor.users.display_name,
        pfpUrl: vendor.users.pfp_url,
        bio: vendor.users.bio,
        followerCount: vendor.users.follower_count,
        followingCount: vendor.users.following_count,
        verifiedAddresses: vendor.users.verified_addresses,
        battleTokens: vendor.users.battle_tokens,
        credibilityScore: vendor.users.credibility_score,
        verifiedPurchases: vendor.users.verified_purchases,
        credibilityTier: vendor.users.credibility_tier,
        voteStreak: vendor.users.vote_streak,
        weeklyVoteCount: vendor.users.weekly_vote_count,
        weeklyTerritoryBonus: vendor.users.weekly_territory_bonus,
      }
      return mapSupabaseVendorToVendor(vendor, owner)
    })
  }
} 