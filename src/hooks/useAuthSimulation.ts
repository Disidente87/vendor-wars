import { useState, useEffect } from 'react'
import type { User } from '@/types'
import { UserService } from '@/services/users'

// Mock user data for development (fallback)
const mockUser: User = {
  fid: 12345,
  username: 'disidente87',
  displayName: 'Disidente',
  pfpUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Vendor Wars enthusiast 🏪⚔️',
  followerCount: 1234,
  followingCount: 567,
  verifiedAddresses: [],
  battleTokens: 2500,
  credibilityScore: 95,
  verifiedPurchases: 42,
  credibilityTier: 'gold',
  voteStreak: 7,
  weeklyVoteCount: 15,
  weeklyTerritoryBonus: 200
}

export function useAuthSimulation() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true)
        setError(null)

        // Try to load user from Supabase first
        const supabaseUser = await UserService.getUser(mockUser.fid)
        
        if (supabaseUser) {
          setUser(supabaseUser)
        } else {
          // If user doesn't exist in Supabase, create them
          try {
            const newUser = await UserService.createUser(mockUser)
            setUser(newUser)
          } catch (createError) {
            console.warn('Failed to create user in Supabase, using mock data:', createError)
            setUser(mockUser)
          }
        }
      } catch (err) {
        console.warn('Failed to load user from Supabase, using mock data:', err)
        setUser(mockUser)
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return

    try {
      const updatedUser = await UserService.updateUser(user.fid, updates)
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (err) {
      console.error('Failed to update user:', err)
      // Fallback to local update
      setUser(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const updateUserStats = async (stats: Partial<Pick<User, 'battleTokens' | 'credibilityScore' | 'verifiedPurchases' | 'voteStreak' | 'weeklyVoteCount' | 'weeklyTerritoryBonus'>>) => {
    if (!user) return

    try {
      const updatedUser = await UserService.updateUserStats(user.fid, stats)
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (err) {
      console.error('Failed to update user stats:', err)
      // Fallback to local update
      setUser(prev => prev ? { ...prev, ...stats } : null)
    }
  }

  return {
    user,
    isLoading,
    error,
    updateUser,
    updateUserStats,
    isAuthenticated: !!user
  }
} 