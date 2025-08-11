// Tipos para el sistema de pago de vendors

export interface PaymentState {
  isConnected: boolean
  hasSufficientBalance: boolean
  isApproved: boolean
  isTransactionPending: boolean
  isTransactionConfirmed: boolean
  error: string | null
  balance: string
  requiredAmount: string
  allowance: string
}

export interface TransactionData {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  gasUsed?: string
  gasPrice?: string
}

export interface VendorRegistrationData {
  name: string
  description: string
  delegation: string
  category: string
  imageUrl: string
  ownerFid: number
  userAddress: string
  paymentAmount: string
  vendorId: string
}

export interface PaymentConfirmation {
  success: boolean
  transactionHash: string
  vendorId: string
  tokensBurned: string
  timestamp: number
  error?: string
}

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  requiredAmount: string
  userBalance: string
  userAllowance: string
}

export interface WalletConnection {
  isConnected: boolean
  address: string | null
  chainId: number | null
  isSupported: boolean
}

export interface PaymentStepProps {
  onPaymentReady: (isReady: boolean) => void
  onNext: () => void
  onBack: () => void
  vendorData?: VendorRegistrationData
}

export interface TransactionStatusProps {
  paymentState: PaymentState
  onApprove: () => void
  onRefresh: () => void
  vendorData?: string
  vendorId?: string
  onRegister?: () => void
}

// Estados de la transacción
export type TransactionStep = 
  | 'connect'      // Conectar wallet
  | 'approve'      // Aprobar tokens
  | 'register'     // Registrar vendor
  | 'complete'     // Completado

export interface TransactionStepInfo {
  id: TransactionStep
  label: string
  description: string
  status: 'pending' | 'current' | 'completed'
  isRequired: boolean
}

// Configuración del sistema de pago
export interface PaymentConfig {
  requiredAmount: number // 50 $BATTLE
  tokenAddress: string
  contractAddress: string
  networkId: number
  gasLimit?: string
  maxFeePerGas?: string
}

// Respuesta de la API de registro
export interface VendorRegistrationResponse {
  success: boolean
  data?: {
    id: string
    name: string
    payment_status: 'pending' | 'completed' | 'failed'
    owner_address: string
    payment_amount: string
    transaction_hash?: string
  }
  message: string
  error?: string
}

// Eventos del smart contract
export interface VendorRegisteredEvent {
  user: string
  amount: string
  vendorId: string
  timestamp: number
  transactionHash: string
}

// Errores del sistema de pago
export type PaymentError = 
  | 'insufficient_balance'
  | 'wallet_not_connected'
  | 'approval_failed'
  | 'registration_failed'
  | 'network_error'
  | 'user_rejected'
  | 'unknown_error'

export interface PaymentErrorInfo {
  type: PaymentError
  message: string
  code?: string
  details?: any
}
