'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useMiniApp } from '@neynar/react'
import { useAuthSimulation } from '@/hooks/useAuthSimulation'
import { UserHeader } from '@/components/UserHeader'
import { Search, Plus, Minus, List, Crown, Flame, Trophy, Coins, Bell, Swords } from 'lucide-react'

interface Zone {
  id: string
  name: string
  vendor: string
  leader: string
  leaderAvatar: string
  control: number
  color: string
  position: { top: string; left: string }
  size: 'small' | 'medium' | 'large'
  battleIntensity: number
  recentVotes: number
}

export default function MapPage() {
  const router = useRouter()
  const { isSDKLoaded, context } = useMiniApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [_selectedZone, setSelectedZone] = useState<string | null>(null)
  
  // Use simulation for development
  const { isAuthenticated, user: _user, isLoading } = useAuthSimulation()

  // Check authentication status
  useEffect(() => {
    if (isSDKLoaded) {
      if (context?.user) {
        console.log('User authenticated:', context.user)
      } else {
        console.log('Using simulated authentication for development')
      }
    }
  }, [isSDKLoaded, context])

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

  // Battle zones data with Figma design
  const zones: Zone[] = [
    {
      id: 'centro',
      name: 'Zona Centro',
      vendor: '@Pupusas_María',
      leader: 'Pupusas María',
      leaderAvatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face',
      control: 85,
      color: '#ff6b35',
      position: { top: '25%', left: '40%' },
      size: 'large',
      battleIntensity: 3,
      recentVotes: 24
    },
    {
      id: 'norte',
      name: 'Zona Norte',
      vendor: '@Tacos_El_Rey',
      leader: 'Tacos El Rey',
      leaderAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face',
      control: 72,
      color: '#06d6a0',
      position: { top: '15%', left: '60%' },
      size: 'medium',
      battleIntensity: 2,
      recentVotes: 18
    },
    {
      id: 'sur',
      name: 'Zona Sur',
      vendor: '@Arepa_House',
      leader: 'Arepa House',
      leaderAvatar: 'https://images.unsplash.com/photo-1594736797933-d0e501ba2fe6?w=100&h=100&fit=crop&crop=face',
      control: 91,
      color: '#ffd23f',
      position: { top: '60%', left: '30%' },
      size: 'large',
      battleIntensity: 1,
      recentVotes: 31
    },
    {
      id: 'este',
      name: 'Zona Este',
      vendor: '@Empanadas_Doña_Rosa',
      leader: 'Empanadas Doña Rosa',
      leaderAvatar: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=100&h=100&fit=crop&crop=face',
      control: 64,
      color: '#e63946',
      position: { top: '40%', left: '70%' },
      size: 'medium',
      battleIntensity: 4,
      recentVotes: 15
    },
    {
      id: 'oeste',
      name: 'Zona Oeste',
      vendor: '@Quesadillas_Express',
      leader: 'Quesadillas Express',
      leaderAvatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=face',
      control: 58,
      color: '#f72585',
      position: { top: '45%', left: '20%' },
      size: 'small',
      battleIntensity: 5,
      recentVotes: 12
    }
  ]

  const userStats = {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    username: 'FoodWarrior',
    battleTokens: 247,
    streak: 5,
    level: 7
  }

  const handleZoneClick = (zoneId: string) => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    setSelectedZone(zoneId)
    router.push(`/zones/${zoneId}`)
  }

  const handleViewVendors = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    router.push('/vendors')
  }

  const getBattleIntensityColor = (intensity: number) => {
    if (intensity >= 4) return '#e63946'
    if (intensity >= 3) return '#ff6b35'
    if (intensity >= 2) return '#ffd23f'
    return '#06d6a0'
  }

  const getZoneSize = (size: string) => {
    switch (size) {
      case 'large': return 'w-24 h-24'
      case 'medium': return 'w-20 h-20'
      case 'small': return 'w-16 h-16'
      default: return 'w-20 h-20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] relative overflow-hidden">
      {/* User Header */}
      <UserHeader />
      
      {/* Battle Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/10 via-[#ffd23f]/10 to-[#06d6a0]/10"></div>
      
      {/* User Stats Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-[#ff6b35]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ff6b35]">
              <img src={userStats.avatar} alt={userStats.username} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-[#2d1810] text-sm">{userStats.username}</p>
              <p className="text-[#6b5d52] text-xs">Level {userStats.level}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Coins className="w-4 h-4 text-[#ffd23f]" />
              <span className="font-bold text-[#2d1810] text-sm">{userStats.battleTokens}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="w-4 h-4 text-[#ff6b35]" />
              <span className="font-bold text-[#2d1810] text-sm">{userStats.streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Events Button */}
      <div className="relative z-10 px-4 pb-2">
        <Button
          onClick={() => router.push('/battle-events')}
          className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] hover:from-[#e5562e] hover:to-[#e6c200] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Swords className="w-5 h-5" />
          <span>Battle Events</span>
          <Bell className="w-4 h-4" />
        </Button>
      </div>

      {/* Battle Map */}
      <div className="relative z-10 flex-1 p-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-[#ff6b35]/20 h-full relative">
          {/* Search Bar */}
          <div className="absolute top-4 left-4 right-4 z-20">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b5d52]" />
                <input
                  placeholder="Search for a vendor or zone"
                  className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-[#ff6b35]/20 text-[#2d1810] placeholder-[#6b5d52] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#e5562e] transition-colors">
                <Plus className="w-5 h-5 text-white" />
              </button>
              <button className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#e5562e] transition-colors">
                <Minus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Battle Zones */}
          <div className="relative h-full pt-16">
            {zones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className={`absolute ${getZoneSize(zone.size)} cursor-pointer transition-all duration-300 hover:scale-110`}
                style={{
                  top: zone.position.top,
                  left: zone.position.left,
                  backgroundColor: zone.color,
                  boxShadow: `0 0 20px ${zone.color}40`
                }}
              >
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-white relative overflow-hidden">
                  {/* Battle Intensity Indicator */}
                  <div 
                    className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: getBattleIntensityColor(zone.battleIntensity) }}
                  ></div>
                  
                  {/* Zone Content */}
                  <div className="text-center">
                    <p className="text-xs font-bold leading-tight">{zone.name}</p>
                    <p className="text-xs opacity-90">{zone.control}%</p>
                  </div>
                  
                  {/* Territory Glow Effect */}
                  <div className="absolute inset-0 rounded-full territory-glow opacity-50"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone List */}
      <div className="relative z-10 p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
          <h3 className="font-bold text-[#2d1810] mb-3 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-[#ffd23f]" />
            Battle Zones
          </h3>
          <div className="space-y-2">
            {zones.map((zone) => (
              <div 
                key={zone.id} 
                onClick={() => handleZoneClick(zone.id)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#ff6b35]/10 transition-colors cursor-pointer"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: zone.color }}
                ></div>
                <div className="flex-1">
                  <p className="font-semibold text-[#2d1810] text-sm">{zone.name}</p>
                  <p className="text-[#6b5d52] text-xs">{zone.leader} • {zone.control}% control</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-[#ff6b35]" />
                    <span className="text-xs text-[#6b5d52]">{zone.recentVotes}</span>
                  </div>
                  <Crown className="w-4 h-4 text-[#ffd23f]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 p-4">
        <div className="flex justify-center">
          <Button
            onClick={handleViewVendors}
            className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-bold py-3 px-6 rounded-xl shadow-xl flex items-center space-x-2"
          >
            <List className="w-5 h-5" />
            <span>View All Vendors</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 