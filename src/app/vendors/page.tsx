'use client'

import { useState, useEffect } from 'react'
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
import { VendorAvatar } from '@/components/VendorAvatar'

interface Vendor {
  id: string
  name: string
  description: string
  imageUrl: string
  category: string
  zone: string
  isVerified: boolean
  stats: {
    totalVotes: number
    verifiedVotes: number
    winRate: number
    totalBattles: number
  }
  createdAt: string
}

export default function VendorsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch vendors from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/vendors')
        const result = await response.json()
        
        if (result.success) {
          setVendors(result.data)
        } else {
          setError(result.error || 'Failed to load vendors')
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
        setError('Failed to load vendors')
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`)
  }

  const handleRegisterVendor = () => {
    router.push('/vendors/register')
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

      {/* Loading State */}
      {loading && (
        <div className="relative z-10 px-4 pb-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#ff6b35]/20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35] mx-auto"></div>
            <p className="mt-2 text-[#6b5d52]">Loading vendors...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="relative z-10 px-4 pb-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-red-200 text-center">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e5562e]"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Vendors List */}
      {!loading && !error && (
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
                  <VendorAvatar 
                    vendor={vendor}
                    size="md"
                    showVerification={true}
                  />

                  {/* Vendor Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-[#2d1810] text-lg">{vendor.name}</h3>
                      <span className="text-[#6b5d52] text-sm">@{vendor.name.toLowerCase().replace(/\s+/g, '_')}</span>
                    </div>
                    <p className="text-[#6b5d52] text-sm mb-2">{vendor.description?.substring(0, 60)}...</p>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-[#ffd23f]" />
                        <span className="text-sm font-semibold text-[#2d1810]">{vendor.stats?.winRate || 0}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-[#ff6b35]" />
                        <span className="text-sm text-[#6b5d52]">{vendor.stats?.totalVotes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4 text-[#06d6a0]" />
                        <span className="text-sm text-[#6b5d52]">{vendor.stats?.totalBattles || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-[#ffd23f]" />
                        <span className="text-sm text-[#6b5d52]">{vendor.stats?.verifiedVotes || 0}</span>
                      </div>
                    </div>
                    
                    {/* Zone */}
                    <div className="flex items-center space-x-1 mt-1">
                      <Map className="w-3 h-3 text-[#6b5d52]" />
                      <span className="text-xs text-[#6b5d52]">{vendor.zone}</span>
                    </div>
                  </div>

                  {/* Status and Arrow */}
                  <div className="flex flex-col items-end space-y-2">
                    <div 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: vendor.isVerified ? '#06d6a020' : '#ff6b3520',
                        color: vendor.isVerified ? '#06d6a0' : '#ff6b35'
                      }}
                    >
                      {vendor.isVerified ? 'Verified' : 'Unverified'}
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#6b5d52]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 