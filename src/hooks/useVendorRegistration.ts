import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVendorRegistrationService } from '@/services/vendorRegistration'
import { getBattleTokenService } from '@/services/battleToken'
import type {
  VendorRegistrationData,
  VendorRegistrationResult,
  VendorPaymentInfo,
  VendorRegistrationMetrics,
  VendorRegistrationRateLimit,
  VendorRegistrationUniqueness
} from '@/types/vendorRegistration'

// Query keys for caching
const QUERY_KEYS = {
  registrationCost: ['vendor-registration', 'cost'] as const,
  userBalance: (address: string) => ['vendor-registration', 'balance', address] as const,
  paymentInfo: (address: string) => ['vendor-registration', 'payment-info', address] as const,
  metrics: ['vendor-registration', 'metrics'] as const,
  rateLimits: (address: string) => ['vendor-registration', 'rate-limits', address] as const,
  uniqueness: (vendorData: any) => ['vendor-registration', 'uniqueness', vendorData] as const
}

export function useVendorRegistration() {
  const { address: userAddress } = useAccount()
  const queryClient = useQueryClient()
  
  const [registrationState, setRegistrationState] = useState({
    currentStep: 1,
    isSubmitting: false,
    isProcessingPayment: false,
    paymentStatus: 'idle' as 'idle' | 'pending' | 'completed' | 'failed' | 'success' | 'error',
    errorMessage: '',
    successMessage: '',
    transactionHash: ''
  })

  // Get registration cost
  const { data: registrationCost, isLoading: isLoadingCost } = useQuery({
    queryKey: QUERY_KEYS.registrationCost,
    queryFn: () => getVendorRegistrationService().getRegistrationCost(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  // Get user's token balance
  const { data: userBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: QUERY_KEYS.userBalance(userAddress || ''),
    queryFn: () => getBattleTokenService().getTokenBalance(userAddress!),
    enabled: !!userAddress,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  })

  // Get payment information
  const { data: paymentInfo, isLoading: isLoadingPaymentInfo } = useQuery({
    queryKey: QUERY_KEYS.paymentInfo(userAddress || ''),
    queryFn: async () => {
      if (!userAddress || !registrationCost || !userBalance) {
        return null
      }

      const cost = parseFloat(registrationCost)
      const balance = parseFloat(userBalance.formatted)
      const hasSufficientBalance = balance >= cost
      const missingAmount = Math.max(0, cost - balance)

      return {
        cost: registrationCost,
        userBalance: userBalance.formatted,
        hasSufficientBalance,
        requiredAmount: registrationCost,
        missingAmount: missingAmount.toFixed(2)
      }
    },
    enabled: !!userAddress && !!registrationCost && !!userBalance,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  })

  // Get registration metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: QUERY_KEYS.metrics,
    queryFn: async () => {
      const service = getVendorRegistrationService()
      const [totalTokensBurned, totalVendorsRegistered, cost] = await Promise.all([
        service.getTotalTokensBurned(),
        service.getTotalVendorsRegistered(),
        service.getRegistrationCost()
      ])

      return {
        totalTokensBurned,
        totalVendorsRegistered,
        registrationCost: cost
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  })

  // Check rate limits
  const { data: rateLimits, isLoading: isLoadingRateLimits } = useQuery({
    queryKey: QUERY_KEYS.rateLimits(userAddress || ''),
    queryFn: async () => {
      // This would typically call the smart contract to check rate limits
      // For now, we'll simulate the response
      return {
        dailyCount: 0,
        weeklyCount: 0,
        lastRegistrationTime: 0,
        canRegister: true,
        nextRegistrationTime: 0
      }
    },
    enabled: !!userAddress,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  })

  // Check vendor uniqueness
  const checkUniqueness = useCallback(async (vendorData: any) => {
    try {
      // This would typically check against the database and smart contract
      // For now, we'll simulate the response
      return {
        nameExists: false,
        addressExists: false,
        coordinatesExist: false,
        userIdLimitReached: false,
        isValid: true,
        conflicts: []
      }
    } catch (error) {
      console.error('Error checking uniqueness:', error)
      throw new Error('Failed to check vendor uniqueness')
    }
  }, [])

  // Wagmi hooks for contract interactions
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Process vendor registration
  const processRegistration = useCallback(async (vendorData: any) => {
    if (!userAddress || !paymentInfo?.hasSufficientBalance) {
      throw new Error('Insufficient balance for vendor registration')
    }

    setRegistrationState(prev => ({
      ...prev,
      isSubmitting: true,
      isProcessingPayment: true,
      paymentStatus: 'pending'
    }))

    try {
      // Check uniqueness first
      const uniquenessCheck = await checkUniqueness(vendorData)
      if (!uniquenessCheck.isValid) {
        throw new Error(`Vendor conflicts: ${uniquenessCheck.conflicts.join(', ')}`)
      }

      // Check rate limits
      if (rateLimits && !rateLimits.canRegister) {
        throw new Error(`Rate limit exceeded: Daily: ${rateLimits.dailyCount}, Weekly: ${rateLimits.weeklyCount}`)
      }

      // Here we would typically:
      // 1. Call the smart contract to burn tokens
      // 2. Register vendor in database
      // 3. Handle any rollback if needed

      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))

      setRegistrationState(prev => ({
        ...prev,
        isSubmitting: false,
        isProcessingPayment: false,
        paymentStatus: 'success',
        successMessage: 'Vendor registered successfully!'
      }))

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['vendor-registration'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })

      return {
        success: true,
        vendorId: crypto.randomUUID(),
        message: 'Vendor registered successfully with payment'
      }
    } catch (error) {
      setRegistrationState(prev => ({
        ...prev,
        isSubmitting: false,
        isProcessingPayment: false,
        paymentStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }))
      throw error
    }
  }, [userAddress, paymentInfo, rateLimits, checkUniqueness, queryClient])

  // Reset registration state
  const resetRegistration = useCallback(() => {
    setRegistrationState({
      currentStep: 1,
      isSubmitting: false,
      isProcessingPayment: false,
      paymentStatus: 'idle',
      errorMessage: '',
      successMessage: '',
      transactionHash: ''
    })
  }, [])

  // Update current step
  const updateStep = useCallback((step: number) => {
    setRegistrationState(prev => ({
      ...prev,
      currentStep: step
    }))
  }, [])

  // Clear error message
  const clearError = useCallback(() => {
    setRegistrationState(prev => ({
      ...prev,
      errorMessage: ''
    }))
  }, [])

  // Clear success message
  const clearSuccess = useCallback(() => {
    setRegistrationState(prev => ({
      ...prev,
      successMessage: ''
    }))
  }, [])

  return {
    // State
    registrationState,
    
    // Data
    registrationCost,
    userBalance,
    paymentInfo,
    metrics,
    rateLimits,
    
    // Loading states
    isLoadingCost,
    isLoadingBalance,
    isLoadingPaymentInfo,
    isLoadingMetrics,
    isLoadingRateLimits,
    isWriting,
    isConfirming,
    isConfirmed,
    
    // Actions
    processRegistration,
    resetRegistration,
    updateStep,
    clearError,
    clearSuccess,
    checkUniqueness,
    
    // Computed values
    canProceed: paymentInfo?.hasSufficientBalance && rateLimits?.canRegister,
    isReady: !!userAddress && !!registrationCost && !!userBalance && !!paymentInfo
  }
}
