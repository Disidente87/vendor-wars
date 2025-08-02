import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import { FARCASTER_CONFIG } from '@/config/farcaster'
import type { User } from '@/types'

const neynarClient = new NeynarAPIClient(FARCASTER_CONFIG.NEYNAR_API_KEY)

export class FarcasterService {
  static async getUserByFid(fid: number): Promise<User | null> {
    try {
      const response = await neynarClient.lookupUserByFid(fid)
      
      if (!response.result?.user) {
        return null
      }

      const user = response.result.user
      
      return {
        fid: user.fid,
        username: user.username || '',
        displayName: user.displayName || '',
        pfpUrl: user.pfp?.url || '',
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        bio: user.profile?.bio?.text || '',
        verifiedAddresses: user.verifiedAddresses?.ethAddresses || [],
      }
    } catch (error) {
      console.error('Error fetching user by FID:', error)
      return null
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const response = await neynarClient.lookupUserByUsername(username)
      
      if (!response.result?.user) {
        return null
      }

      const user = response.result.user
      
      return {
        fid: user.fid,
        username: user.username || '',
        displayName: user.displayName || '',
        pfpUrl: user.pfp?.url || '',
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        bio: user.profile?.bio?.text || '',
        verifiedAddresses: user.verifiedAddresses?.ethAddresses || [],
      }
    } catch (error) {
      console.error('Error fetching user by username:', error)
      return null
    }
  }

  static async getUsersByFids(fids: number[]): Promise<User[]> {
    try {
      const response = await neynarClient.fetchBulkUsers(fids)
      
      if (!response.result?.users) {
        return []
      }

      return response.result.users.map(user => ({
        fid: user.fid,
        username: user.username || '',
        displayName: user.displayName || '',
        pfpUrl: user.pfp?.url || '',
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        bio: user.profile?.bio?.text || '',
        verifiedAddresses: user.verifiedAddresses?.ethAddresses || [],
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
      const response = await neynarClient.getUserFollowers(fid, { limit })
      
      if (!response.result?.users) {
        return []
      }

      return response.result.users.map(user => ({
        fid: user.fid,
        username: user.username || '',
        displayName: user.displayName || '',
        pfpUrl: user.pfp?.url || '',
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        bio: user.profile?.bio?.text || '',
        verifiedAddresses: user.verifiedAddresses?.ethAddresses || [],
      }))
    } catch (error) {
      console.error('Error fetching followers:', error)
      return []
    }
  }

  static async getFollowing(fid: number, limit: number = 50): Promise<User[]> {
    try {
      const response = await neynarClient.getUserFollowing(fid, { limit })
      
      if (!response.result?.users) {
        return []
      }

      return response.result.users.map(user => ({
        fid: user.fid,
        username: user.username || '',
        displayName: user.displayName || '',
        pfpUrl: user.pfp?.url || '',
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        bio: user.profile?.bio?.text || '',
        verifiedAddresses: user.verifiedAddresses?.ethAddresses || [],
      }))
    } catch (error) {
      console.error('Error fetching following:', error)
      return []
    }
  }
} 