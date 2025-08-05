'use client'

import { useState, useEffect } from 'react'
import { useMiniApp } from '@neynar/react'
import type { User } from '@/types'

interface UseFarcasterAuthReturn {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => void
  error: string | null
}

export function useFarcasterAuth(): UseFarcasterAuthReturn {
  const { isSDKLoaded, context } = useMiniApp()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to check and reset streak if needed
  const checkAndResetStreak = async (userFid: number) => {
    try {
      const response = await fetch('/api/users/streak/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userFid: userFid.toString() }),
      })
      
      const result = await response.json()
      if (result.success) {
        console.log('Streak checked and reset if needed:', result.data)
        return result.data.streak
      }
    } catch (error) {
      console.error('Error checking streak:', error)
    }
    return null
  }

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isSDKLoaded || !context) {
        setIsLoading(false)
        return
      }

      try {
        // Check if user is already authenticated
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        // Get the current user from the Mini App context
        const currentUser = context.user
        
        if (currentUser && currentUser.fid) {
          // Fetch user details from our API
          const response = await fetch(`/api/auth/farcaster?fid=${currentUser.fid}`)
          const result = await response.json()
          
          if (result.success) {
            // Check and reset streak if needed
            const updatedStreak = await checkAndResetStreak(currentUser.fid)
            
            // Update user with potentially corrected streak
            const updatedUser = {
              ...result.data,
              voteStreak: updatedStreak !== null ? updatedStreak : result.data.voteStreak
            }
            
            setUser(updatedUser)
            setIsAuthenticated(true)
          } else {
            // Create new user if not found
            await createNewUser(currentUser)
          }
        }
      } catch (err) {
        console.error('Error initializing Farcaster auth:', err)
        setError('Failed to initialize authentication')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isSDKLoaded, context])

  const createNewUser = async (farcasterUser: any) => {
    try {
      const newUser: User = {
        fid: farcasterUser.fid,
        username: farcasterUser.username || `user_${farcasterUser.fid}`,
        displayName: farcasterUser.displayName || `User ${farcasterUser.fid}`,
        pfpUrl: farcasterUser.pfpUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${farcasterUser.fid}`,
        followerCount: farcasterUser.followerCount || 0,
        followingCount: farcasterUser.followingCount || 0,
        bio: farcasterUser.bio || 'Vendor Wars enthusiast',
        verifiedAddresses: farcasterUser.verifiedAddresses || [],
        battleTokens: 0,
        credibilityScore: 50,
        verifiedPurchases: 0,
        credibilityTier: 'bronze',
        voteStreak: 0,
        weeklyVoteCount: 0,
        weeklyTerritoryBonus: 0,
      }

      // Save user to database
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: newUser.fid,
          username: newUser.username,
          displayName: newUser.displayName,
          pfpUrl: newUser.pfpUrl,
          followerCount: newUser.followerCount,
          followingCount: newUser.followingCount,
          bio: newUser.bio,
          verifiedAddresses: newUser.verifiedAddresses,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Update user with database data
        const dbUser = result.data
        const updatedUser: User = {
          ...newUser,
          battleTokens: dbUser.battle_tokens || 0,
          credibilityScore: dbUser.credibility_score || 50,
          verifiedPurchases: dbUser.verified_purchases || 0,
          credibilityTier: dbUser.credibility_tier || 'bronze',
          voteStreak: dbUser.vote_streak || 0,
          weeklyVoteCount: dbUser.weekly_vote_count || 0,
          weeklyTerritoryBonus: dbUser.weekly_territory_bonus || 0,
        }

        // Store user in localStorage for persistence
        localStorage.setItem('farcaster-auth-user', JSON.stringify(updatedUser))
        
        setUser(updatedUser)
        setIsAuthenticated(true)
        setError(null)
        
        console.log('User created/updated in database:', updatedUser)
      } else {
        console.error('Failed to save user to database:', result.error)
        // Still set user locally even if database save fails
        localStorage.setItem('farcaster-auth-user', JSON.stringify(newUser))
        setUser(newUser)
        setIsAuthenticated(true)
        setError(null)
      }
    } catch (err) {
      console.error('Error creating new user:', err)
      setError('Failed to create user profile')
    }
  }

  const signIn = async () => {
    if (!isSDKLoaded || !context) {
      setError('Mini App SDK not loaded')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      
      // Trigger authentication flow
      await sdk.actions.ready()
      
      // Get user from context
      const currentUser = context.user
      
      if (currentUser && currentUser.fid) {
        await createNewUser(currentUser)
      } else {
        setError('No user found in Mini App context')
      }
    } catch (err) {
      console.error('Error during sign in:', err)
      setError('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('farcaster-auth-user')
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
  }

  return {
    isAuthenticated,
    user,
    isLoading,
    signIn,
    signOut,
    error
  }
} 