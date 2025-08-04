import type { Vendor, VendorCategory, User, PaginationParams, PaginatedResponse } from '@/types'
import { generateVendorId, calculateWinRate } from '@/lib/utils'

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const vendors = new Map<string, Vendor>()

// Initialize with sample vendors for development
const initializeSampleVendors = () => {
  const sampleVendors: Vendor[] = [
    {
      id: '1',
      name: 'Pupusas María',
      description: 'Las mejores pupusas de la ciudad. Receta familiar de 3 generaciones. Especialidad en pupusas de queso con loroco y revueltas.',
      imageUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
      category: 'FOOD',
      zone: 'centro',
      coordinates: [19.4326, -99.1332],
      owner: {
        fid: 12345,
        username: 'maria_pupusas',
        displayName: 'María González',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Pupusera de corazón ❤️',
        followersCount: 2340,
        followingCount: 156,
        verifiedAddresses: []
      },
      isVerified: true,
      verificationProof: ['business_license', 'health_inspection'],
      stats: {
        totalBattles: 45,
        wins: 38,
        losses: 7,
        winRate: 84.4,
        totalRevenue: 12500,
        averageRating: 4.8,
        reviewCount: 156,
        territoryDefenses: 12,
        territoryConquests: 8,
        currentZoneRank: 1,
        totalVotes: 2340,
        verifiedVotes: 1890,
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20'),
    },
    {
      id: '2',
      name: 'Tacos El Rey',
      description: 'Tacos al pastor y de suadero que te harán llorar de felicidad. Salsas caseras y tortillas hechas a mano.',
      imageUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
      category: 'FOOD',
      zone: 'norte',
      coordinates: [19.4426, -99.1432],
      owner: {
        fid: 23456,
        username: 'tacos_el_rey',
        displayName: 'Carlos Mendoza',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Rey de los tacos 👑',
        followersCount: 1890,
        followingCount: 89,
        verifiedAddresses: []
      },
      isVerified: true,
      verificationProof: ['business_license', 'health_inspection'],
      stats: {
        totalBattles: 32,
        wins: 28,
        losses: 4,
        winRate: 87.5,
        totalRevenue: 9800,
        averageRating: 4.9,
        reviewCount: 98,
        territoryDefenses: 8,
        territoryConquests: 6,
        currentZoneRank: 2,
        totalVotes: 1890,
        verifiedVotes: 1450,
      },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-18'),
    },
    {
      id: '3',
      name: 'Café Aroma',
      description: 'Café de especialidad tostado artesanalmente. Granos de Chiapas y Oaxaca. Ambiente perfecto para trabajar.',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
      category: 'FOOD',
      zone: 'sur',
      coordinates: [19.4226, -99.1232],
      owner: {
        fid: 34567,
        username: 'cafe_aroma',
        displayName: 'Ana Rodríguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Barista y amante del café ☕',
        followersCount: 1560,
        followingCount: 234,
        verifiedAddresses: []
      },
      isVerified: true,
      verificationProof: ['business_license', 'health_inspection'],
      stats: {
        totalBattles: 28,
        wins: 22,
        losses: 6,
        winRate: 78.6,
        totalRevenue: 8200,
        averageRating: 4.7,
        reviewCount: 134,
        territoryDefenses: 6,
        territoryConquests: 4,
        currentZoneRank: 3,
        totalVotes: 1560,
        verifiedVotes: 1200,
      },
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-03-15'),
    },
    {
      id: '4',
      name: 'Pizza Napolitana',
      description: 'Pizza auténtica napolitana con masa fermentada por 72 horas. Horno de leña y ingredientes importados de Italia.',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      category: 'FOOD',
      zone: 'este',
      coordinates: [19.4326, -99.1132],
      owner: {
        fid: 45678,
        username: 'pizza_napoli',
        displayName: 'Marco Rossi',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        bio: 'Pizzaiolo italiano 🇮🇹',
        followersCount: 2100,
        followingCount: 178,
        verifiedAddresses: []
      },
      isVerified: true,
      verificationProof: ['business_license', 'health_inspection'],
      stats: {
        totalBattles: 38,
        wins: 31,
        losses: 7,
        winRate: 81.6,
        totalRevenue: 11200,
        averageRating: 4.8,
        reviewCount: 167,
        territoryDefenses: 10,
        territoryConquests: 7,
        currentZoneRank: 4,
        totalVotes: 2100,
        verifiedVotes: 1680,
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-03-19'),
    },
    {
      id: '5',
      name: 'Sushi Express',
      description: 'Sushi fresco preparado al momento. Pescado de la mejor calidad y arroz perfectamente sazonado.',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      category: 'FOOD',
      zone: 'oeste',
      coordinates: [19.4326, -99.1532],
      owner: {
        fid: 56789,
        username: 'sushi_express',
        displayName: 'Yuki Tanaka',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Sushi master 🍣',
        followersCount: 1780,
        followingCount: 145,
        verifiedAddresses: []
      },
      isVerified: true,
      verificationProof: ['business_license', 'health_inspection'],
      stats: {
        totalBattles: 25,
        wins: 20,
        losses: 5,
        winRate: 80.0,
        totalRevenue: 8900,
        averageRating: 4.6,
        reviewCount: 89,
        territoryDefenses: 5,
        territoryConquests: 3,
        currentZoneRank: 5,
        totalVotes: 1780,
        verifiedVotes: 1420,
      },
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-03-17'),
    }
  ]

  sampleVendors.forEach(vendor => {
    vendors.set(vendor.id, vendor)
  })
}

// Initialize sample vendors
initializeSampleVendors()

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