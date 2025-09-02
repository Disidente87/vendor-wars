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
    VOTE_COOLDOWN_MINUTES: 0, // REMOVED COOLDOWN: Allow immediate voting for testing
    VERIFIED_VOTE_MULTIPLIER: 3, // 3x tokens for verified purchases
    BASE_VOTE_TOKENS: 10, // Base tokens per vote
    TERRITORY_DEFENSE_BONUS: 20, // Bonus for maintaining #1 for 24h
    TERRITORY_CONQUEST_BONUS: 50, // Bonus for taking #1 from another
    WEEKLY_VOTE_CAP: 999999, // REMOVED CAP: Allow unlimited votes per week for testing
    WEEKLY_TERRITORY_CAP: 999999, // REMOVED CAP: Allow unlimited territory bonuses for testing
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
  
  // Main Categories (6 main categories)
  MAIN_CATEGORIES: [
    { 
      id: 'comida-mexicana', 
      name: 'Comida Mexicana', 
      icon: '🇲🇽', 
      description: 'Tacos, tortas, quesadillas y más',
      color: '#16a34a'
    },
    { 
      id: 'comida-internacional', 
      name: 'Internacional', 
      icon: '🌍', 
      description: 'Pupusas, arepas, sushi, pizza',
      color: '#dc2626'
    },
    { 
      id: 'antojitos', 
      name: 'Antojitos y Street Food', 
      icon: '🌽', 
      description: 'Elote, esquites, churros',
      color: '#ea580c'
    },
    { 
      id: 'bebidas', 
      name: 'Bebidas', 
      icon: '🥤', 
      description: 'Café, jugos, agua fresca',
      color: '#0ea5e9'
    },
    { 
      id: 'postres', 
      name: 'Postres y Panadería', 
      icon: '🍰', 
      description: 'Helados, pan dulce, pasteles',
      color: '#a855f7'
    },
    { 
      id: 'mariscos', 
      name: 'Mariscos', 
      icon: '🐟', 
      description: 'Ceviche, pescado, camarones',
      color: '#0891b2'
    }
  ],

  // Subcategories organized by main category
  SUBCATEGORIES: {
    'comida-mexicana': [
      { id: 'tacos', name: 'Tacos', icon: '🌮' },
      { id: 'tamales', name: 'Tamales', icon: '🌽' },
      { id: 'quesadillas', name: 'Quesadillas', icon: '🧀' },
      { id: 'tortas', name: 'Tortas', icon: '🥪' },
      { id: 'pozole', name: 'Pozole', icon: '🍲' },
      { id: 'mole', name: 'Mole', icon: '🍛' },
      { id: 'chiles-rellenos', name: 'Chiles Rellenos', icon: '🌶️' },
      { id: 'enchiladas', name: 'Enchiladas', icon: '🌯' },
      { id: 'chilaquiles', name: 'Chilaquiles', icon: '🌶️' },
      { id: 'menudo', name: 'Menudo', icon: '🍲' },
      { id: 'birria', name: 'Birria', icon: '🍲' },
      { id: 'carnitas', name: 'Carnitas', icon: '🥩' }
    ],
    'comida-internacional': [
      { id: 'pupusas', name: 'Pupusas', icon: '🥟' },
      { id: 'arepas', name: 'Arepas', icon: '🥟' },
      { id: 'empanadas', name: 'Empanadas', icon: '🥟' },
      { id: 'sushi', name: 'Sushi', icon: '🍣' },
      { id: 'pizza', name: 'Pizza', icon: '🍕' },
      { id: 'hamburgers', name: 'Hamburgers', icon: '🍔' },
      { id: 'chinese', name: 'Chinese', icon: '🥢' },
      { id: 'korean', name: 'Korean', icon: '🍜' },
      { id: 'thai', name: 'Thai', icon: '🍜' },
      { id: 'indian', name: 'Indian', icon: '🍛' },
      { id: 'mediterranean', name: 'Mediterranean', icon: '🥙' },
      { id: 'vegan', name: 'Vegano', icon: '🌱' },
      { id: 'vegetariano', name: 'Vegetariano', icon: '🥗' },
      { id: 'fine-dining', name: 'Fine Dining', icon: '🍽️' }
    ],
    'antojitos': [
      { id: 'elote', name: 'Elote', icon: '🌽' },
      { id: 'esquites', name: 'Esquites', icon: '🌽' },
      { id: 'tostadas', name: 'Tostadas', icon: '🥙' },
      { id: 'sopes', name: 'Sopes', icon: '🥙' },
      { id: 'huaraches', name: 'Huaraches', icon: '🥙' },
      { id: 'churros', name: 'Churros', icon: '🍩' },
      { id: 'gorditas', name: 'Gorditas', icon: '🥙' },
      { id: 'tlacoyos', name: 'Tlacoyos', icon: '🥙' },
      { id: 'comida-rapida', name: 'Comida Rápida', icon: '🍟' }
    ],
    'bebidas': [
      { id: 'agua-fresca', name: 'Agua Fresca', icon: '🧊' },
      { id: 'cafe', name: 'Café', icon: '☕' },
      { id: 'te', name: 'Té', icon: '🍵' },
      { id: 'smoothies', name: 'Smoothies', icon: '🥤' },
      { id: 'juices', name: 'Jugos', icon: '🧃' },
      { id: 'licuados', name: 'Licuados', icon: '🥤' },
      { id: 'atole', name: 'Atole', icon: '🥤' },
      { id: 'champurrado', name: 'Champurrado', icon: '🥤' }
    ],
    'postres': [
      { id: 'helado', name: 'Helado', icon: '🍦' },
      { id: 'flan', name: 'Flan', icon: '🍮' },
      { id: 'tres-leches', name: 'Tres Leches', icon: '🍰' },
      { id: 'pan-dulce', name: 'Pan Dulce', icon: '🥖' },
      { id: 'panaderia', name: 'Panadería', icon: '🥖' },
      { id: 'pasteleria', name: 'Pastelería', icon: '🧁' },
      { id: 'paletas', name: 'Paletas', icon: '🍭' },
      { id: 'nieve', name: 'Nieve', icon: '🍦' }
    ],
    'mariscos': [
      { id: 'ceviche', name: 'Ceviche', icon: '🐟' },
      { id: 'pescado', name: 'Pescado', icon: '🐟' },
      { id: 'camarones', name: 'Camarones', icon: '🦐' },
      { id: 'pulpo', name: 'Pulpo', icon: '🐙' },
      { id: 'ostiones', name: 'Ostiones', icon: '🦪' },
      { id: 'langosta', name: 'Langosta', icon: '🦞' },
      { id: 'cangrejo', name: 'Cangrejo', icon: '🦀' }
    ]
  },

  // Legacy categories for backward compatibility
  CATEGORIES: [
    { id: 'tacos', name: 'Tacos', icon: '🌮', description: 'Authentic Mexican tacos' },
    { id: 'tamales', name: 'Tamales', icon: '🌽', description: 'Traditional tamales' },
    { id: 'quesadillas', name: 'Quesadillas', icon: '🧀', description: 'Cheese quesadillas' },
    { id: 'tortas', name: 'Tortas', icon: '🥪', description: 'Mexican sandwiches' },
    { id: 'pozole', name: 'Pozole', icon: '🍲', description: 'Traditional pozole soup' },
    { id: 'mole', name: 'Mole', icon: '🍛', description: 'Traditional mole dishes' },
    { id: 'chiles-rellenos', name: 'Chiles Rellenos', icon: '🌶️', description: 'Stuffed peppers' },
    { id: 'enchiladas', name: 'Enchiladas', icon: '🌯', description: 'Rolled tortillas with sauce' },
    { id: 'elote', name: 'Elote', icon: '🌽', description: 'Mexican street corn' },
    { id: 'esquites', name: 'Esquites', icon: '🌽', description: 'Corn in a cup' },
    { id: 'tostadas', name: 'Tostadas', icon: '🥙', description: 'Crispy tortilla tostadas' },
    { id: 'sopes', name: 'Sopes', icon: '🥙', description: 'Thick tortilla sopes' },
    { id: 'huaraches', name: 'Huaraches', icon: '🥙', description: 'Oval-shaped huaraches' },
    { id: 'pupusas', name: 'Pupusas', icon: '🥟', description: 'Traditional Salvadoran pupusas' },
    { id: 'arepas', name: 'Arepas', icon: '🥟', description: 'Venezuelan arepas' },
    { id: 'empanadas', name: 'Empanadas', icon: '🥟', description: 'Latin American empanadas' },
    { id: 'ceviche', name: 'Ceviche', icon: '🐟', description: 'Fresh seafood ceviche' },
    { id: 'sushi', name: 'Sushi', icon: '🍣', description: 'Japanese sushi' },
    { id: 'pizza', name: 'Pizza', icon: '🍕', description: 'Italian pizza' },
    { id: 'hamburgers', name: 'Hamburgers', icon: '🍔', description: 'American burgers' },
    { id: 'chinese', name: 'Chinese', icon: '🥢', description: 'Chinese cuisine' },
    { id: 'korean', name: 'Korean', icon: '🍜', description: 'Korean BBQ and dishes' },
    { id: 'thai', name: 'Thai', icon: '🍜', description: 'Thai cuisine' },
    { id: 'indian', name: 'Indian', icon: '🍛', description: 'Indian curry and dishes' },
    { id: 'mediterranean', name: 'Mediterranean', icon: '🥙', description: 'Mediterranean cuisine' },
    { id: 'agua-fresca', name: 'Agua Fresca', icon: '🧊', description: 'Fresh fruit waters' },
    { id: 'cafe', name: 'Café', icon: '☕', description: 'Coffee and espresso' },
    { id: 'te', name: 'Té', icon: '🍵', description: 'Tea and herbal drinks' },
    { id: 'smoothies', name: 'Smoothies', icon: '🥤', description: 'Fruit smoothies' },
    { id: 'juices', name: 'Jugos', icon: '🧃', description: 'Fresh fruit juices' },
    { id: 'helado', name: 'Helado', icon: '🍦', description: 'Ice cream and gelato' },
    { id: 'churros', name: 'Churros', icon: '🍩', description: 'Fried dough churros' },
    { id: 'flan', name: 'Flan', icon: '🍮', description: 'Traditional flan' },
    { id: 'tres-leches', name: 'Tres Leches', icon: '🍰', description: 'Three milk cake' },
    { id: 'pan-dulce', name: 'Pan Dulce', icon: '🥖', description: 'Mexican sweet bread' },
    { id: 'panaderia', name: 'Panadería', icon: '🥖', description: 'Mexican bakery' },
    { id: 'pasteleria', name: 'Pastelería', icon: '🧁', description: 'Pastry shop' },
    { id: 'vegan', name: 'Vegano', icon: '🌱', description: 'Vegan cuisine' },
    { id: 'vegetariano', name: 'Vegetariano', icon: '🥗', description: 'Vegetarian dishes' },
    { id: 'mariscos', name: 'Mariscos', icon: '🦐', description: 'Seafood specialties' },
    { id: 'carnes', name: 'Carnes', icon: '🥩', description: 'Meat specialties' },
    { id: 'comida-rapida', name: 'Comida Rápida', icon: '🍟', description: 'Fast food' },
    { id: 'fine-dining', name: 'Fine Dining', icon: '🍽️', description: 'Upscale dining' },
    { id: 'otros', name: 'Otros', icon: '🍽️', description: 'Other local specialties' }
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

export const getMainCategoryInfo = (categoryId: string) => {
  return FARCASTER_CONFIG.MAIN_CATEGORIES.find(cat => cat.id === categoryId)
}

export const getSubcategories = (mainCategoryId: string) => {
  return FARCASTER_CONFIG.SUBCATEGORIES[mainCategoryId as keyof typeof FARCASTER_CONFIG.SUBCATEGORIES] || []
}

export const getZoneInfo = (zoneId: string) => {
  return FARCASTER_CONFIG.BATTLE_ZONES.find(zone => zone.id === zoneId)
} 