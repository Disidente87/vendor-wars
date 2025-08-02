import type { Vendor, VendorCategory, User, PaginationParams, PaginatedResponse } from '@/types'
import { generateVendorId, calculateWinRate } from '@/lib/utils'

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const vendors = new Map<string, Vendor>()

export class VendorService {
  static async createVendor(data: {
    name: string
    description: string
    imageUrl: string
    category: VendorCategory
    owner: User
  }): Promise<Vendor> {
    const id = generateVendorId()
    const now = new Date()

    const vendor: Vendor = {
      id,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      category: data.category,
      zone: '',
      coordinates: [0, 0],
      owner: data.owner,
      isVerified: false,
      verificationProof: [],
      stats: {
        totalBattles: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalRevenue: 0,
        averageRating: 0,
        reviewCount: 0,
        territoryDefenses: 0,
        territoryConquests: 0,
        currentZoneRank: 0,
        totalVotes: 0,
        verifiedVotes: 0,
      },
      createdAt: now,
      updatedAt: now,
    }

    vendors.set(id, vendor)
    return vendor
  }

  static async getVendor(id: string): Promise<Vendor | null> {
    return vendors.get(id) || null
  }

  static async getVendorsByOwner(ownerFid: number): Promise<Vendor[]> {
    return Array.from(vendors.values()).filter(
      vendor => vendor.owner.fid === ownerFid
    )
  }

  static async getVendorsByCategory(category: VendorCategory): Promise<Vendor[]> {
    return Array.from(vendors.values()).filter(
      vendor => vendor.category === category
    )
  }

  static async getAllVendors(params: PaginationParams): Promise<PaginatedResponse<Vendor>> {
    const allVendors = Array.from(vendors.values())
    const startIndex = (params.page - 1) * params.limit
    const endIndex = startIndex + params.limit
    const paginatedVendors = allVendors.slice(startIndex, endIndex)

    return {
      data: paginatedVendors,
      pagination: {
        hasNext: endIndex < allVendors.length,
        hasPrev: params.page > 1,
        nextCursor: endIndex < allVendors.length ? endIndex.toString() : undefined,
        prevCursor: params.page > 1 ? (startIndex - params.limit).toString() : undefined,
        total: allVendors.length,
      },
    }
  }

  static async searchVendors(query: string): Promise<Vendor[]> {
    const searchTerm = query.toLowerCase()
    return Array.from(vendors.values()).filter(
      vendor =>
        vendor.name.toLowerCase().includes(searchTerm) ||
        vendor.description.toLowerCase().includes(searchTerm) ||
        vendor.owner.displayName.toLowerCase().includes(searchTerm) ||
        vendor.owner.username.toLowerCase().includes(searchTerm)
    )
  }

  static async updateVendor(id: string, updates: Partial<Pick<Vendor, 'name' | 'description' | 'imageUrl' | 'category'>>): Promise<Vendor | null> {
    const vendor = vendors.get(id)
    if (!vendor) return null

    const updatedVendor: Vendor = {
      ...vendor,
      ...updates,
      updatedAt: new Date(),
    }

    vendors.set(id, updatedVendor)
    return updatedVendor
  }

  static async deleteVendor(id: string, ownerFid: number): Promise<boolean> {
    const vendor = vendors.get(id)
    if (!vendor || vendor.owner.fid !== ownerFid) return false

    return vendors.delete(id)
  }

  static async updateVendorStats(id: string, stats: Partial<Vendor['stats']>): Promise<Vendor | null> {
    const vendor = vendors.get(id)
    if (!vendor) return null

    const updatedStats = {
      ...vendor.stats,
      ...stats,
      winRate: calculateWinRate(
        stats.wins ?? vendor.stats.wins,
        stats.totalBattles ?? vendor.stats.totalBattles
      ),
    }

    const updatedVendor: Vendor = {
      ...vendor,
      stats: updatedStats,
      updatedAt: new Date(),
    }

    vendors.set(id, updatedVendor)
    return updatedVendor
  }

  static async getTopVendors(limit: number = 10): Promise<Vendor[]> {
    return Array.from(vendors.values())
      .sort((a, b) => b.stats.winRate - a.stats.winRate)
      .slice(0, limit)
  }

  static async getVendorsByWinRate(minWinRate: number = 50): Promise<Vendor[]> {
    return Array.from(vendors.values()).filter(
      vendor => vendor.stats.winRate >= minWinRate
    )
  }

  static async getVendorsByBattleCount(minBattles: number = 5): Promise<Vendor[]> {
    return Array.from(vendors.values()).filter(
      vendor => vendor.stats.totalBattles >= minBattles
    )
  }

  static async getVendorCount(): Promise<number> {
    return vendors.size
  }

  static async getVendorCountByCategory(category: VendorCategory): Promise<number> {
    return Array.from(vendors.values()).filter(
      vendor => vendor.category === category
    ).length
  }

  static async getVendorCountByOwner(ownerFid: number): Promise<number> {
    return Array.from(vendors.values()).filter(
      vendor => vendor.owner.fid === ownerFid
    ).length
  }
} 