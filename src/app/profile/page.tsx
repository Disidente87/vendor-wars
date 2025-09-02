'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Map, 
  Coins,
  ArrowLeft,
  Settings,
  Trophy,
  Flame,
  Crown,
  Star,
  Users,
  Target,
  Zap,
  Shield,
  Award,
  MapPin
} from 'lucide-react'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useProfileRefresh } from '@/hooks/useProfileRefresh'

interface UserStats {
  username: string
  avatar: string
  level: number
  experience: number
  experienceToNext: number
  battleTokens: number
  totalVotes: number
  verifiedVotes: number
  vendorsVotedFor: number
  votingStreak: number
  territoriesControlled: number
  rank: string
  achievements: Achievement[]
  recentActivity: Activity[]
  topVendors: TopVendor[]
}

interface TopVendor {
  id: string
  name: string
  imageUrl: string
  votesReceived: number
  totalVotes: number
  zone: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface Activity {
  id: string
  type: 'vote' | 'territory' | 'achievement' | 'battle'
  title: string
  description: string
  timestamp: string
  tokens?: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { user: farcasterUser, isAuthenticated, isLoading } = useFarcasterAuth()
  const { balance, refreshBalance } = useTokenBalance()
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchTime = useRef<number>(0)
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use the profile refresh hook
  useProfileRefresh({
    onRefresh: () => fetchUserStats(true),
    enabled: !!farcasterUser && isAuthenticated
  })

  const getAchievements = (totalVotes: number, verifiedVotes: number, uniqueVendors: number): Achievement[] => {
    return [
      {
        id: 'first-vote',
        name: 'First Vote',
        description: 'Cast your first vote',
        icon: '🎯',
        unlocked: totalVotes >= 1,
        progress: Math.min(totalVotes, 1),
        maxProgress: 1
      },
      {
        id: 'verified-voter',
        name: 'Verified Voter',
        description: 'Cast 10 verified votes',
        icon: '✅',
        unlocked: verifiedVotes >= 10,
        progress: Math.min(verifiedVotes, 10),
        maxProgress: 10
      },
      {
        id: 'vendor-explorer',
        name: 'Vendor Explorer',
        description: 'Vote for 5 different vendors',
        icon: '🗺️',
        unlocked: uniqueVendors >= 5,
        progress: Math.min(uniqueVendors, 5),
        maxProgress: 5
      },
      {
        id: 'voting-streak',
        name: 'Voting Streak',
        description: 'Maintain a 7-day voting streak',
        icon: '🔥',
        unlocked: false, // Will be calculated based on actual streak
        progress: 0,
        maxProgress: 7
      },
      {
        id: 'territory-master',
        name: 'Territory Master',
        description: 'Control 3 territories',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 3
      }
    ]
  }

  const getRecentActivity = (votes: any[]): Activity[] => {
    return votes
      .slice(0, 10)
      .map((vote, index) => ({
        id: `vote-${vote.id || index}`,
        type: 'vote' as const,
        title: `Voted for ${vote.vendors?.name || 'Unknown Vendor'}`,
        description: vote.is_verified ? 'Verified vote with photo' : 'Regular vote',
        timestamp: vote.created_at || new Date().toISOString(),
        tokens: vote.token_reward || 10
      }))
  }

  const getTopVendors = (votes: any[]): TopVendor[] => {
    // Contabiliza TODOS los votos por vendor_id, incluso si la relación vendors viene null
    const counts: Record<string, { count: number; vendor: any | null }> = {}

    for (const vote of votes) {
      const vendorId = vote.vendor_id
      if (!vendorId) continue
      if (!counts[vendorId]) counts[vendorId] = { count: 0, vendor: vote.vendors || null }
      counts[vendorId].count += 1
      // Conserva el primer vendor enriquecido que encuentres
      if (!counts[vendorId].vendor && vote.vendors) counts[vendorId].vendor = vote.vendors
    }

    return Object.entries(counts)
      .map(([vendorId, { count, vendor }]) => ({
        id: vendor?.id || vendorId,
        name: vendor?.name || 'Unknown Vendor',
        imageUrl: vendor?.image_url || 'https://via.placeholder.com/100',
        votesReceived: count,
        totalVotes: count,
        zone: 'Unknown Zone'
      }))
      .sort((a, b) => b.votesReceived - a.votesReceived)
      .slice(0, 3)
  }

  const getFallbackStats = (): UserStats => {
    if (!farcasterUser) {
      return {
        username: 'Unknown',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown',
        level: 1,
        experience: 0,
        experienceToNext: 100,
        battleTokens: 0,
        totalVotes: 0,
        verifiedVotes: 0,
        vendorsVotedFor: 0,
        votingStreak: 0,
        territoriesControlled: 0,
        rank: 'Newcomer',
        achievements: [],
        recentActivity: [],
        topVendors: []
      }
    }

    return {
      username: farcasterUser.username,
      avatar: farcasterUser.pfpUrl,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      battleTokens: balance || 0,
      totalVotes: 0,
      verifiedVotes: 0,
      vendorsVotedFor: 0,
      votingStreak: 0,
      territoriesControlled: 0,
      rank: 'Newcomer',
      achievements: [],
      recentActivity: [],
      topVendors: []
    }
  }

  const fetchUserStats = useCallback(async (forceRefresh = false) => {
    if (!farcasterUser) return

    // Prevent multiple simultaneous fetches
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTime.current < 5000) {
      return // Don't fetch if last fetch was less than 5 seconds ago
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    setIsLoadingStats(true)
    setError(null)
    lastFetchTime.current = now

    try {
      // Refresh token balance first
      await refreshBalance()
      
      // Fetch user's voting history and stats
      const response = await fetch(`/api/votes?userFid=${farcasterUser.fid}&limit=1000`)
      const result = await response.json()
      
      if (result.success) {
        const votes = result.data || []
        const totalVotes = votes.length
        const verifiedVotes = votes.filter((vote: any) => vote.is_verified).length
        const uniqueVendors = new Set(votes.map((vote: any) => vote.vendor_id)).size

        // Calculate level based on total votes (10 XP per vote)
        const totalXP = totalVotes * 10
        const level = Math.floor(totalXP / 100) + 1
        const experience = totalXP % 100
        const experienceToNext = 100

        // Determine rank based on activity
        let rank = 'Newcomer'
        if (totalVotes >= 50) rank = 'Vendor Defender'
        if (totalVotes >= 100) rank = 'Territory Master'
        if (totalVotes >= 200) rank = 'Battle Legend'

        const stats: UserStats = {
          username: farcasterUser.username,
          avatar: farcasterUser.pfpUrl,
          level,
          experience,
          experienceToNext,
          battleTokens: balance || farcasterUser.battleTokens || 0,
          totalVotes,
          verifiedVotes,
          vendorsVotedFor: uniqueVendors,
          votingStreak: farcasterUser.voteStreak || 0,
          territoriesControlled: 0, // Will be calculated from territory data
          rank,
          achievements: getAchievements(totalVotes, verifiedVotes, uniqueVendors),
          recentActivity: getRecentActivity(votes),
          topVendors: getTopVendors(votes)
        }

        setUserStats(stats)
        setError(null)
      } else {
        console.error('Failed to fetch vote history:', result.error)
        setError('Failed to load vote history')
        // Don't set fallback stats immediately, let user retry
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      setError('Network error while loading profile')
      // Don't set fallback stats immediately, let user retry
    } finally {
      setIsLoadingStats(false)
    }
  }, [farcasterUser, balance, refreshBalance])

  // Initial fetch when component mounts
  useEffect(() => {
    if (farcasterUser && isAuthenticated && !userStats) {
      fetchUserStats(true)
    }
  }, [farcasterUser, isAuthenticated, userStats, fetchUserStats])

  // Initial fetch when component mounts
  useEffect(() => {
    if (farcasterUser && isAuthenticated && !userStats) {
      fetchUserStats(true)
    }
  }, [farcasterUser, isAuthenticated, userStats, fetchUserStats])

  const handleRetry = () => {
    fetchUserStats(true)
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Vendor Defender': return '#06d6a0'
      case 'Territory Master': return '#ffd23f'
      case 'Battle Champion': return '#ff6b35'
      default: return '#8d99ae'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote': return <Target className="w-4 h-4 text-[#ff6b35]" />
      case 'territory': return <Map className="w-4 h-4 text-[#06d6a0]" />
      case 'achievement': return <Trophy className="w-4 h-4 text-[#ffd23f]" />
      case 'battle': return <Flame className="w-4 h-4 text-[#e63946]" />
      default: return <Star className="w-4 h-4 text-[#8d99ae]" />
    }
  }

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated || !farcasterUser) {
    return <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20 text-center">
        <h2 className="text-xl font-bold text-[#2d1810] mb-2">Not Authenticated</h2>
        <p className="text-[#6b5d52] text-sm mb-4">Please connect your Farcaster account to view your profile.</p>
        <Button
          onClick={() => router.push('/')}
          className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium py-3 rounded-xl shadow-lg"
        >
          Back to Home
        </Button>
      </div>
    </div>
  }

