// ABI para el contrato VendorWarsExtended
export const VENDOR_WARS_EXTENDED_ABI = [
  // ============ CORE FUNCTIONS ============
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'vendorData', type: 'string' },
      { name: 'vendorId', type: 'string' }
    ],
    name: 'registerVendor',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'burnTokens',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'reason', type: 'string' }
    ],
    name: 'refundTokens',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // ============ REVIEW FUNCTIONS ============
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'cost', type: 'uint256' },
      { name: 'reviewData', type: 'string' },
      { name: 'reviewId', type: 'string' }
    ],
    name: 'submitReview',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // ============ VOTING FUNCTIONS ============
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'cost', type: 'uint256' },
      { name: 'vendorId', type: 'string' },
      { name: 'zoneId', type: 'string' },
      { name: 'voteValue', type: 'uint256' },
      { name: 'isVerified', type: 'bool' }
    ],
    name: 'recordVote',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // ============ VENDOR MANAGEMENT FUNCTIONS ============
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'vendorId', type: 'string' },
      { name: 'newName', type: 'string' },
      { name: 'newDescription', type: 'string' },
      { name: 'newCategory', type: 'string' },
      { name: 'cost', type: 'uint256' }
    ],
    name: 'updateVendorInfo',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'vendorId', type: 'string' },
      { name: 'verifier', type: 'address' },
      { name: 'verificationData', type: 'string' },
      { name: 'cost', type: 'uint256' }
    ],
    name: 'verifyVendor',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'vendorId', type: 'string' },
      { name: 'boostAmount', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'cost', type: 'uint256' }
    ],
    name: 'boostVendor',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // ============ TERRITORY FUNCTIONS ============
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'zoneId', type: 'string' },
      { name: 'vendorId', type: 'string' },
      { name: 'claimAmount', type: 'uint256' },
      { name: 'cost', type: 'uint256' }
    ],
    name: 'claimTerritory',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // ============ NFT FUNCTIONS ============
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'achievementType', type: 'string' },
      { name: 'metadata', type: 'string' },
      { name: 'cost', type: 'uint256' }
    ],
    name: 'mintAchievementNFT',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // ============ VIEW FUNCTIONS ============
  {
    inputs: [],
    name: 'getVendorRegistrationCost',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasSufficientBalance',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTotalTokensBurned',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTotalVendorsRegistered',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'vendorId', type: 'string' }],
    name: 'vendorExists',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'vendorId', type: 'string' }],
    name: 'getVendorInfo',
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'exists', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'vendorId', type: 'string' }],
    name: 'getVendorInfoExtended',
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'vendorData', type: 'string' },
      { name: 'zoneId', type: 'string' },
      { name: 'isVerified', type: 'bool' },
      { name: 'verifier', type: 'address' },
      { name: 'verificationTime', type: 'uint256' },
      { name: 'exists', type: 'bool' },
      { name: 'totalVotes', type: 'uint256' },
      { name: 'territoryScore', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'vendorId', type: 'string' }],
    name: 'getVendorTotalVotes',
    outputs: [{ name: 'totalVotes', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'zoneId', type: 'string' }],
    name: 'getZoneTotalVotes',
    outputs: [{ name: 'totalVotes', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'zoneId', type: 'string' }],
    name: 'getTerritory',
    outputs: [
      {
        name: 'territory',
        type: 'tuple',
        components: [
          { name: 'zoneId', type: 'string' },
          { name: 'dominantVendorId', type: 'string' },
          { name: 'totalVotes', type: 'uint256' },
          { name: 'lastUpdateTime', type: 'uint256' }
        ]
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getGeneralStats',
    outputs: [
      { name: 'totalTokensBurned', type: 'uint256' },
      { name: 'totalVendorsRegistered', type: 'uint256' },
      { name: 'totalVotes', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getDailyVendorCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getWeeklyVendorCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentDay',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentWeek',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  
  // ============ ADMIN FUNCTIONS ============
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  
  // ============ EVENTS ============
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'vendorId', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ],
    name: 'VendorRegistered',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ],
    name: 'TokensBurned',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ],
    name: 'TokensRefunded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'vendorId', type: 'string' },
      { indexed: false, name: 'newName', type: 'string' },
      { indexed: false, name: 'newDescription', type: 'string' },
      { indexed: false, name: 'newCategory', type: 'string' }
    ],
    name: 'VendorInfoUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'vendorId', type: 'string' },
      { indexed: true, name: 'verifier', type: 'address' },
      { indexed: false, name: 'verificationData', type: 'string' }
    ],
    name: 'VendorVerified',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'vendorId', type: 'string' },
      { indexed: false, name: 'boostAmount', type: 'uint256' },
      { indexed: false, name: 'duration', type: 'uint256' }
    ],
    name: 'VendorBoosted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'voter', type: 'address' },
      { indexed: true, name: 'vendorId', type: 'string' },
      { indexed: true, name: 'zoneId', type: 'string' },
      { indexed: false, name: 'voteValue', type: 'uint256' },
      { indexed: false, name: 'isVerified', type: 'bool' }
    ],
    name: 'VoteRecorded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'zoneId', type: 'string' },
      { indexed: true, name: 'vendorId', type: 'string' },
      { indexed: false, name: 'claimAmount', type: 'uint256' }
    ],
    name: 'TerritoryClaimed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'achievementType', type: 'string' },
      { indexed: false, name: 'metadata', type: 'string' }
    ],
    name: 'AchievementNFTMinted',
    type: 'event'
  }
] as const

// Tipos TypeScript para las estructuras del contrato
export interface VendorInfo {
  user: string
  amount: bigint
  timestamp: bigint
  vendorData: string
  zoneId: string
  isVerified: boolean
  verifier: string
  verificationTime: bigint
  totalVotes: bigint
  territoryScore: bigint
  exists: boolean
}

export interface Territory {
  zoneId: string
  dominantVendorId: string
  totalVotes: bigint
  lastUpdateTime: bigint
}

export interface Vote {
  voter: string
  vendorId: string
  zoneId: string
  voteValue: bigint
  tokensSpent: bigint
  isVerified: boolean
  timestamp: bigint
}

export interface GeneralStats {
  totalTokensBurned: bigint
  totalVendorsRegistered: bigint
  totalVotes: bigint
}
