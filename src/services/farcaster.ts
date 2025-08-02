import { FARCASTER_CONFIG } from '@/config/farcaster'
import type { User } from '@/types'

// Mock implementation for development
// TODO: Implement proper Neynar API integration

export class FarcasterService {
  static async getUserByFid(fid: number): Promise<User | null> {
    try {
      // Mock user data for development
      return {
        fid,
        username: `user_${fid}`,
        displayName: `User ${fid}`,
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
        followerCount: Math.floor(Math.random() * 1000),
        followingCount: Math.floor(Math.random() * 500),
        bio: `Vendor Wars enthusiast #${fid}`,
        verifiedAddresses: [],
        battleTokens: Math.floor(Math.random() * 1000),
        credibilityScore: Math.floor(Math.random() * 100),
        verifiedPurchases: Math.floor(Math.random() * 50),
        credibilityTier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)] as any,
        voteStreak: Math.floor(Math.random() * 7),
        weeklyVoteCount: Math.floor(Math.random() * 20),
        weeklyTerritoryBonus: Math.floor(Math.random() * 100),
      }
    } catch (error) {
      console.error('Error fetching user by FID:', error)
      return null
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      // Mock implementation
      const mockFid = Math.floor(Math.random() * 10000)
      return {
        fid: mockFid,
        username,
        displayName: `User ${mockFid}`,
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockFid}`,
        followerCount: Math.floor(Math.random() * 1000),
        followingCount: Math.floor(Math.random() * 500),
        bio: `Vendor Wars enthusiast`,
        verifiedAddresses: [],
        battleTokens: Math.floor(Math.random() * 1000),
        credibilityScore: Math.floor(Math.random() * 100),
        verifiedPurchases: Math.floor(Math.random() * 50),
        credibilityTier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)] as any,
        voteStreak: Math.floor(Math.random() * 7),
        weeklyVoteCount: Math.floor(Math.random() * 20),
        weeklyTerritoryBonus: Math.floor(Math.random() * 100),
      }
    } catch (error) {
      console.error('Error fetching user by username:', error)
      return null
    }
  }

  static async getUsersByFids(fids: number[]): Promise<User[]> {
    try {
      // Mock implementation
      return fids.map(fid => ({
        fid,
        username: `user_${fid}`,
        displayName: `User ${fid}`,
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
        followerCount: Math.floor(Math.random() * 1000),
        followingCount: Math.floor(Math.random() * 500),
        bio: `Vendor Wars enthusiast #${fid}`,
        verifiedAddresses: [],
        battleTokens: Math.floor(Math.random() * 1000),
        credibilityScore: Math.floor(Math.random() * 100),
        verifiedPurchases: Math.floor(Math.random() * 50),
        credibilityTier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)] as any,
        voteStreak: Math.floor(Math.random() * 7),
        weeklyVoteCount: Math.floor(Math.random() * 20),
        weeklyTerritoryBonus: Math.floor(Math.random() * 100),
      }))
    } catch (error) {
      console.error('Error fetching users by FIDs:', error)
      return []
    }
  }

  static async validateUserToken(token: string): Promise<User | null> {
    try {
      // This would typically validate a JWT or similar token
      // For now, we'll return null as this needs to be implemented
      // based on your specific authentication flow
      return null
    } catch (error) {
      console.error('Error validating user token:', error)
      return null
    }
  }

  static async getFollowers(fid: number, limit: number = 50): Promise<User[]> {
    try {
      // Mock implementation
      const mockFollowers = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        fid: fid + 1000 + i,
        username: `follower_${fid + 1000 + i}`,
        displayName: `Follower ${fid + 1000 + i}`,
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid + 1000 + i}`,
        followerCount: Math.floor(Math.random() * 1000),
        followingCount: Math.floor(Math.random() * 500),
        bio: `Vendor Wars follower`,
        verifiedAddresses: [],
        battleTokens: Math.floor(Math.random() * 1000),
        credibilityScore: Math.floor(Math.random() * 100),
        verifiedPurchases: Math.floor(Math.random() * 50),
        credibilityTier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)] as any,
        voteStreak: Math.floor(Math.random() * 7),
        weeklyVoteCount: Math.floor(Math.random() * 20),
        weeklyTerritoryBonus: Math.floor(Math.random() * 100),
      }))
      return mockFollowers
    } catch (error) {
      console.error('Error fetching followers:', error)
      return []
    }
  }

  static async getFollowing(fid: number, limit: number = 50): Promise<User[]> {
    try {
      // Mock implementation
      const mockFollowing = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        fid: fid + 2000 + i,
        username: `following_${fid + 2000 + i}`,
        displayName: `Following ${fid + 2000 + i}`,
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid + 2000 + i}`,
        followerCount: Math.floor(Math.random() * 1000),
        followingCount: Math.floor(Math.random() * 500),
        bio: `Vendor Wars following`,
        verifiedAddresses: [],
        battleTokens: Math.floor(Math.random() * 1000),
        credibilityScore: Math.floor(Math.random() * 100),
        verifiedPurchases: Math.floor(Math.random() * 50),
        credibilityTier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)] as any,
        voteStreak: Math.floor(Math.random() * 7),
        weeklyVoteCount: Math.floor(Math.random() * 20),
        weeklyTerritoryBonus: Math.floor(Math.random() * 100),
      }))
      return mockFollowing
    } catch (error) {
      console.error('Error fetching following:', error)
      return []
    }
  }
} 