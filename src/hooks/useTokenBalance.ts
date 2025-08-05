import { useState, useEffect, useCallback } from 'react'
import { useQuickAuth } from './useQuickAuth'

export function useTokenBalance() {
  const { authenticatedUser } = useQuickAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!authenticatedUser) {
      setBalance(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/tokens/balance?fid=${authenticatedUser.fid}`)
      const result = await response.json()
      
      if (result.success) {
        setBalance(result.data.balance)
      } else {
        setError(result.error || 'Failed to fetch balance')
      }
    } catch (error) {
      console.error('Error fetching token balance:', error)
      setError('Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }, [authenticatedUser])

  const refreshBalance = () => {
    fetchBalance()
  }

  useEffect(() => {
    fetchBalance()
  }, [authenticatedUser?.fid, fetchBalance])

  return {
    balance,
    loading,
    error,
    refreshBalance
  }
} 