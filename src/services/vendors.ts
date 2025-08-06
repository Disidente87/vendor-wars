import type { Vendor, User, PaginationParams, PaginatedResponse } from '@/types'
import { VendorCategory } from '@/types'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { generateVendorId, calculateWinRate } from '@/lib/utils'

// Function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Mock data for development when Supabase is not available
const MOCK_VENDORS: Vendor[] = [
  {
    id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
    name: 'Pupusas María',
    description: 'Authentic Salvadoran pupusas made with love and tradition',
    imageUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
    category: VendorCategory.PUPUSAS,
    zone: '49298ccd-5b91-4a41-839d-98c3b2cc504b',
    coordinates: [19.4326, -99.1332],
    owner: {
      fid: 12345,
      username: 'pupusas_maria',
      displayName: 'Pupusas María',
      pfpUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face',
      bio: 'Authentic Salvadoran pupusas made with love and tradition',
      followerCount: 0,
      followingCount: 0,
      verifiedAddresses: [],
      battleTokens: 1250,
      credibilityScore: 95,
      verifiedPurchases: 234,
      credibilityTier: 'gold',
      voteStreak: 15,
      weeklyVoteCount: 45,
      weeklyTerritoryBonus: 120
    },
    isVerified: true,
    verificationProof: [],
    stats: {
      totalBattles: 45,
      wins: 32,
      losses: 13,
      winRate: 71.1,
      totalRevenue: 12500,
      averageRating: 4.8,
      reviewCount: 156,
      territoryDefenses: 8,
      territoryConquests: 3,
      currentZoneRank: 1,
      totalVotes: 456,
      verifiedVotes: 234,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
    name: 'Tacos El Rey',
    description: 'The best tacos in the north, authentic Mexican flavors',
    imageUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
    category: VendorCategory.TACOS,
    zone: '61bace3e-ae39-4bb5-997b-1737122e8849',
    coordinates: [19.4500, -99.1500],
    owner: {
      fid: 12346,
      username: 'tacos_el_rey',
      displayName: 'Tacos El Rey',
      pfpUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face',
      bio: 'The best tacos in the north, authentic Mexican flavors',
      followerCount: 0,
      followingCount: 0,
      verifiedAddresses: [],
      battleTokens: 980,
      credibilityScore: 88,
      verifiedPurchases: 198,
      credibilityTier: 'gold',
      voteStreak: 12,
      weeklyVoteCount: 38,
      weeklyTerritoryBonus: 95
    },
    isVerified: true,
    verificationProof: [],
    stats: {
      totalBattles: 38,
      wins: 28,
      losses: 10,
      winRate: 73.7,
      totalRevenue: 9800,
      averageRating: 4.7,
      reviewCount: 134,
      territoryDefenses: 6,
      territoryConquests: 2,
      currentZoneRank: 1,
      totalVotes: 389,
      verifiedVotes: 198,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '525c09b3-dc92-409b-a11d-896bcf4d15b2',
    name: 'Café Aroma',
    description: 'Artisanal coffee and pastries in a cozy atmosphere',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    category: VendorCategory.BEBIDAS,
    zone: '100b486d-5859-4ab1-9112-2d4bbabcba46',
    coordinates: [19.4000, -99.1200],
    owner: {
      fid: 12347,
      username: 'cafe_aroma',
      displayName: 'Café Aroma',
      pfpUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&h=100&fit=crop&crop=face',
      bio: 'Artisanal coffee and pastries in a cozy atmosphere',
      followerCount: 0,
      followingCount: 0,
      verifiedAddresses: [],
      battleTokens: 720,
      credibilityScore: 82,
      verifiedPurchases: 145,
      credibilityTier: 'silver',
      voteStreak: 8,
      weeklyVoteCount: 25,
      weeklyTerritoryBonus: 60
    },
    isVerified: true,
    verificationProof: [],
    stats: {
      totalBattles: 29,
      wins: 22,
      losses: 7,
      winRate: 75.9,
      totalRevenue: 7200,
      averageRating: 4.6,
      reviewCount: 98,
      territoryDefenses: 4,
      territoryConquests: 1,
      currentZoneRank: 1,
      totalVotes: 267,
      verifiedVotes: 145,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

// Helper function to convert Supabase vendor to app vendor
function mapSupabaseVendorToVendor(supabaseVendor: any, owner?: any): Vendor {
  return {
    id: supabaseVendor.id,
    name: supabaseVendor.name,
    description: supabaseVendor.description,
    imageUrl: supabaseVendor.image_url,
    category: supabaseVendor.category as VendorCategory,
    zone: supabaseVendor.zones?.name || supabaseVendor.zone_id || 'Unknown',
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

    const supabase = getSupabaseClient()
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
    try {
      console.log('🔍 VendorService.getVendor called with ID:', id)
      
      const supabase = getSupabaseClient()
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select(`
          *,
          zones!inner(name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Supabase error in getVendor:', error)
        throw new Error(`Failed to fetch vendor: ${error.message}`)
      }

      if (!vendor) {
        console.log('⚠️ Vendor not found in Supabase')
        return null
      }

      console.log('✅ Vendor found:', vendor.name)
      return mapSupabaseVendorToVendor(vendor)
    } catch (error) {
      console.error('❌ Error fetching vendor from Supabase:', error)
      throw new Error(`Failed to fetch vendor: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }



  static async getVendorsByOwner(ownerFid: number): Promise<Vendor[]> {
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)

    if (error) {
      throw new Error(`Failed to fetch vendors by category: ${error.message}`)
    }

    return vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
  }

  static async getAllVendors(params: any): Promise<{ data: Vendor[], total: number }> {
    const { limit = 50, offset = 0, category, zone, verified } = params

    console.log('🔍 VendorService.getAllVendors called with params:', params)

    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('vendors')
        .select(`
          *,
          zones!inner(name)
        `, { count: 'exact' })

      // Apply filters
      if (category) {
        query = query.eq('category', category)
      }
      if (zone) {
        query = query.eq('zone_id', zone)
      }
      if (verified !== undefined) {
        query = query.eq('is_verified', verified)
      }

      const { data: vendors, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      console.log('📊 Supabase response:', { vendorsCount: vendors?.length, error, count })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw new Error(`Failed to fetch vendors: ${error.message}`)
      }

      const mappedVendors = vendors.map(vendor => mapSupabaseVendorToVendor(vendor))
      console.log('✅ Mapped vendors:', mappedVendors.length)

      return {
        data: mappedVendors,
        total: count || 0
      }
    } catch (error) {
      console.error('❌ Error in getAllVendors:', error)
      throw new Error(`Failed to fetch vendors: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async searchVendors(query: string): Promise<Vendor[]> {
    const supabase = getSupabaseClient()
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

    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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

    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
    const { count, error } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to get vendor count: ${error.message}`)
    }

    return count || 0
  }

  static async getVendorCountByCategory(category: VendorCategory): Promise<number> {
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    try {
      const supabase = getSupabaseClient()
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
      .eq('zone_id', zoneId)
      .order('current_zone_rank', { ascending: true })

      if (error) {
        console.error('❌ Supabase error in getVendorsByZone:', error)
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
    } catch (error) {
      console.error('❌ Error fetching vendors by zone from Supabase:', error)
      throw new Error(`Failed to fetch vendors by zone: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }


} 