import type { User } from '@/types'
import { supabase } from '@/lib/supabase'

// Helper function to convert Supabase user to app user
function mapSupabaseUserToUser(supabaseUser: any): User {
  return {
    fid: supabaseUser.fid,
    username: supabaseUser.username,
    displayName: supabaseUser.display_name,
    pfpUrl: supabaseUser.pfp_url,
    bio: supabaseUser.bio,
    followerCount: supabaseUser.follower_count,
    followingCount: supabaseUser.following_count,
    verifiedAddresses: supabaseUser.verified_addresses,
    battleTokens: supabaseUser.battle_tokens,
    credibilityScore: supabaseUser.credibility_score,
    verifiedPurchases: supabaseUser.verified_purchases,
    credibilityTier: supabaseUser.credibility_tier,
    voteStreak: supabaseUser.vote_streak,
    weeklyVoteCount: supabaseUser.weekly_vote_count,
    weeklyTerritoryBonus: supabaseUser.weekly_territory_bonus,
  }
}

// Helper function to convert app user to Supabase user
function mapUserToSupabase(user: Partial<User>): any {
  return {
    fid: user.fid,
    username: user.username,
    display_name: user.displayName,
    pfp_url: user.pfpUrl,
    bio: user.bio,
    follower_count: user.followerCount,
    following_count: user.followingCount,
    verified_addresses: user.verifiedAddresses,
    battle_tokens: user.battleTokens,
    credibility_score: user.credibilityScore,
    verified_purchases: user.verifiedPurchases,
    credibility_tier: user.credibilityTier,
    vote_streak: user.voteStreak,
    weekly_vote_count: user.weeklyVoteCount,
    weekly_territory_bonus: user.weeklyTerritoryBonus,
  }
}

export class UserService {
  static async getUser(fid: number): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('fid', fid)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return mapSupabaseUserToUser(user)
  }

  static async createUser(userData: User): Promise<User> {
    const { data: user, error } = await supabase
      .from('users')
      .insert(mapUserToSupabase(userData))
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return mapSupabaseUserToUser(user)
  }

  static async updateUser(fid: number, updates: Partial<User>): Promise<User | null> {
    const updateData = mapUserToSupabase(updates)
    delete updateData.fid // Don't update the primary key

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('fid', fid)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return mapSupabaseUserToUser(user)
  }

  static async getTopUsers(limit: number = 10): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('battle_tokens', { ascending: false })
      .order('credibility_score', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch top users: ${error.message}`)
    }

    return users.map(user => mapSupabaseUserToUser(user))
  }

  static async searchUsers(query: string): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20)

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`)
    }

    return users.map(user => mapSupabaseUserToUser(user))
  }

  static async updateUserStats(fid: number, stats: Partial<Pick<User, 'battleTokens' | 'credibilityScore' | 'verifiedPurchases' | 'voteStreak' | 'weeklyVoteCount' | 'weeklyTerritoryBonus'>>): Promise<User | null> {
    const updateData: any = {}
    
    if (stats.battleTokens !== undefined) updateData.battle_tokens = stats.battleTokens
    if (stats.credibilityScore !== undefined) updateData.credibility_score = stats.credibilityScore
    if (stats.verifiedPurchases !== undefined) updateData.verified_purchases = stats.verifiedPurchases
    if (stats.voteStreak !== undefined) updateData.vote_streak = stats.voteStreak
    if (stats.weeklyVoteCount !== undefined) updateData.weekly_vote_count = stats.weeklyVoteCount
    if (stats.weeklyTerritoryBonus !== undefined) updateData.weekly_territory_bonus = stats.weeklyTerritoryBonus

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('fid', fid)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to update user stats: ${error.message}`)
    }

    return mapSupabaseUserToUser(user)
  }

  static async getUserCount(): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to get user count: ${error.message}`)
    }

    return count || 0
  }

  static async getUsersByCredibilityTier(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('credibility_tier', tier)
      .order('credibility_score', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users by credibility tier: ${error.message}`)
    }

    return users.map(user => mapSupabaseUserToUser(user))
  }
} 