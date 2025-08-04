'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Trophy, Crown, Star, Users, Flame } from 'lucide-react'

interface ZoneVendor {
  id: string
  name: string
  imageUrl: string
  controlPercentage: number
  tier: 'gold' | 'silver' | 'bronze'
  position: { x: number; y: number }
  totalVotes: number
  winRate: number
  battleTokens: number
}

interface BattleLog {
  id: string
  user: string
  vendor: string
  tokens: number
  timestamp: string
}

export default function ZoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [zone, setZone] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)

  // Mock data for zone details with vendor positions
  const getZoneData = (zoneId: string) => {
    const zonesData = {
      'centro': {
        id: zoneId,
        name: 'Zona Centro',
        imageUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
        leadingVendor: 'Pupusas María',
        vendors: [
          {
            id: '1',
            name: 'Pupusas María',
            imageUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
            controlPercentage: 85,
            tier: 'gold' as const,
            position: { x: 50, y: 30 },
            totalVotes: 2340,
            winRate: 84.4,
            battleTokens: 12500
          },
          {
            id: '2',
            name: 'Tacos El Rey',
            imageUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
            controlPercentage: 10,
            tier: 'silver' as const,
            position: { x: 20, y: 70 },
            totalVotes: 1890,
            winRate: 87.5,
            battleTokens: 9800
          },
          {
            id: '3',
            name: 'Café Aroma',
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
            controlPercentage: 5,
            tier: 'bronze' as const,
            position: { x: 80, y: 60 },
            totalVotes: 1560,
            winRate: 78.6,
            battleTokens: 8200
          },
          {
            id: '4',
            name: 'Pizza Napolitana',
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
            controlPercentage: 3,
            tier: 'bronze' as const,
            position: { x: 35, y: 20 },
            totalVotes: 2100,
            winRate: 81.6,
            battleTokens: 11200
          },
          {
            id: '5',
            name: 'Sushi Express',
            imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
            controlPercentage: 2,
            tier: 'bronze' as const,
            position: { x: 70, y: 80 },
            totalVotes: 1780,
            winRate: 80.0,
            battleTokens: 8900
          }
        ],
        battleLog: [
          {
            id: '1',
            user: '@Juan',
            vendor: 'Pupusas María',
            tokens: 25,
            timestamp: '2 minutes ago'
          },
          {
            id: '2',
            user: '@Sofia',
            vendor: 'Tacos El Rey',
            tokens: 12,
            timestamp: '5 minutes ago'
          },
          {
            id: '3',
            user: '@Miguel',
            vendor: 'Pupusas María',
            tokens: 18,
            timestamp: '8 minutes ago'
          }
        ]
      },
      'norte': {
        id: zoneId,
        name: 'Zona Norte',
        imageUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
        leadingVendor: 'Tacos El Rey',
        vendors: [
          {
            id: '2',
            name: 'Tacos El Rey',
            imageUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
            controlPercentage: 65,
            tier: 'gold' as const,
            position: { x: 50, y: 40 },
            totalVotes: 1890,
            winRate: 87.5,
            battleTokens: 9800
          },
          {
            id: '6',
            name: 'Elote Norteño',
            imageUrl: 'https://images.unsplash.com/photo-1624300629298-e9de39c13c55?w=400&h=300&fit=crop',
            controlPercentage: 20,
            tier: 'silver' as const,
            position: { x: 25, y: 70 },
            totalVotes: 1450,
            winRate: 82.3,
            battleTokens: 7200
          },
          {
            id: '7',
            name: 'Tamales Doña Rosa',
            imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
            controlPercentage: 10,
            tier: 'bronze' as const,
            position: { x: 75, y: 60 },
            totalVotes: 980,
            winRate: 76.8,
            battleTokens: 5400
          },
          {
            id: '8',
            name: 'Quesadillas Norte',
            imageUrl: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400&h=300&fit=crop',
            controlPercentage: 3,
            tier: 'bronze' as const,
            position: { x: 40, y: 20 },
            totalVotes: 650,
            winRate: 71.2,
            battleTokens: 3800
          },
          {
            id: '9',
            name: 'Gorditas del Norte',
            imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
            controlPercentage: 2,
            tier: 'bronze' as const,
            position: { x: 80, y: 80 },
            totalVotes: 420,
            winRate: 68.5,
            battleTokens: 2400
          }
        ],
        battleLog: [
          {
            id: '1',
            user: '@Carlos',
            vendor: 'Tacos El Rey',
            tokens: 25,
            timestamp: '2 minutes ago'
          },
          {
            id: '2',
            user: '@Ana',
            vendor: 'Elote Norteño',
            tokens: 18,
            timestamp: '5 minutes ago'
          },
          {
            id: '3',
            user: '@Roberto',
            vendor: 'Tacos El Rey',
            tokens: 22,
            timestamp: '8 minutes ago'
          }
        ]
      },
      'sur': {
        id: zoneId,
        name: 'Zona Sur',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        leadingVendor: 'Café Aroma',
        vendors: [
          {
            id: '3',
            name: 'Café Aroma',
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
            controlPercentage: 60,
            tier: 'gold' as const,
            position: { x: 50, y: 35 },
            totalVotes: 1560,
            winRate: 78.6,
            battleTokens: 8200
          },
          {
            id: '10',
            name: 'Panadería del Sur',
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
            controlPercentage: 25,
            tier: 'silver' as const,
            position: { x: 30, y: 75 },
            totalVotes: 1200,
            winRate: 79.2,
            battleTokens: 6800
          },
          {
            id: '11',
            name: 'Helados Sureños',
            imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
            controlPercentage: 10,
            tier: 'bronze' as const,
            position: { x: 70, y: 65 },
            totalVotes: 890,
            winRate: 75.4,
            battleTokens: 5200
          },
          {
            id: '12',
            name: 'Dulces del Sur',
            imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
            controlPercentage: 3,
            tier: 'bronze' as const,
            position: { x: 20, y: 25 },
            totalVotes: 580,
            winRate: 72.1,
            battleTokens: 3400
          },
          {
            id: '13',
            name: 'Café Express Sur',
            imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
            controlPercentage: 2,
            tier: 'bronze' as const,
            position: { x: 85, y: 85 },
            totalVotes: 420,
            winRate: 69.8,
            battleTokens: 2800
          }
        ],
        battleLog: [
          {
            id: '1',
            user: '@María',
            vendor: 'Café Aroma',
            tokens: 28,
            timestamp: '2 minutes ago'
          },
          {
            id: '2',
            user: '@Pedro',
            vendor: 'Panadería del Sur',
            tokens: 18,
            timestamp: '4 minutes ago'
          },
          {
            id: '3',
            user: '@Rosa',
            vendor: 'Café Aroma',
            tokens: 25,
            timestamp: '7 minutes ago'
          }
        ]
      },
      'este': {
        id: zoneId,
        name: 'Zona Este',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        leadingVendor: 'Pizza Napolitana',
        vendors: [
          {
            id: '4',
            name: 'Pizza Napolitana',
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
            controlPercentage: 55,
            tier: 'gold' as const,
            position: { x: 45, y: 40 },
            totalVotes: 2100,
            winRate: 81.6,
            battleTokens: 11200
          },
          {
            id: '14',
            name: 'Pasta Italiana',
            imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
            controlPercentage: 30,
            tier: 'silver' as const,
            position: { x: 25, y: 70 },
            totalVotes: 1680,
            winRate: 83.7,
            battleTokens: 9200
          },
          {
            id: '15',
            name: 'Gelato Este',
            imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
            controlPercentage: 10,
            tier: 'bronze' as const,
            position: { x: 75, y: 60 },
            totalVotes: 1100,
            winRate: 77.3,
            battleTokens: 6400
          },
          {
            id: '16',
            name: 'Café Italiano',
            imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
            controlPercentage: 3,
            tier: 'bronze' as const,
            position: { x: 35, y: 20 },
            totalVotes: 720,
            winRate: 74.1,
            battleTokens: 4200
          },
          {
            id: '17',
            name: 'Panini Este',
            imageUrl: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400&h=300&fit=crop',
            controlPercentage: 2,
            tier: 'bronze' as const,
            position: { x: 80, y: 85 },
            totalVotes: 480,
            winRate: 71.5,
            battleTokens: 2800
          }
        ],
        battleLog: [
          {
            id: '1',
            user: '@Marco',
            vendor: 'Pizza Napolitana',
            tokens: 35,
            timestamp: '1 minute ago'
          },
          {
            id: '2',
            user: '@Sofia',
            vendor: 'Pasta Italiana',
            tokens: 20,
            timestamp: '3 minutes ago'
          },
          {
            id: '3',
            user: '@Antonio',
            vendor: 'Pizza Napolitana',
            tokens: 28,
            timestamp: '5 minutes ago'
          }
        ]
      },
      'oeste': {
        id: zoneId,
        name: 'Zona Oeste',
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        leadingVendor: 'Sushi Express',
        vendors: [
          {
            id: '5',
            name: 'Sushi Express',
            imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
            controlPercentage: 50,
            tier: 'gold' as const,
            position: { x: 50, y: 35 },
            totalVotes: 1780,
            winRate: 80.0,
            battleTokens: 8900
          },
          {
            id: '18',
            name: 'Ramen Oeste',
            imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
            controlPercentage: 35,
            tier: 'silver' as const,
            position: { x: 30, y: 75 },
            totalVotes: 1450,
            winRate: 85.2,
            battleTokens: 7800
          },
          {
            id: '19',
            name: 'Bubble Tea Oeste',
            imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=300&fit=crop',
            controlPercentage: 10,
            tier: 'bronze' as const,
            position: { x: 70, y: 65 },
            totalVotes: 920,
            winRate: 79.8,
            battleTokens: 5400
          },
          {
            id: '20',
            name: 'Dim Sum Oeste',
            imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
            controlPercentage: 3,
            tier: 'bronze' as const,
            position: { x: 20, y: 25 },
            totalVotes: 680,
            winRate: 76.4,
            battleTokens: 3800
          },
          {
            id: '21',
            name: 'Matcha Oeste',
            imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
            controlPercentage: 2,
            tier: 'bronze' as const,
            position: { x: 85, y: 85 },
            totalVotes: 450,
            winRate: 73.1,
            battleTokens: 2600
          }
        ],
        battleLog: [
          {
            id: '1',
            user: '@Yuki',
            vendor: 'Sushi Express',
            tokens: 32,
            timestamp: '2 minutes ago'
          },
          {
            id: '2',
            user: '@Hiroshi',
            vendor: 'Ramen Oeste',
            tokens: 15,
            timestamp: '4 minutes ago'
          },
          {
            id: '3',
            user: '@Akira',
            vendor: 'Sushi Express',
            tokens: 26,
            timestamp: '6 minutes ago'
          }
        ]
      }
    }
    return zonesData[zoneId as keyof typeof zonesData] || zonesData['centro']
  }

  useEffect(() => {
    const loadZone = async () => {
      const resolvedParams = await params
      const zoneData = getZoneData(resolvedParams.id)
      setZone(zoneData)
      setLoading(false)
    }
    loadZone()
  }, [params])

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'text-yellow-600'
      case 'silver':
        return 'text-gray-600'
      case 'bronze':
        return 'text-orange-700'
      default:
        return 'text-gray-600'
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'gold':
        return '🥇 Gold'
      case 'silver':
        return '🥈 Silver'
      case 'bronze':
        return '🥉 Bronze'
      default:
        return tier
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'silver':
        return <Trophy className="w-4 h-4 text-gray-600" />
      case 'bronze':
        return <Star className="w-4 h-4 text-orange-700" />
      default:
        return <Trophy className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading zone details...</p>
        </div>
      </div>
    )
  }

  if (!zone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Zone not found</h3>
          <p className="text-gray-600">The zone you're looking for doesn't exist</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <button
            onClick={() => router.back()}
            className="text-[#181511] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            {zone.name}
          </h2>
        </div>

        {/* Zone Map with Vendors */}
        <div className="px-4 py-3">
          <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] mb-3">
            Zone Territory Map
          </h3>
          <div className="relative bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-4 h-64 border-2 border-orange-200">
            {/* Zone Background */}
            <div 
              className="absolute inset-0 rounded-xl opacity-20"
              style={{
                backgroundImage: `url("${zone.imageUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Vendor Markers */}
            {zone.vendors?.slice(0, 5).map((vendor: ZoneVendor, index: number) => (
              <div
                key={vendor.id}
                className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${
                  selectedVendor === vendor.id ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${vendor.position.x}%`,
                  top: `${vendor.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleVendorClick(vendor.id)}
              >
                {/* Vendor Marker */}
                <div className={`relative ${selectedVendor === vendor.id ? 'animate-pulse' : ''}`}>
                  {/* Tier Ring */}
                  <div className={`absolute inset-0 rounded-full border-2 ${
                    vendor.tier === 'gold' ? 'border-yellow-500' :
                    vendor.tier === 'silver' ? 'border-gray-400' :
                    'border-orange-600'
                  } ${selectedVendor === vendor.id ? 'animate-ping' : ''}`} />
                  
                  {/* Vendor Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img 
                      src={vendor.imageUrl} 
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Tier Badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                    {getTierIcon(vendor.tier)}
                  </div>
                  
                  {/* Vendor Name */}
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {vendor.name}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Zone Legend */}
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full border-2 border-yellow-500"></div>
                <span>🥇 Gold</span>
                <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
                <span>🥈 Silver</span>
                <div className="w-3 h-3 rounded-full border-2 border-orange-600"></div>
                <span>🥉 Bronze</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Leaderboard */}
        <div className="px-4 py-3">
          <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] mb-3">
            Complete Leaderboard
          </h3>
          
          <div className="space-y-2">
            {zone.vendors?.map((vendor: ZoneVendor, index: number) => (
              <div 
                key={vendor.id} 
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-200/50 hover:bg-white/90 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  selectedVendor === vendor.id ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => handleVendorClick(vendor.id)}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
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
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-[#2d1810] text-base truncate">{vendor.name}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        vendor.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        vendor.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {getTierLabel(vendor.tier)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-[#6b5d52]">
                      <div className="flex items-center space-x-1">
                        <Flame className="w-3 h-3" />
                        <span>{vendor.totalVotes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-3 h-3" />
                        <span>{vendor.winRate}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{vendor.battleTokens.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Control Percentage */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-[#2d1810]">
                      {vendor.controlPercentage}%
                    </div>
                    <div className="text-xs text-[#6b5d52]">Control</div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Battle Activity */}
        <div className="px-4 py-3">
          <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] mb-3">
            Recent Battle Activity
          </h3>
          
          <div className="space-y-2">
            {zone.battleLog?.slice(0, 5).map((log: BattleLog) => (
              <div key={log.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-[#2d1810] font-medium">{log.user}</span>
                    <span className="text-sm text-[#6b5d52]">voted for</span>
                    <span className="text-sm text-[#2d1810] font-semibold">{log.vendor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-sm font-semibold text-[#2d1810]">+{log.tokens}</span>
                  </div>
                </div>
                <div className="text-xs text-[#6b5d52] mt-1">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 