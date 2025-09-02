'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { UserHeader } from '@/components/UserHeader'
import { 
  ArrowLeft, 
  MapPin,
  Users,
  Store,
  Share2,
  Crown,
  Trophy
} from 'lucide-react'

interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  avatar: string
  location: string
  weeklyPerformance: string
  score: number
  todayChange: number
  controlPercentage: number
  rankChange: number // +1, -1, 0
  tier: 'gold' | 'silver' | 'bronze' | 'none'
}

interface VendorVotesEntry { id: string; rank: number; name: string; avatar: string; votesReceived: number }
interface UserVotesEntry { id: string; rank: number; name: string; avatar: string; votesGiven: number }
interface ZoneVotesEntry { id: string; rank: number; name: string; votesReceived: number }

export default function LeaderboardPage() {
  const router = useRouter()
  const { isAuthenticated, user: farcasterUser, isLoading } = useFarcasterAuth()
  
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly')
  const [activeTab, setActiveTab] = useState<'vendors' | 'users' | 'zones'>('vendors')
  const [vendorsVotes, setVendorsVotes] = useState<VendorVotesEntry[]>([])
  const [usersVotes, setUsersVotes] = useState<UserVotesEntry[]>([])
  const [zonesVotes, setZonesVotes] = useState<ZoneVotesEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch real leaderboard by votes (must be declared before any early return)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        if (activeTab === 'vendors') {
          const res = await fetch(`/api/leaderboard/votes?type=vendors&limit=20&time=${timeFilter}`)
          const json = await res.json()
          if (!cancelled && json.success) setVendorsVotes(json.data)
        } else if (activeTab === 'users') {
          const res = await fetch(`/api/leaderboard/votes?type=users&limit=20&time=${timeFilter}`)
          const json = await res.json()
          if (!cancelled && json.success) {
            // Enhance user data with Farcaster info if available
            const enhancedData = json.data.map((user: any) => {
              if (farcasterUser && user.id === farcasterUser.fid.toString()) {
                return {
                  ...user,
                  name: farcasterUser.displayName || farcasterUser.username,
                  avatar: farcasterUser.pfpUrl
                }
              }
              return user
            })
            setUsersVotes(enhancedData)
          }
        } else {
          const res = await fetch(`/api/leaderboard/votes?type=zones&limit=20&time=${timeFilter}`)
          const json = await res.json()
          if (!cancelled && json.success) setZonesVotes(json.data)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load leaderboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [activeTab, timeFilter])

  // Show loading while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to Farcaster...</p>
        </div>
      </div>
    )
  }

  // Deprecated mock: vendors
  const vendorsData: LeaderboardEntry[] = [
    {
      id: '1',
      rank: 1,
      name: 'Pupusas María',
      avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face',
      location: 'Zona Centro Salvadoran',
      weeklyPerformance: '+23% this week',
      score: 1247,
      todayChange: 89,
      controlPercentage: 85,
      rankChange: 0,
      tier: 'gold'
    },
    {
      id: '2',
      rank: 2,
      name: 'Arepa House',
      avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face',
      location: 'Zona Sur Venezuelan',
      weeklyPerformance: '+31% this week',
      score: 1156,
      todayChange: 78,
      controlPercentage: 91,
      rankChange: 1,
      tier: 'silver'
    },
    {
      id: '3',
      rank: 3,
      name: 'Taco King',
      avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&h=100&fit=crop&crop=face',
      location: 'Zona Norte Mexican',
      weeklyPerformance: '+18% this week',
      score: 1089,
      todayChange: 67,
      controlPercentage: 72,
      rankChange: -1,
      tier: 'bronze'
    },
    {
      id: '4',
      rank: 4,
      name: 'Empanadas Doña Rosa',
      avatar: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop&crop=face',
      location: 'Zona Este Argentinian',
      weeklyPerformance: '+12% this week',
      score: 892,
      todayChange: 45,
      controlPercentage: 64,
      rankChange: 0,
      tier: 'none'
    },
    {
      id: '5',
      rank: 5,
      name: 'Quesadillas Express',
      avatar: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop&crop=face',
      location: 'Zona Oeste Mexican',
      weeklyPerformance: '+45% this week',
      score: 734,
      todayChange: 38,
      controlPercentage: 58,
      rankChange: 2,
      tier: 'none'
    }
  ]

  // Deprecated mock: users
  const usersData: LeaderboardEntry[] = [
    {
      id: 'u1',
      rank: 1,
      name: 'FoodWarrior',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      location: 'Level 15',
      weeklyPerformance: '+28% this week',
      score: 2156,
      todayChange: 156,
      controlPercentage: 92,
      rankChange: 0,
      tier: 'gold'
    },
    {
      id: 'u2',
      rank: 2,
      name: 'TacoLover',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      location: 'Level 12',
      weeklyPerformance: '+35% this week',
      score: 1987,
      todayChange: 134,
      controlPercentage: 88,
      rankChange: 1,
      tier: 'silver'
    },
    {
      id: 'u3',
      rank: 3,
      name: 'PupusasFan',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      location: 'Level 10',
      weeklyPerformance: '+22% this week',
      score: 1876,
      todayChange: 98,
      controlPercentage: 85,
      rankChange: -1,
      tier: 'bronze'
    }
  ]


  const getCurrentVotes = () => activeTab === 'vendors' ? vendorsVotes : activeTab === 'users' ? usersVotes : zonesVotes

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <Crown className="w-5 h-5 text-yellow-600" />
      case 'silver':
        return <Trophy className="w-5 h-5 text-gray-600" />
      case 'bronze':
        return <Trophy className="w-5 h-5 text-orange-700" />
      default:
        return null
    }
  }

  // Rank change UI removed for vote-based leaderboard

  const getBackgroundColor = (index: number) => {
    const colors = [
      'bg-yellow-50',
      'bg-gray-50', 
      'bg-orange-50',
      'bg-white',
      'bg-white'
    ]
    return colors[index] || 'bg-white'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] relative overflow-hidden">
      {/* User Header */}
      <UserHeader />
      
      {/* Header with gradient background */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-white flex size-12 shrink-0 items-center hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-white">Leaderboards</h1>
              <p className="text-white/90 text-sm">See who&apos;s leading the food wars</p>
            </div>
            <button className="text-white flex size-12 shrink-0 items-center hover:bg-white/20 rounded-full transition-colors">
              <Share2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="relative z-10 px-4 py-3">
        <div className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-[#ff6b35]/20">
          {[
            { key: 'daily', label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'all', label: 'All' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key as any)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === filter.key
                  ? 'bg-[#ff6b35] text-white'
                  : 'text-[#6b5d52] hover:bg-white/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="relative z-10 px-4 pb-3">
        <div className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-[#ff6b35]/20">
          {[
            { key: 'vendors', label: 'Vendors', icon: Store },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'zones', label: 'Zones', icon: MapPin }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                  activeTab === tab.key
                    ? 'bg-[#ff6b35] text-white'
                    : 'text-[#6b5d52] hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="relative z-10 px-4 pb-20">
        <div className="space-y-3">
          {getCurrentVotes().map((entry: any, index: number) => (
            <div 
              key={entry.id}
              className={`${getBackgroundColor(index)} rounded-xl p-4 shadow-lg border border-[#ff6b35]/20 hover:shadow-xl transition-all duration-200`}
            >
              <div className="flex items-center space-x-3">
                {/* Rank */}
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">{entry.rank}</div>

                {/* Avatar */}
                {entry.avatar && (
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff6b35]/20">
                      <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#2d1810] text-base truncate">{entry.name}</h3>
                </div>

                {/* Votes metric */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#6b5d52]">{activeTab === 'users' ? 'Votes Given' : 'Votes Received'}</span>
                  <div className="px-2 py-1 bg-white rounded-md border text-[#2d1810] font-semibold">
                    {activeTab === 'users' ? entry.votesGiven : entry.votesReceived}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-[#6b5d52] text-sm">Loading...</div>}
          {error && <div className="text-center text-red-600 text-sm">{error}</div>}
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 px-4 pb-6">
        <div className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ffd23f]/10 rounded-xl p-6 border border-[#ff6b35]/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff6b35] to-[#ffd23f] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-[#2d1810] text-lg mb-2">Climb the Rankings!</h3>
          <p className="text-[#6b5d52] text-sm mb-4">
            Vote for vendors, verify purchases, and defend your territory to earn more BATTLE tokens
          </p>
          <Button
            onClick={() => router.push('/map')}
            className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Trophy className="w-4 h-4" />
            <span>Join the Battle</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 