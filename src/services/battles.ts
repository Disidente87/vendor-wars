import type { Battle, Vendor, Vote, User, PaginationParams, PaginatedResponse } from '@/types'
import { BattleStatus } from '@/types'
import { generateBattleId } from '@/lib/utils'
import { FARCASTER_CONFIG } from '@/config/farcaster'

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const battles = new Map<string, Battle>()
const votes = new Map<string, Vote>()

export class BattleService {
  static async createBattle(data: {
    challenger: Vendor
    opponent: Vendor
    category: string
    description: string
  }): Promise<Battle> {
    const id = generateBattleId()
    const now = new Date()
    const endDate = new Date(now.getTime() + FARCASTER_CONFIG.FEATURES.BATTLE_DURATION_HOURS * 60 * 60 * 1000)

    const battle: Battle = {
      id,
      challenger: data.challenger,
      opponent: data.opponent,
      category: data.category as any,
      zone: data.challenger.zone || '',
      status: BattleStatus.ACTIVE,
      startDate: now,
      endDate,
      votes: [],
      totalVotes: 0,
      verifiedVotes: 0,
      description: data.description,
      territoryImpact: false,
    }

    battles.set(id, battle)
    return battle
  }

  static async getBattle(id: string): Promise<Battle | null> {
    return battles.get(id) || null
  }

  static async getActiveBattles(): Promise<Battle[]> {
    return Array.from(battles.values()).filter(
      battle => battle.status === BattleStatus.ACTIVE
    )
  }

  static async getBattlesByVendor(vendorId: string): Promise<Battle[]> {
    return Array.from(battles.values()).filter(
      battle => 
        battle.challenger.id === vendorId || 
        battle.opponent.id === vendorId
    )
  }

  static async getBattlesByCategory(category: string): Promise<Battle[]> {
    return Array.from(battles.values()).filter(
      battle => battle.category === category
    )
  }

  static async getAllBattles(params: PaginationParams): Promise<PaginatedResponse<Battle>> {
    const allBattles = Array.from(battles.values())
    const startIndex = (params.page - 1) * params.limit
    const endIndex = startIndex + params.limit
    const paginatedBattles = allBattles.slice(startIndex, endIndex)

    return {
      data: paginatedBattles,
      pagination: {
        hasNext: endIndex < allBattles.length,
        hasPrev: params.page > 1,
        nextCursor: endIndex < allBattles.length ? endIndex.toString() : undefined,
        prevCursor: params.page > 1 ? (startIndex - params.limit).toString() : undefined,
        total: allBattles.length,
      },
    }
  }

  static async vote(data: {
    battleId: string
    voter: User
    votedFor: Vendor
    reason?: string
  }): Promise<Vote | null> {
    const battle = battles.get(data.battleId)
    if (!battle || battle.status !== BattleStatus.ACTIVE) {
      return null
    }

    // Check if user already voted
    const existingVote = Array.from(votes.values()).find(
      vote => vote.battle.id === data.battleId && vote.voter.fid === data.voter.fid
    )

    if (existingVote) {
      return null
    }

    // REMOVED COOLDOWN CHECK: Allow immediate voting for testing
    // Check cooldown
    // const lastVote = Array.from(votes.values())
    //   .filter(vote => vote.voter.fid === data.voter.fid)
    //   .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

    // if (lastVote) {
    //   const timeSinceLastVote = Date.now() - lastVote.createdAt.getTime()
    //   const cooldownMs = FARCASTER_CONFIG.FEATURES.VOTE_COOLDOWN_MINUTES * 60 * 1000
      
    //   if (timeSinceLastVote < cooldownMs) {
    //     return null
    //   }
    // }

    const vote: Vote = {
      id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      voter: data.voter,
      battle,
      votedFor: data.votedFor,
      createdAt: new Date(),
      reason: data.reason,
      isVerified: false,
      tokenReward: FARCASTER_CONFIG.FEATURES.BASE_VOTE_TOKENS,
      multiplier: 1,
    }

    votes.set(vote.id, vote)
    
    // Update battle votes
    battle.votes.push(vote)
    battle.totalVotes = battle.votes.length
    
    battles.set(data.battleId, battle)

    return vote
  }

  static async getVotesForBattle(battleId: string): Promise<Vote[]> {
    return Array.from(votes.values()).filter(
      vote => vote.battle.id === battleId
    )
  }

  static async getUserVotes(userFid: number): Promise<Vote[]> {
    return Array.from(votes.values()).filter(
      vote => vote.voter.fid === userFid
    )
  }

  static async completeBattle(battleId: string): Promise<Battle | null> {
    const battle = battles.get(battleId)
    if (!battle || battle.status !== BattleStatus.ACTIVE) {
      return null
    }

    const challengerVotes = battle.votes.filter(
      vote => vote.votedFor.id === battle.challenger.id
    ).length

    const opponentVotes = battle.votes.filter(
      vote => vote.votedFor.id === battle.opponent.id
    ).length

    const winner = challengerVotes > opponentVotes ? battle.challenger : 
                  opponentVotes > challengerVotes ? battle.opponent : null

    const updatedBattle: Battle = {
      ...battle,
      status: BattleStatus.COMPLETED,
      winner: winner || undefined,
      endDate: new Date(),
    }

    battles.set(battleId, updatedBattle)
    return updatedBattle
  }

  static async cancelBattle(battleId: string, requesterFid: number): Promise<Battle | null> {
    const battle = battles.get(battleId)
    if (!battle || 
        (battle.challenger.owner.fid !== requesterFid && 
         battle.opponent.owner.fid !== requesterFid)) {
      return null
    }

    const updatedBattle: Battle = {
      ...battle,
      status: BattleStatus.CANCELLED,
      endDate: new Date(),
    }

    battles.set(battleId, updatedBattle)
    return updatedBattle
  }

  static async getBattleStats(battleId: string): Promise<{
    challengerVotes: number
    opponentVotes: number
    totalVotes: number
    challengerPercentage: number
    opponentPercentage: number
  } | null> {
    const battle = battles.get(battleId)
    if (!battle) return null

    const challengerVotes = battle.votes.filter(
      vote => vote.votedFor.id === battle.challenger.id
    ).length

    const opponentVotes = battle.votes.filter(
      vote => vote.votedFor.id === battle.opponent.id
    ).length

    const totalVotes = challengerVotes + opponentVotes

    return {
      challengerVotes,
      opponentVotes,
      totalVotes,
      challengerPercentage: totalVotes > 0 ? (challengerVotes / totalVotes) * 100 : 0,
      opponentPercentage: totalVotes > 0 ? (opponentVotes / totalVotes) * 100 : 0,
    }
  }

  static async getRecentBattles(limit: number = 10): Promise<Battle[]> {
    return Array.from(battles.values())
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .slice(0, limit)
  }

  static async getCompletedBattles(): Promise<Battle[]> {
    return Array.from(battles.values()).filter(
      battle => battle.status === BattleStatus.COMPLETED
    )
  }

  static async getBattleCount(): Promise<number> {
    return battles.size
  }

  static async getActiveBattleCount(): Promise<number> {
    return Array.from(battles.values()).filter(
      battle => battle.status === BattleStatus.ACTIVE
    ).length
  }
} 