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
          console.log('Found user in Mini App context:', currentUser.fid)
          
          // Fetch user details from our API
          const response = await fetch(`/api/auth/farcaster?fid=${currentUser.fid}`)
          const result = await response.json()
          
          if (result.success) {
            console.log('User found in database, authenticating...')
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
            console.log('User not found in database, will create on sign in')
            // Don't create user automatically - wait for sign in
            setUser(null)
            setIsAuthenticated(false)
          }
        } else {
          console.log('No user in Mini App context')
          setUser(null)
          setIsAuthenticated(false)
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
      console.log('Creating new user with FID:', farcasterUser.fid)
      
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

      console.log('Sending user data to API:', {
        fid: newUser.fid,
        username: newUser.username,
        displayName: newUser.displayName,
        pfpUrl: newUser.pfpUrl,
      })

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
        }),
      })

      const result = await response.json()
      console.log('API response:', result)
      
      if (result.success) {
        console.log('User created successfully in database')
        // Update user with database data
        const dbUser = result.data
        const updatedUser: User = {
          ...newUser,
          battleTokens: dbUser.battle_tokens || 0,
          voteStreak: dbUser.vote_streak || 0,
          // Set default values for fields not in simplified schema
          credibilityScore: 50,
          verifiedPurchases: 0,
          credibilityTier: 'bronze',
          weeklyVoteCount: 0,
          weeklyTerritoryBonus: 0,
        }

        // Store user in localStorage for persistence
        localStorage.setItem('farcaster-auth-user', JSON.stringify(updatedUser))
        
        setUser(updatedUser)
        setIsAuthenticated(true)
        setError(null)
        
        console.log('User created and authenticated:', updatedUser)
      } else {
        console.error('Failed to save user to database:', result.error)
        setError(`Failed to create user: ${result.error}`)
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
      console.log('Starting sign in process...')
      const { sdk } = await import('@farcaster/miniapp-sdk')
      
      // Trigger authentication flow
      await sdk.actions.ready()
      console.log('SDK ready, getting user from context...')
      
      // Get user from context
      const currentUser = context.user
      
      if (currentUser && currentUser.fid) {
        console.log('User found in context:', currentUser.fid)
        
        // Check if user exists in database first
        const response = await fetch(`/api/auth/farcaster?fid=${currentUser.fid}`)
        const result = await response.json()
        
        if (result.success) {
          console.log('User exists in database, authenticating...')
          // User exists - authenticate
          const updatedStreak = await checkAndResetStreak(currentUser.fid)
          const updatedUser = {
            ...result.data,
            voteStreak: updatedStreak !== null ? updatedStreak : result.data.voteStreak
          }
          
          setUser(updatedUser)
          setIsAuthenticated(true)
          console.log('Authentication successful')
        } else {
          console.log('User not found in database, creating new user...')
          // User not found - create new user
          await createNewUser(currentUser)
        }
      } else {
        console.log('No user found in Mini App context')
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