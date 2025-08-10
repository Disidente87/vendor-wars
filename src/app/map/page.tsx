'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useMiniApp } from '@neynar/react'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { List, Crown, Flame, Trophy, Bell, Swords } from 'lucide-react'
import Image from 'next/image'
import { VendorService } from '@/services/vendors'
import { UserHeader } from '@/components/UserHeader'
import type { Vendor } from '@/types'

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

interface ZoneWithTopVendor {
  zoneId: string
  zoneName: string
  topVendor: Vendor | null
  totalVendors: number
  totalVotes: number
}

export default function MapPage() {
  const router = useRouter()
  const { isSDKLoaded, context } = useMiniApp()
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [zonesWithVendors, setZonesWithVendors] = useState<ZoneWithTopVendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Use Farcaster auth instead of simulation
  const { isAuthenticated, user: _user, isLoading: authLoading } = useFarcasterAuth()

  // Fetch zones with top vendors
  useEffect(() => {
    async function fetchZonesWithVendors() {
      try {
        setIsLoading(true)
        const zonesData = await VendorService.getZonesWithTopVendors()
        setZonesWithVendors(zonesData)
      } catch (error) {
        console.error('Error fetching zones with vendors:', error)
        // Fallback to hardcoded data if there's an error
        setZonesWithVendors([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && !authLoading) {
      fetchZonesWithVendors()
    }
  }, [isAuthenticated, authLoading])

  // Check authentication status
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to Farcaster...</p>
        </div>
      </div>
    )
  }

  // Map zone IDs to positions and colors
  const zoneConfig = {
    '1': { // Centro
      position: { top: '40%', left: '35%' },
      color: '#e63946', // Roja
      size: 'small' as const
    },
    '2': { // Norte
      position: { top: '12%', left: '40%' },
      color: '#06d6a0', // Verde
      size: 'small' as const
    },
    '3': { // Sur
      position: { top: '68%', left: '49%' },
      color: '#8b5cf6', // Purple
      size: 'small' as const
    },
    '4': { // Este
      position: { top: '36%', left: '65%' },
      color: '#3b82f6', // Azul
      size: 'small' as const
    },
    '5': { // Oeste
      position: { top: '45%', left: '11%' },
      color: '#fbbf24', // Amarillo
      size: 'small' as const
    }
  }

  // Generate zones from fetched data
  const zones: Zone[] = zonesWithVendors.map(zoneData => {
    const config = zoneConfig[zoneData.zoneId as keyof typeof zoneConfig]
    const topVendor = zoneData.topVendor
    
    return {
      id: zoneData.zoneId,
      name: zoneData.zoneName,
      vendor: topVendor ? `@${topVendor.name.replace(/\s+/g, '_')}` : 'Sin vendor',
      leader: topVendor ? topVendor.name : 'Zona vacía',
      leaderAvatar: topVendor?.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=face',
      control: topVendor ? Math.min(85, Math.max(50, Math.floor(zoneData.totalVotes / 10))) : 0,
      color: config?.color || '#cccccc',
      position: config?.position || { top: '50%', left: '50%' },
      size: config?.size || 'medium',
      battleIntensity: topVendor ? Math.min(5, Math.max(1, Math.floor(zoneData.totalVotes / 5))) : 1,
      recentVotes: zoneData.totalVotes
    }
  })

  // Fallback to hardcoded zones if no data is fetched
  const fallbackZones: Zone[] = [
    {
      id: '1', // Centro
      name: 'Zona Centro',
      vendor: '@Pupusas_María',
      leader: 'Pupusas María',
      leaderAvatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face',
      control: 85,
      color: '#e63946', // Roja
      position: { top: '40%', left: '35%' },
      size: 'small',
      battleIntensity: 3,
      recentVotes: 7 // Pupusas María tiene 7 votos
    },
    {
      id: '2', // Norte
      name: 'Zona Norte',
      vendor: '@Tacos_El_Güero',
      leader: 'Tacos El Güero',
      leaderAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face',
      control: 72,
      color: '#06d6a0', // Verde
      position: { top: '12%', left: '40%' },
      size: 'small',
      battleIntensity: 2,
      recentVotes: 14 // Tacos El Güero tiene 14 votos
    },
    {
      id: '3', // Sur
      name: 'Zona Sur',
      vendor: '@Café_Aroma',
      leader: 'Café Aroma',
      leaderAvatar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop&crop=face',
      control: 91,
      color: '#8b5cf6', // Purple
      position: { top: '68%', left: '49%' },
      size: 'small',
      battleIntensity: 1,
      recentVotes: 5 // Café Aroma tiene 5 votos
    },
    {
      id: '4', // Este
      name: 'Zona Este',
      vendor: '@Pizza_Napoli',
      leader: 'Pizza Napoli',
      leaderAvatar: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop&crop=face',
      control: 64,
      color: '#3b82f6', // Azul
      position: { top: '36%', left: '65%' },
      size: 'small',
      battleIntensity: 4,
      recentVotes: 4 // Pizza Napoli tiene 4 votos
    },
    {
      id: '5', // Oeste
      name: 'Zona Oeste',
      vendor: '@Sushi_Express',
      leader: 'Sushi Express',
      leaderAvatar: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100&h=100&fit=crop&crop=face',
      control: 58,
      color: '#fbbf24', // Amarillo
      position: { top: '45%', left: '11%' },
      size: 'small',
      battleIntensity: 5,
      recentVotes: 6 // Sushi Express tiene 6 votos
    }
  ]

  // Use fetched zones if available, otherwise fallback
  const displayZones = zones.length > 0 ? zones : fallbackZones

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
      {/* UserHeader at the top */}
      <UserHeader />
      
      {/* Battle Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/10 via-[#ffd23f]/10 to-[#06d6a0]/10"></div>
      
      {/* CDMX Map with Interactive Zones */}
      <div className="relative z-10 px-4 py-4 flex-1">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-[#ff6b35]/20 h-full relative">
          {/* CDMX Map Image with Interactive Zones */}
          <div className="relative h-full">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* CDMX Map Background */}
              <Image
                src="/cdmx.png"
                alt="Mapa de CDMX con zonas de batalla"
                width={800}
                height={600}
                className="w-full h-auto max-w-full max-h-full object-contain rounded-lg"
                priority
              />
              
              {/* Interactive Zone Overlays */}
              {displayZones.map((zone) => (
                <div
                  key={zone.id}
                  className="absolute cursor-pointer transition-all duration-200 hover:scale-110"
                  style={{
                    top: zone.position.top,
                    left: zone.position.left,
                  }}
                  onClick={() => handleZoneClick(zone.id)}
                >
                  {/* Zone Circle */}
                  <div
                    className={`${getZoneSize(zone.size)} rounded-full border-4 border-white shadow-lg flex items-center justify-center relative group`}
                    style={{ backgroundColor: zone.color }}
                  >
                    {/* Vendor Profile Image instead of Zone Icon */}
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden">
                      <img 
                        src={zone.leaderAvatar} 
                        alt={zone.leader}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default image if vendor image fails to load
                          const target = e.target as HTMLImageElement
                          target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=face'
                        }}
                      />
                    </div>
                    
                    {/* Vote Count Circle (tangent to the main circle) */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white shadow-lg bg-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs font-bold text-[#2d1810]">{zone.recentVotes}</div>
                        <div className="text-[8px] text-[#6b5d52]">votes</div>
                      </div>
                    </div>
                    
                    {/* Battle Intensity Indicator */}
                    <div className="absolute -top-1 -left-1">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: getBattleIntensityColor(zone.battleIntensity) }}
                      >
                        <Flame className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Zone Info Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    <div className="text-center">
                      <h3 className="font-bold text-[#2d1810] text-sm">{zone.name}</h3>
                      <p className="text-[#6b5d52] text-xs">{zone.leader}</p>
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-[#ff6b35]" />
                          <span className="text-xs text-[#6b5d52]">{zone.recentVotes}</span>
                        </div>
                        <Crown className="w-3 h-3 text-[#ffd23f]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Battle Events Button - Moved below the map */}
      <div className="relative z-10 px-4 py-2">
        <Button
          onClick={() => router.push('/battle-events')}
          className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] hover:from-[#e5562e] hover:to-[#e6c200] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Swords className="w-5 h-5" />
          <span>Battle Events</span>
          <Bell className="w-4 w-4" />
        </Button>
      </div>

      {/* Zone Legend */}
      <div className="relative z-10 px-4 py-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-[#ff6b35]/20">
          <h3 className="font-bold text-[#2d1810] mb-2 text-sm">Zonas de Batalla</h3>
          <div className="space-y-2">
            {displayZones.map((zone) => (
              <div 
                key={zone.id} 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#ff6b35]/10 cursor-pointer transition-colors duration-200"
                onClick={() => handleZoneClick(zone.id)}
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