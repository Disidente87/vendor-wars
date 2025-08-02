export const FARCASTER_CONFIG = {
  // Farcaster Hub configuration
  HUB_URL: process.env.NEXT_PUBLIC_HUB_URL || 'https://nemes.farcaster.xyz:2283',
  
  // Neynar API configuration
  NEYNAR_API_KEY: process.env.NEYNAR_API_KEY || '',
  NEYNAR_BASE_URL: 'https://api.neynar.com/v2',
  
  // App configuration
  APP_NAME: 'Vendor Wars',
  APP_DESCRIPTION: 'Fight for your local shop! Battle of the vendors in LATAM',
  APP_ICON: '/app-icon.png',
  
  // Authentication
  SIGNER_UUID: process.env.SIGNER_UUID || '',
  
  // Features
  FEATURES: {
    BATTLE_DURATION_HOURS: 24,
    MAX_VENDORS_PER_USER: 5,
    MIN_VOTES_TO_WIN: 10,
    VOTE_COOLDOWN_MINUTES: 60,
    VERIFIED_VOTE_MULTIPLIER: 3, // 3x tokens for verified purchases
    BASE_VOTE_TOKENS: 10, // Base tokens per vote
    TERRITORY_DEFENSE_BONUS: 20, // Bonus for maintaining #1 for 24h
    TERRITORY_CONQUEST_BONUS: 50, // Bonus for taking #1 from another
    WEEKLY_VOTE_CAP: 200, // Max tokens per week from voting
    WEEKLY_TERRITORY_CAP: 100, // Max tokens per week from territory bonuses
  },
  
  // Battle Zones (Zonas de Batalla) - CDMX focused
  BATTLE_ZONES: [
    { 
      id: 'zona-centro', 
      name: 'Zona Centro', 
      description: 'Historic center of CDMX',
      color: '#FF6B6B',
      coordinates: [19.4326, -99.1332]
    },
    { 
      id: 'zona-norte', 
      name: 'Zona Norte', 
      description: 'Northern neighborhoods',
      color: '#4ECDC4',
      coordinates: [19.4500, -99.1500]
    },
    { 
      id: 'zona-sur', 
      name: 'Zona Sur', 
      description: 'Southern districts',
      color: '#45B7D1',
      coordinates: [19.4000, -99.1200]
    },
    { 
      id: 'zona-este', 
      name: 'Zona Este', 
      description: 'Eastern areas',
      color: '#96CEB4',
      coordinates: [19.4200, -99.1000]
    },
    { 
      id: 'zona-oeste', 
      name: 'Zona Oeste', 
      description: 'Western neighborhoods',
      color: '#FFEAA7',
      coordinates: [19.4200, -99.1600]
    },
  ],
  
  // Categories (Food-focused for LATAM)
  CATEGORIES: [
    { id: 'pupusas', name: 'Pupusas', icon: '🥟', description: 'Traditional Salvadoran pupusas' },
    { id: 'tacos', name: 'Tacos', icon: '🌮', description: 'Authentic Mexican tacos' },
    { id: 'tamales', name: 'Tamales', icon: '🌽', description: 'Traditional tamales' },
    { id: 'quesadillas', name: 'Quesadillas', icon: '🧀', description: 'Cheese quesadillas' },
    { id: 'tortas', name: 'Tortas', icon: '🥪', description: 'Mexican sandwiches' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤', description: 'Traditional drinks' },
    { id: 'postres', name: 'Postres', icon: '🍰', description: 'Traditional desserts' },
    { id: 'otros', name: 'Otros', icon: '🍽️', description: 'Other local specialties' },
  ],
  
  // Token Economics
  TOKEN_ECONOMICS: {
    BURN_RATE: 0.02, // 2% weekly burn
    STREAK_BONUS: 1, // +1 token per consecutive day (max +10)
    VERIFIED_PURCHASE_BONUS: 3, // 3x multiplier for verified purchases
    FAILED_DEFENSE_PENALTY: -10, // Penalty for failed territory defense
    FAKE_VOTE_PENALTY: -50, // Penalty for reported fake votes
  },
  
  // Verification Settings
  VERIFICATION: {
    PHOTO_REQUIRED_FOR_VOTES_OVER: 50, // USDC equivalent
    GPS_TOLERANCE_METERS: 50, // GPS verification tolerance
    TIMESTAMP_TOLERANCE_MINUTES: 30, // Photo timestamp tolerance
    PROCESSING_TIME_TARGET_SECONDS: 3, // Target photo verification time
  },
  
  // Social Features
  SOCIAL: {
    CAST_ENGAGEMENT_TARGET: 0.25, // 25% target engagement rate
    ORGANIC_DISCOVERY_TARGET: 0.30, // 30% target for organic discovery
    SHARE_PROMPT_DELAY_MS: 2000, // Delay before showing share prompt
  },
} as const

export const getCategoryInfo = (categoryId: string) => {
  return FARCASTER_CONFIG.CATEGORIES.find(cat => cat.id === categoryId)
}

export const getZoneInfo = (zoneId: string) => {
  return FARCASTER_CONFIG.BATTLE_ZONES.find(zone => zone.id === zoneId)
} 