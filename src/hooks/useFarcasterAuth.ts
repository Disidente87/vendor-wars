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
            setUser(result.data)
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

      // Store user in localStorage for persistence
      localStorage.setItem('farcaster-auth-user', JSON.stringify(newUser))
      
      setUser(newUser)
      setIsAuthenticated(true)
      setError(null)
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