  if (error && !userStats) {
    return <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20 text-center">
        <h2 className="text-xl font-bold text-[#2d1810] mb-2">Error Loading Profile</h2>
        <p className="text-[#6b5d52] text-sm mb-4">{error}</p>
        <div className="flex space-x-3">
          <Button
            onClick={handleRetry}
            className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium py-3 rounded-xl shadow-lg"
            disabled={isLoadingStats}
          >
            {isLoadingStats ? 'Loading...' : 'Retry'}
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-xl shadow-lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  }

  if (!userStats) {
    return <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20 text-center">
        <h2 className="text-xl font-bold text-[#2d1810] mb-2">Loading Profile...</h2>
        <p className="text-[#6b5d52] text-sm mb-4">Please wait while we load your data.</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb]">
      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#e5562e] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2d1810]">Profile</h1>
              <p className="text-[#6b5d52] text-sm">Your battle stats</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center shadow-lg hover:bg-white/80 transition-colors">
            <Settings className="w-5 h-5 text-[#6b5d52]" />
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="relative z-10 px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#ff6b35]">
                <img src={userStats.avatar} alt={userStats.username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ffd23f] rounded-full flex items-center justify-center border-2 border-white">
                <Crown className="w-4 h-4 text-[#2d1810]" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#2d1810]">{userStats.username}</h2>
              <p 
                className="text-sm font-medium"
                style={{ color: getRankColor(userStats.rank) }}
              >
                {userStats.rank}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-[#ffd23f]" />
                  <span className="text-sm font-semibold text-[#2d1810]">{userStats.battleTokens}</span>
                  <span className="text-xs text-[#6b5d52]">$BATTLE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="w-4 h-4 text-[#ff6b35]" />
                  <span className="text-sm text-[#6b5d52]">{userStats.votingStreak} day streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#2d1810]">Level {userStats.level}</span>
              <span className="text-sm text-[#6b5d52]">{userStats.experience}/{userStats.experienceToNext} XP</span>
            </div>
            <div className="w-full bg-[#f4f1eb] rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] h-3 rounded-full transition-all duration-500"
                style={{ width: `${(userStats.experience / userStats.experienceToNext) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#2d1810]">{userStats.totalVotes}</p>
              <p className="text-sm text-[#6b5d52]">Total Votes</p>
            </div>
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#06d6a0] rounded-full flex items-center justify-center mx-auto mb-2">
                <Map className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#2d1810]">{userStats.territoriesControlled}</p>
              <p className="text-sm text-[#6b5d52]">Territories</p>
            </div>
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#ffd23f] rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#2d1810]">{userStats.verifiedVotes}</p>
              <p className="text-sm text-[#6b5d52]">Verified Votes</p>
            </div>
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#e63946] rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#2d1810]">{userStats.vendorsVotedFor}</p>
              <p className="text-sm text-[#6b5d52]">Vendors Voted</p>
            </div>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="relative z-10 px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-[#ff6b35]/20">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-[#ff6b35] text-white' 
                  : 'text-[#6b5d52] hover:bg-white/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'achievements' 
                  ? 'bg-[#ff6b35] text-white' 
                  : 'text-[#6b5d52] hover:bg-white/50'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'activity' 
                  ? 'bg-[#ff6b35] text-white' 
                  : 'text-[#6b5d52] hover:bg-white/50'
              }`}
            >
              Activity
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10 px-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
              <h3 className="font-bold text-[#2d1810] mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-[#ffd23f]" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push('/map')}
                  className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium py-3 rounded-xl shadow-lg"
                >
                  <Map className="w-4 h-4 mr-2" />
                  View Map
                </Button>
                <Button
                  onClick={() => router.push('/vendors')}
                  className="bg-[#06d6a0] hover:bg-[#05c090] text-white font-medium py-3 rounded-xl shadow-lg"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Browse Vendors
                </Button>
              </div>
            </div>

            {/* My Top Vendors */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
              <h3 className="font-bold text-[#2d1810] mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-[#ffd23f]" />
                My Top Vendors
              </h3>
              <div className="space-y-3">
                {userStats.topVendors.map((vendor, index) => (
                  <div 
                    key={vendor.id}
                    onClick={() => handleVendorClick(vendor.id)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f4f1eb] transition-colors cursor-pointer border border-transparent hover:border-[#ff6b35]/20"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        #{index + 1}
                      </div>
                    </div>

                    {/* Vendor Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-200">
                        <img 
                          src={vendor.imageUrl} 
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#2d1810] text-sm truncate">{vendor.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-[#6b5d52]">
                        <span>{vendor.zone}</span>
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{vendor.votesReceived} votes</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Votes */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-semibold text-[#2d1810]">
                        {vendor.totalVotes.toLocaleString()}
                      </div>
                      <div className="text-xs text-[#6b5d52]">Total</div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-orange-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {userStats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20 ${
                  achievement.unlocked ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    achievement.unlocked ? 'bg-[#ffd23f]' : 'bg-[#f4f1eb]'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#2d1810]">{achievement.name}</h4>
                    <p className="text-sm text-[#6b5d52]">{achievement.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-[#6b5d52] mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-[#f4f1eb] rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            achievement.unlocked ? 'bg-[#ffd23f]' : 'bg-[#ff6b35]'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <Award className="w-6 h-6 text-[#ffd23f]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {userStats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#f4f1eb] rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#2d1810]">{activity.title}</h4>
                    <p className="text-sm text-[#6b5d52]">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[#6b5d52]">{activity.timestamp}</span>
                      {activity.tokens && (
                        <div className="flex items-center space-x-1">
                          <Coins className="w-3 h-3 text-[#ffd23f]" />
                          <span className="text-xs font-semibold text-[#2d1810]">+{activity.tokens}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  )
}