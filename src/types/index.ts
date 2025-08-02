export interface User {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  followerCount: number
  followingCount: number
  bio: string
  verifiedAddresses: string[]
  battleTokens: number
  credibilityScore: number
  verifiedPurchases: number
  credibilityTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  voteStreak: number
  weeklyVoteCount: number
  weeklyTerritoryBonus: number
}

export interface Vendor {
  id: string
  name: string
  description: string
  imageUrl: string
  category: VendorCategory
  zone: string // Battle zone ID
  coordinates: [number, number] // GPS coordinates
  stats: VendorStats
  owner: User
  isVerified: boolean
  verificationProof: VerificationProof[]
  createdAt: Date
  updatedAt: Date
}

export interface VendorStats {
  totalBattles: number
  wins: number
  losses: number
  winRate: number
  totalRevenue: number
  averageRating: number
  reviewCount: number
  territoryDefenses: number
  territoryConquests: number
  currentZoneRank: number
  totalVotes: number
  verifiedVotes: number
}

export enum VendorCategory {
  PUPUSAS = 'pupusas',
  TACOS = 'tacos',
  TAMALES = 'tamales',
  QUESADILLAS = 'quesadillas',
  TORTAS = 'tortas',
  BEBIDAS = 'bebidas',
  POSTRES = 'postres',
  OTROS = 'otros'
}

export interface BattleZone {
  id: string
  name: string
  description: string
  color: string
  coordinates: [number, number]
  currentOwner?: Vendor
  heatLevel: number
  totalVotes: number
  activeVendors: number
}

export interface Battle {
  id: string
  challenger: Vendor
  opponent: Vendor
  category: VendorCategory
  zone: string
  status: BattleStatus
  startDate: Date
  endDate?: Date
  winner?: Vendor
  votes: Vote[]
  totalVotes: number
  verifiedVotes: number
  description: string
  territoryImpact: boolean
}

export enum BattleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Vote {
  id: string
  voter: User
  battle: Battle
  votedFor: Vendor
  createdAt: Date
  reason?: string
  isVerified: boolean
  attestation?: Attestation
  tokenReward: number
  multiplier: number
}

export interface Attestation {
  id: string
  userId: number
  vendorId: string
  photoHash: string
  photoUrl: string
  gpsLocation: [number, number]
  verificationConfidence: number
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
  processingTime: number
  metadata: {
    timestamp: Date
    deviceInfo: string
    locationAccuracy: number
  }
}

export interface VerificationProof {
  type: 'business_license' | 'location_photo' | 'social_media' | 'receipt' | 'community_vouch'
  url: string
  description: string
  verifiedAt: Date
  verifiedBy: string
}

export interface LeaderboardEntry {
  rank: number
  vendor: Vendor
  totalWins: number
  totalBattles: number
  winRate: number
  totalRevenue: number
  territoryDefenses: number
  zone: string
}

export interface TerritoryStats {
  zoneId: string
  currentOwner: Vendor | null
  previousOwner: Vendor | null
  ownershipDuration: number
  totalVotes: number
  heatLevel: number
  lastConquest: Date
  defenders: User[]
}

export interface TokenTransaction {
  id: string
  userId: number
  type: 'earn' | 'burn' | 'penalty' | 'bonus'
  amount: number
  reason: string
  relatedVote?: Vote
  relatedBattle?: Battle
  timestamp: Date
  balanceAfter: number
}

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface ApiError {
  message: string
  code: string
  details?: any
}

export interface PaginationParams {
  page: number
  limit: number
  cursor?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    hasNext: boolean
    hasPrev: boolean
    nextCursor?: string
    prevCursor?: string
    total: number
  }
}

// Social sharing interfaces
export interface ShareData {
  type: 'vote' | 'territory_win' | 'achievement' | 'battle_result'
  title: string
  description: string
  imageUrl?: string
  url: string
  castText: string
  hashtags: string[]
}

// Achievement system
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirements: AchievementRequirement[]
  reward: {
    tokens: number
    nft?: boolean
  }
  unlockedAt?: Date
}

export interface AchievementRequirement {
  type: 'votes' | 'streak' | 'territory_wins' | 'verified_purchases' | 'social_shares'
  value: number
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time'
} 