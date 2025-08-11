/**
 * Types for the Vendor Registration Payment System
 */

export interface VendorRegistrationData {
  userAddress: string
  amount: string
  vendorId: string
  vendorData: string
  name: string
  description: string
  delegation: string
  category: string
  imageUrl: string
  ownerFid: number
}

export interface VendorRegistrationResult {
  success: boolean
  vendorId?: string
  transactionHash?: string
  amount?: string
  message?: string
  error?: string
}

export interface PaymentVerificationResult {
  success: boolean
  amount?: string
  userAddress?: string
  vendorId?: string
  error?: string
}

export interface VendorPaymentInfo {
  cost: string
  userBalance: string
  hasSufficientBalance: boolean
  requiredAmount: string
  missingAmount: string
}

export interface VendorRegistrationMetrics {
  totalTokensBurned: string
  totalVendorsRegistered: number
  registrationCost: string
}

export interface VendorRegistrationFormData {
  name: string
  imageFile: File | null
  imageUrl: string
  delegation: string
  description: string
  category: string
  userAddress: string
  paymentAmount: string
}

export interface VendorRegistrationStep {
  id: number
  title: string
  description: string
  isCompleted: boolean
  isDisabled: boolean
}

export interface VendorRegistrationState {
  currentStep: number
  isSubmitting: boolean
  isProcessingPayment: boolean
  paymentStatus: 'idle' | 'pending' | 'success' | 'error'
  errorMessage: string
  successMessage: string
  transactionHash: string
}

export interface VendorRegistrationValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface VendorRegistrationRateLimit {
  dailyCount: number
  weeklyCount: number
  lastRegistrationTime: number
  canRegister: boolean
  nextRegistrationTime: number
  reason?: string
}

export interface VendorRegistrationUniqueness {
  nameExists: boolean
  addressExists: boolean
  coordinatesExist: boolean
  userIdLimitReached: boolean
  isValid: boolean
  conflicts: string[]
}

export interface VendorRegistrationRollback {
  success: boolean
  tokensRefunded: boolean
  vendorRemoved: boolean
  error?: string
}

export interface VendorRegistrationEvent {
  type: 'payment_initiated' | 'payment_confirmed' | 'vendor_registered' | 'registration_failed' | 'rollback_initiated' | 'rollback_completed'
  timestamp: number
  data: any
  message: string
}

export interface VendorRegistrationConfig {
  maxVendorsPerDay: number
  maxVendorsPerWeek: number
  cooldownPeriod: number
  registrationCost: string
  supportedChains: number[]
  gasLimit: number
  gasPrice: string
}

export interface VendorRegistrationError {
  code: string
  message: string
  details?: any
  recoverable: boolean
  suggestedAction?: string
}

export interface VendorRegistrationSuccess {
  vendorId: string
  transactionHash: string
  amount: string
  timestamp: number
  blockNumber: number
  gasUsed: string
  gasPrice: string
}
