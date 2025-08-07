'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'

interface TransactionState {
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  error: string | null
  hash: string | null
}

export function useWalletTransactions() {
  const { address, isConnected } = useAccount()
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    hash: null
  })

  const { writeContract, isPending: isWritePending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: transactionState.hash as `0x${string}` | undefined,
  })

  const sendTransaction = async (to: string, amount: string) => {
    if (!isConnected || !address) {
      setTransactionState(prev => ({
        ...prev,
        isError: true,
        error: 'Wallet not connected'
      }))
      return
    }

    setTransactionState({
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      hash: null
    })

    try {
      // This is a placeholder for actual contract interaction
      // In a real implementation, you would call writeContract with your contract
      console.log('Sending transaction:', { to, amount, from: address })
      
      // Simulate transaction for now
      setTimeout(() => {
        setTransactionState({
          isPending: false,
          isSuccess: true,
          isError: false,
          error: null,
          hash: '0x1234567890abcdef' as `0x${string}`
        })
      }, 2000)

    } catch (error) {
      console.error('Transaction error:', error)
      setTransactionState(prev => ({
        ...prev,
        isPending: false,
        isError: true,
        error: error instanceof Error ? error.message : 'Transaction failed'
      }))
    }
  }

  const resetTransactionState = () => {
    setTransactionState({
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      hash: null
    })
  }

  return {
    // State
    isConnected,
    address,
    transactionState,
    isWritePending,
    isConfirming,
    isConfirmed,
    
    // Actions
    sendTransaction,
    resetTransactionState,
    
    // Utilities
    formatEther,
    parseEther
  }
}
