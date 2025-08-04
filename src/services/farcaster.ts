import { FARCASTER_CONFIG } from '@/config/farcaster'
import type { User } from '@/types'

export class FarcasterService {
  static async getUserByFid(fid: number): Promise<User | null> {
    try {
      // Use Neynar API to get real user data
      const response = await fetch(`${FARCASTER_CONFIG.NEYNAR_BASE_URL}/farcaster/user/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': FARCASTER_CONFIG.NEYNAR_API_KEY,
        },
        body: JSON.stringify({
          fids: [fid]
        })
      })

      if (!response.ok) {
        console.error('Neynar API error:', response.status, response.statusText)
        return null
      }

      const data = await response.json()
      
      if (data.users && data.users.length > 0) {
        const neynarUser = data.users[0]
        
        // Get user's token balance from our database
        const tokenBalance = await this.getUserTokenBalance(fid)
        
        return {
          fid: neynarUser.fid,
          username: neynarUser.username,
          displayName: neynarUser.displayName,
          pfpUrl: neynarUser.pfpUrl,
          followerCount: neynarUser.followerCount,
          followingCount: neynarUser.followingCount,
          bio: neynarUser.bio,
          verifiedAddresses: neynarUser.verifiedAddresses || [],
          battleTokens: tokenBalance,
          credibilityScore: await this.getUserCredibilityScore(fid),
          verifiedPurchases: await this.getUserVerifiedPurchases(fid),
          credibilityTier: await this.getUserCredibilityTier(fid),
          voteStreak: await this.getUserVoteStreak(fid),
          weeklyVoteCount: await this.getUserWeeklyVoteCount(fid),
          weeklyTerritoryBonus: await this.getUserWeeklyTerritoryBonus(fid),
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching user by FID:', error)
      return null
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      // Use Neynar API to get user by username
      const response = await fetch(`${FARCASTER_CONFIG.NEYNAR_BASE_URL}/farcaster/user/search?q=${username}`, {
        headers: {
          'api_key': FARCASTER_CONFIG.NEYNAR_API_KEY,
        }
      })

      if (!response.ok) {
        console.error('Neynar API error:', response.status, response.statusText)
        return null
      }

      const data = await response.json()
      
      if (data.users && data.users.length > 0) {
        const neynarUser = data.users[0]
        return this.getUserByFid(neynarUser.fid)
      }

      return null
    } catch (error) {
      console.error('Error fetching user by username:', error)
      return null
    }
  }

  static async getUsersByFids(fids: number[]): Promise<User[]> {
    try {
      const users: User[] = []
      
      // Process in batches of 100 (Neynar API limit)
      for (let i = 0; i < fids.length; i += 100) {
        const batch = fids.slice(i, i + 100)
        
        const response = await fetch(`${FARCASTER_CONFIG.NEYNAR_BASE_URL}/farcaster/user/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_key': FARCASTER_CONFIG.NEYNAR_API_KEY,
          },
          body: JSON.stringify({
            fids: batch
          })
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.users) {
            for (const neynarUser of data.users) {
              const user = await this.getUserByFid(neynarUser.fid)
              if (user) {
                users.push(user)
              }
            }
          }
        }
      }

      return users
    } catch (error) {
      console.error('Error fetching users by FIDs:', error)
      return []
    }
  }

  // Helper methods to get user-specific data from our database
  private static async getUserTokenBalance(fid: number): Promise<number> {
    try {
      // This would query your database for the user's token balance
      // For now, return a default value
      return 0
    } catch (error) {
      console.error('Error getting user token balance:', error)
      return 0
    }
  }

  private static async getUserCredibilityScore(fid: number): Promise<number> {
    try {
      // This would query your database for the user's credibility score
      return 50 // Default score
    } catch (error) {
      console.error('Error getting user credibility score:', error)
      return 50
    }
  }

  private static async getUserVerifiedPurchases(fid: number): Promise<number> {
    try {
      // This would query your database for the user's verified purchases count
      return 0
    } catch (error) {
      console.error('Error getting user verified purchases:', error)
      return 0
    }
  }

  private static async getUserCredibilityTier(fid: number): Promise<'bronze' | 'silver' | 'gold' | 'platinum'> {
    try {
      // This would query your database for the user's credibility tier
      return 'bronze'
    } catch (error) {
      console.error('Error getting user credibility tier:', error)
      return 'bronze'
    }
  }

  private static async getUserVoteStreak(fid: number): Promise<number> {
    try {
      // This would query your database for the user's vote streak
      return 0
    } catch (error) {
      console.error('Error getting user vote streak:', error)
      return 0
    }
  }

  private static async getUserWeeklyVoteCount(fid: number): Promise<number> {
    try {
      // This would query your database for the user's weekly vote count
      return 0
    } catch (error) {
      console.error('Error getting user weekly vote count:', error)
      return 0
    }
  }

  private static async getUserWeeklyTerritoryBonus(fid: number): Promise<number> {
    try {
      // This would query your database for the user's weekly territory bonus
      return 0
    } catch (error) {
      console.error('Error getting user weekly territory bonus:', error)
      return 0
    }
  }
} 