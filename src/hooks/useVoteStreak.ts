import { useState, useEffect, useCallback } from 'react'
import { useFarcasterAuth } from './useFarcasterAuth'

export function useVoteStreak() {
  const { user: authenticatedUser } = useFarcasterAuth()
  const [streak, setStreak] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchStreak = useCallback(async () => {
    if (!authenticatedUser) {
      setStreak(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Usar la nueva API que prioriza la base de datos
      const response = await fetch(`/api/users/streak?userFid=${authenticatedUser.fid}`)
      const result = await response.json()
      
      if (result.success) {
        setStreak(result.data.streak)
        setLastUpdated(result.data.timestamp)
        console.log(`🔥 Streak actualizado: ${result.data.streak} (fuente: ${result.data.source})`)
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

  const refreshStreak = useCallback(async () => {
    if (!authenticatedUser) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Forzar recálculo del streak desde la base de datos
      const response = await fetch('/api/users/streak/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userFid: authenticatedUser.fid }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStreak(result.data.streak)
        setLastUpdated(result.data.timestamp)
        console.log(`🔄 Streak recalculado: ${result.data.streak} (fuente: ${result.data.source})`)
      } else {
        setError(result.error || 'Failed to refresh streak')
      }
    } catch (error) {
      console.error('Error refreshing streak:', error)
      setError('Failed to refresh streak')
    } finally {
      setLoading(false)
    }
  }, [authenticatedUser])

  useEffect(() => {
    fetchStreak()
  }, [authenticatedUser?.fid, fetchStreak])

  return {
    streak,
    loading,
    error,
    lastUpdated,
    refreshStreak,
    fetchStreak
  }
} 