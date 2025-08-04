'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Map, 
  List, 
  User, 
  Users,
  Search,
  Filter,
  Star,
  Flame,
  Crown,
  Trophy,
  Coins,
  ArrowRight,
  Plus
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  handle: string
  avatar: string
  specialty: string
  rating: number
  totalVotes: number
  territories: number
  battleTokens: number
  isVerified: boolean
  status: 'active' | 'battling' | 'resting'
}

export default function VendorsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const vendors: Vendor[] = [
    {
      id: '1',
      name: 'Pupusas María',
      handle: '@Pupusas_María',
      avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face',
      specialty: 'Pupusas Tradicionales',
      rating: 4.8,
      totalVotes: 1247,
      territories: 3,
      battleTokens: 8920,
      isVerified: true,
      status: 'active'
    },
    {
      id: '2',
      name: 'Tacos El Rey',
      handle: '@Tacos_El_Rey',
      avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face',
      specialty: 'Tacos de Carne Asada',
      rating: 4.6,
      totalVotes: 892,
      territories: 2,
      battleTokens: 6540,
      isVerified: true,
      status: 'battling'
    },
    {
      id: '3',
      name: 'Arepa House',
      handle: '@Arepa_House',
      avatar: 'https://images.unsplash.com/photo-1594736797933-d0e501ba2fe6?w=100&h=100&fit=crop&crop=face',
      specialty: 'Arepas Venezolanas',
      rating: 4.9,
      totalVotes: 1567,
      territories: 4,
      battleTokens: 12340,
      isVerified: true,
      status: 'active'
    },
    {
      id: '4',
      name: 'Empanadas Doña Rosa',
      handle: '@Empanadas_Doña_Rosa',
      avatar: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=100&h=100&fit=crop&crop=face',
      specialty: 'Empanadas Argentinas',
      rating: 4.7,
      totalVotes: 734,
      territories: 1,
      battleTokens: 5430,
      isVerified: false,
      status: 'resting'
    },
    {
      id: '5',
      name: 'Quesadillas Express',
      handle: '@Quesadillas_Express',
      avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=face',
      specialty: 'Quesadillas Gourmet',
      rating: 4.5,
      totalVotes: 456,
      territories: 1,
      battleTokens: 3210,
      isVerified: false,
      status: 'active'
    }
  ]

  const handleVendorClick = (vendorId: string) => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    router.push(`/vendors/${vendorId}`)
  }

  const handleRegisterVendor = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    router.push('/vendors/register')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#06d6a0'
      case 'battling': return '#ff6b35'
      case 'resting': return '#8d99ae'
      default: return '#8d99ae'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'battling': return 'In Battle'
      case 'resting': return 'Resting'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb]">
      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
          <div>
            <h1 className="text-2xl font-bold text-[#2d1810]">Vendor Warriors</h1>
            <p className="text-[#6b5d52] text-sm">Find and support local heroes</p>
          </div>
          <Button
            onClick={handleRegisterVendor}
            className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-bold px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative z-10 px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
          {/* Search Bar */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b5d52]" />
              <input
                placeholder="Search vendors..."
                className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-[#ff6b35]/20 text-[#2d1810] placeholder-[#6b5d52] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#e5562e] transition-colors">
              <Filter className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#ff6b35] text-white' 
                    : 'bg-white/50 text-[#6b5d52] hover:bg-white/80'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#ff6b35] text-white' 
                    : 'bg-white/50 text-[#6b5d52] hover:bg-white/80'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-[#6b5d52]">
              {vendors.length} vendors found
            </div>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="relative z-10 px-4 pb-20">
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              onClick={() => handleVendorClick(vendor.id)}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20 hover:bg-white/90 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ff6b35]">
                    <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                  </div>
                  {vendor.isVerified && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ffd23f] rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-[#2d1810]" />
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-[#2d1810] text-lg">{vendor.name}</h3>
                    <span className="text-[#6b5d52] text-sm">{vendor.handle}</span>
                  </div>
                  <p className="text-[#6b5d52] text-sm mb-2">{vendor.specialty}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-[#ffd23f]" />
                      <span className="text-sm font-semibold text-[#2d1810]">{vendor.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-[#ff6b35]" />
                      <span className="text-sm text-[#6b5d52]">{vendor.totalVotes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-[#06d6a0]" />
                      <span className="text-sm text-[#6b5d52]">{vendor.territories}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-[#ffd23f]" />
                      <span className="text-sm text-[#6b5d52]">{vendor.battleTokens}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Arrow */}
                <div className="flex flex-col items-end space-y-2">
                  <div 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getStatusColor(vendor.status)}20`,
                      color: getStatusColor(vendor.status)
                    }}
                  >
                    {getStatusText(vendor.status)}
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#6b5d52]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
} 