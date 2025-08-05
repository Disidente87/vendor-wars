import { useState, useEffect, useCallback } from 'react'
import { useQuickAuth } from './useQuickAuth'

export function useVoteStreak() {
  const { authenticatedUser } = useQuickAuth()
  const [streak, setStreak] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStreak = useCallback(async () => {
    if (!authenticatedUser) {
      setStreak(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/users/streak?userFid=${authenticatedUser.fid}`)
      const result = await response.json()
      
      if (result.success) {
        setStreak(result.data.streak)
      } else {
        setError(result.error || 'Failed to fetch streak')
      }
    } catch (error) {
      console.error('Error fetching vote streak:', error)
      setError('Failed to fetch streak')
    } finally {
      setLoading(false)
    }
  }, [authenticatedUser])

  const refreshStreak = () => {
    fetchStreak()
  }

  useEffect(() => {
    fetchStreak()
  }, [authenticatedUser?.fid, fetchStreak])

  return {
    streak,
    loading,
    error,
    refreshStreak
  }
} 