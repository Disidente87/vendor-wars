import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from '@/services/vendors'
import { BattleService } from '@/services/battles'
import type { LeaderboardEntry } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || 'winRate'

    let vendors: any[] = []

    if (category) {
      vendors = await VendorService.getVendorsByCategory(category as any)
    } else {
      vendors = await VendorService.getTopVendors(limit * 2) // Get more to filter
    }

    // Create leaderboard entries
    const leaderboardEntries: LeaderboardEntry[] = vendors.map((vendor, index) => ({
      rank: index + 1,
      vendor,
      totalWins: vendor.stats.wins,
      totalBattles: vendor.stats.totalBattles,
      winRate: vendor.stats.winRate,
      totalRevenue: vendor.stats.totalRevenue,
      territoryDefenses: vendor.stats.territoryDefenses,
      zone: vendor.zone,
    }))

    // Sort based on type
    switch (type) {
      case 'winRate':
        leaderboardEntries.sort((a, b) => b.winRate - a.winRate)
        break
      case 'totalWins':
        leaderboardEntries.sort((a, b) => b.totalWins - a.totalWins)
        break
      case 'totalBattles':
        leaderboardEntries.sort((a, b) => b.totalBattles - a.totalBattles)
        break
      case 'totalRevenue':
        leaderboardEntries.sort((a, b) => b.totalRevenue - a.totalRevenue)
        break
      default:
        leaderboardEntries.sort((a, b) => b.winRate - a.winRate)
    }

    // Update ranks after sorting
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    // Apply limit
    const limitedEntries = leaderboardEntries.slice(0, limit)

    // Get additional stats
    const totalVendors = await VendorService.getVendorCount()
    const activeBattles = await BattleService.getActiveBattleCount()
    const totalBattles = await BattleService.getBattleCount()

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: limitedEntries,
        stats: {
          totalVendors,
          activeBattles,
          totalBattles,
        },
        filters: {
          category,
          type,
          limit,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
} 