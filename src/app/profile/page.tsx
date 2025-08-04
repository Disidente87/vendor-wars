'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Map, 
  List, 
  Coins,
  ArrowLeft,
  Settings,
  Trophy,
  Flame,
  Crown,
  Star,
  Users,
  Calendar,
  Target,
  Zap,
  Shield,
  Award,
  MapPin
} from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview')

  const userStats: UserStats = {
    username: 'FoodWarrior',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    level: 7,
    experience: 1250,
    experienceToNext: 1500,
    battleTokens: 247,
    totalVotes: 89,
    verifiedVotes: 23,
    vendorsVotedFor: 12,
    votingStreak: 5,
    territoriesControlled: 3,
    rank: 'Vendor Defender',
    achievements: [
      {
        id: '1',
        name: 'First Vote',
        description: 'Cast your first vote for a vendor',
        icon: '🎯',
        unlocked: true,
        progress: 1,
        maxProgress: 1
      },
      {
        id: '2',
        name: 'Territory Master',
        description: 'Control 5 territories',
        icon: '🏆',
        unlocked: false,
        progress: 3,
        maxProgress: 5
      },
      {
        id: '3',
        name: 'Voting Streak',
        description: 'Vote for 7 days in a row',
        icon: '🔥',
        unlocked: false,
        progress: 5,
        maxProgress: 7
      },
      {
        id: '4',
        name: 'Token Collector',
        description: 'Earn 1000 battle tokens',
        icon: '💰',
        unlocked: false,
        progress: 247,
        maxProgress: 1000
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'vote',
        title: 'Voted for Pupusas María',
        description: 'Supported in Zona Centro',
        timestamp: '2 hours ago',
        tokens: 25
      },
      {
        id: '2',
        type: 'territory',
        title: 'Territory captured',
        description: 'Zona Norte is now controlled by Tacos El Rey',
        timestamp: '1 day ago'
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Achievement unlocked',
        description: 'First Vote - Cast your first vote for a vendor',
        timestamp: '3 days ago'
      },
      {
        id: '4',
        type: 'battle',
        title: 'Battle won',
        description: 'Your team won the battle in Zona Sur',
        timestamp: '1 week ago',
        tokens: 50
      }
    ],
    topVendors: [
      {
        id: '1',
        name: 'Pupusas María',
        imageUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
        votesReceived: 15,
        totalVotes: 2340,
        zone: 'Centro'
      },
      {
        id: '2',
        name: 'Tacos El Rey',
        imageUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
        votesReceived: 12,
        totalVotes: 1890,
        zone: 'Norte'
      },
      {
        id: '3',
        name: 'Café Aroma',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        votesReceived: 8,
        totalVotes: 1560,
        zone: 'Sur'
      },
      {
        id: '4',
        name: 'Pizza Napolitana',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        votesReceived: 6,
        totalVotes: 2100,
        zone: 'Este'
      },
      {
        id: '5',
        name: 'Sushi Express',
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        votesReceived: 4,
        totalVotes: 1780,
        zone: 'Oeste'
      }
    ]
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

  const experiencePercentage = (userStats.experience / userStats.experienceToNext) * 100

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`)
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
                style={{ width: `${experiencePercentage}%` }}
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