// Configuración del sistema de pago para vendors

export const PAYMENT_CONFIG = {
  // Token $BATTLE
  BATTLE_TOKEN: {
    ADDRESS: process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS || '0xDa6884d4F2E68b9700678139B617607560f70Cc3',
    SYMBOL: 'BATTLE',
    NAME: 'Battle Token',
    DECIMALS: 18,
    REQUIRED_AMOUNT: 50, // 50 $BATTLE tokens for vendor registration
    REVIEW_COST: 50, // 50 $BATTLE tokens for reviews (using vendor registration contract)
  },

  // Contrato VendorRegistration
  VENDOR_REGISTRATION: {
    ADDRESS: process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS || '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a',
    NETWORK: {
      CHAIN_ID: 84532, // Base Sepolia
      NAME: 'Base Sepolia',
      RPC_URL: 'https://sepolia.base.org',
      EXPLORER: 'https://sepolia.basescan.org',
    },
  },

  // Configuración de transacciones
  TRANSACTION: {
    GAS_LIMIT: '500000', // Límite de gas para transacciones
    MAX_FEE_PER_GAS: '2000000000', // 2 gwei
    CONFIRMATIONS: 3, // Confirmaciones requeridas
    TIMEOUT: 300000, // 5 minutos en ms
  },

  // Rate limiting
  RATE_LIMITS: {
    MAX_VENDORS_PER_DAY: 3,
    MAX_VENDORS_PER_WEEK: 10,
    COOLDOWN_PERIOD: 3600000, // 1 hora en ms
  },

  // Validaciones
  VALIDATION: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },

  // Estados de pago
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  // Estados de transacción
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
    REVERTED: 'reverted',
  },

  // Mensajes de error
  ERROR_MESSAGES: {
    INSUFFICIENT_BALANCE: 'Saldo insuficiente. Necesitas al menos 50 $BATTLE tokens.',
    WALLET_NOT_CONNECTED: 'Debes conectar tu wallet para continuar.',
    APPROVAL_FAILED: 'Error al aprobar el gasto de tokens.',
    REGISTRATION_FAILED: 'Error al registrar el vendor en blockchain.',
    NETWORK_ERROR: 'Error de red. Verifica tu conexión.',
    USER_REJECTED: 'Transacción rechazada por el usuario.',
    UNKNOWN_ERROR: 'Error desconocido. Intenta nuevamente.',
  },

  // Mensajes de éxito
  SUCCESS_MESSAGES: {
    TOKENS_APPROVED: 'Tokens aprobados exitosamente.',
    VENDOR_REGISTERED: 'Vendor registrado exitosamente en blockchain.',
    PAYMENT_COMPLETED: 'Pago completado. Tu vendor está activo.',
  },

  // URLs de la API
  API_ENDPOINTS: {
    VENDOR_REGISTRATION: '/api/vendors/register',
    PAYMENT_VERIFICATION: '/api/vendors/verify-payment',
    PAYMENT_HISTORY: '/api/vendors/payment-history',
    PAYMENT_STATS: '/api/vendors/payment-stats',
  },
} as const

// Tipos derivados de la configuración
export type PaymentStatus = typeof PAYMENT_CONFIG.PAYMENT_STATUS[keyof typeof PAYMENT_CONFIG.PAYMENT_STATUS]
export type TransactionStatus = typeof PAYMENT_CONFIG.TRANSACTION_STATUS[keyof typeof PAYMENT_CONFIG.TRANSACTION_STATUS]

// Funciones de utilidad
export const formatTokenAmount = (amount: string | number, decimals: number = 18): string => {
  try {
    const numericAmount = Number(amount) / Math.pow(10, decimals)
    return numericAmount.toFixed(2)
  } catch (error) {
    return '0.00'
  }
}

export const parseTokenAmount = (amount: string | number, decimals: number = 18): string => {
  try {
    const numericAmount = Number(amount) * Math.pow(10, decimals)
    return numericAmount.toString()
  } catch (error) {
    return '0'
  }
}

export const isNetworkSupported = (chainId: number): boolean => {
  return chainId === PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.CHAIN_ID
}

export const getExplorerUrl = (address: string, type: 'address' | 'tx' = 'address'): string => {
  const baseUrl = PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.EXPLORER
  return `${baseUrl}/${type}/${address}`
}

export const validateVendorData = (data: {
  name: string
  description: string
  delegation: string
  category: string
  imageUrl: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data.name || data.name.length < PAYMENT_CONFIG.VALIDATION.MIN_NAME_LENGTH) {
    errors.push(`El nombre debe tener al menos ${PAYMENT_CONFIG.VALIDATION.MIN_NAME_LENGTH} caracteres`)
  }

  if (data.name && data.name.length > PAYMENT_CONFIG.VALIDATION.MAX_NAME_LENGTH) {
    errors.push(`El nombre no puede exceder ${PAYMENT_CONFIG.VALIDATION.MAX_NAME_LENGTH} caracteres`)
  }

  if (!data.description || data.description.length < PAYMENT_CONFIG.VALIDATION.MIN_DESCRIPTION_LENGTH) {
    errors.push(`La descripción debe tener al menos ${PAYMENT_CONFIG.VALIDATION.MIN_DESCRIPTION_LENGTH} caracteres`)
  }

  if (data.description && data.description.length > PAYMENT_CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push(`La descripción no puede exceder ${PAYMENT_CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH} caracteres`)
  }

  if (!data.delegation) {
    errors.push('Debe seleccionar una delegación')
  }

  if (!data.category) {
    errors.push('Debe seleccionar una categoría')
  }

  if (!data.imageUrl) {
    errors.push('Debe subir una imagen del vendor')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
