import { useState, useEffect } from 'react'

// Simulated user data for development
const mockUser = {
  fid: 12345,
  username: 'disidente',
  displayName: 'Disidente',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Vendor Wars enthusiast | Local food lover',
  followersCount: 1234,
  followingCount: 567,
  verifiedAddresses: [
    {
      address: '0x1234567890abcdef',
      chainId: 8453, // Base
      type: 'Ethereum'
    }
  ]
}

export function useAuthSimulation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate authentication check
    const timer = setTimeout(() => {
      // For development, always simulate authenticated state
      setIsAuthenticated(true)
      setUser(mockUser)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const signOut = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return {
    isAuthenticated,
    user,
    isLoading,
    signOut
  }
} 