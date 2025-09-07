'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useContractRead, useContractWrite } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { VENDOR_WARS_EXTENDED_ABI } from '@/contracts/VendorWarsExtendedABI'
import { PAYMENT_CONFIG } from '@/config/payment'

// ABI para el token BATTLE
const BATTLE_TOKEN_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

const BATTLE_TOKEN_ADDRESS = PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`
const VENDOR_WARS_EXTENDED_ADDRESS = PAYMENT_CONFIG.VENDOR_WARS_EXTENDED.ADDRESS as `0x${string}`
const REQUIRED_AMOUNT = parseEther(PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString())

export interface ReviewState {
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

export function useVendorWarsExtendedReview() {
  const [reviewState, setReviewState] = useState<ReviewState>({
    isConnected: false,
    hasSufficientBalance: false,
    isApproved: false,
    isTransactionPending: false,
    isTransactionConfirmed: false,
    error: null,
    balance: '0',
    requiredAmount: PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString(),
    allowance: '0'
  })


  const { address, isConnected } = useAccount()

  // Leer balance del token BATTLE
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: BATTLE_TOKEN_ADDRESS
  })

  // Leer allowance del token BATTLE
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: BATTLE_TOKEN_ADDRESS,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, VENDOR_WARS_EXTENDED_ADDRESS] : undefined
  })

  // Verificar si el contrato está pausado
  const { data: isPaused } = useContractRead({
    address: VENDOR_WARS_EXTENDED_ADDRESS,
    abi: VENDOR_WARS_EXTENDED_ABI,
    functionName: 'paused'
  })

  // Aprobar tokens
  const { writeContract: approveTokens, isPending: isApproving } = useContractWrite({
    mutation: {
      onSuccess: () => {
        console.log('✅ Tokens aprobados exitosamente')
        refetchAllowance()
      },
      onError: (error: any) => {
        console.error('❌ Error aprobando tokens:', error)
        setReviewState(prev => ({ ...prev, error: error.message }))
      }
    }
  })

  // Submitir review
  const { writeContract: submitReview, isPending: isSubmittingReview } = useContractWrite({
    mutation: {
      onSuccess: (data: any) => {
        console.log('✅ Review submitido exitosamente:', data)
        setReviewState(prev => ({ 
          ...prev, 
          isTransactionConfirmed: true,
          isTransactionPending: false,
          error: null
        }))
      },
      onError: (error: any) => {
        console.error('❌ Error submitiendo review:', error)
        setReviewState(prev => ({ 
          ...prev, 
          error: error.message,
          isTransactionPending: false
        }))
      }
    }
  })

  // Actualizar estado cuando cambien los datos
  useEffect(() => {
    if (!isConnected || !address) {
      setReviewState(prev => ({
        ...prev,
        isConnected: false,
        hasSufficientBalance: false,
        isApproved: false,
        error: null
      }))
      return
    }

    const balanceWei = balance?.value || 0n
    const allowanceWei = allowance || 0n
    const hasBalance = balanceWei >= parseEther(PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString())
    const hasAllowance = allowanceWei >= parseEther(PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString())

    setReviewState(prev => ({
      ...prev,
      isConnected: true,
      hasSufficientBalance: hasBalance,
      isApproved: hasAllowance,
      balance: formatEther(balanceWei),
      allowance: formatEther(allowanceWei),
      error: isPaused ? 'El contrato está pausado temporalmente' : null
    }))
  }, [isConnected, address, balance, allowance, isPaused])

  // Función para aprobar tokens
  const approveTokensForReview = useCallback(async () => {
    if (!address || !approveTokens) return

    try {
      setReviewState(prev => ({ ...prev, error: null, isTransactionPending: true }))
      
      await approveTokens({
        address: BATTLE_TOKEN_ADDRESS,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'approve',
        args: [VENDOR_WARS_EXTENDED_ADDRESS, parseEther(PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString())]
      })
    } catch (error: any) {
      console.error('Error aprobando tokens:', error)
      setReviewState(prev => ({ 
        ...prev, 
        error: error.message || 'Error aprobando tokens',
        isTransactionPending: false
      }))
    }
  }, [address, approveTokens])

  // Función para submitir review
  const submitReviewTransaction = useCallback(async (
    vendorId: string,
    reviewContent: string,
    userFid: number
  ) => {
    if (!address || !submitReview) return

    try {
      setReviewState(prev => ({ ...prev, error: null, isTransactionPending: true }))
      
      // Preparar datos del review
      const reviewData = JSON.stringify({
        vendorId,
        content: reviewContent,
        userFid,
        timestamp: Date.now()
      })

      // Generar ID único para el review
      const reviewId = `review_${vendorId}_${userFid}_${Date.now()}`

      await submitReview({
        address: VENDOR_WARS_EXTENDED_ADDRESS,
        abi: VENDOR_WARS_EXTENDED_ABI,
        functionName: 'submitReview',
        args: [address, parseEther(PAYMENT_CONFIG.BATTLE_TOKEN.REVIEW_COST.toString()), reviewData, reviewId]
      })
    } catch (error: any) {
      console.error('Error submitiendo review:', error)
      setReviewState(prev => ({ 
        ...prev, 
        error: error.message || 'Error submitiendo review',
        isTransactionPending: false
      }))
    }
  }, [address, submitReview])

  // Función para resetear estado
  const resetState = useCallback(() => {
    setReviewState(prev => ({
      ...prev,
      isTransactionPending: false,
      isTransactionConfirmed: false,
      error: null
    }))
  }, [])

  // Función para refrescar datos
  const refreshData = useCallback(() => {
    refetchBalance()
    refetchAllowance()
  }, [refetchBalance, refetchAllowance])

  return {
    reviewState,
    approveTokensForReview,
    submitReviewTransaction,
    resetState,
    refreshData,
    isApproving,
    isSubmittingReview,
    isPaused: isPaused || false
  }
}
