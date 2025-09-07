'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSyncBalanceOnMount } from '@/hooks/useSyncBalanceOnMount'
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
import { FARCASTER_CONFIG, getSubcategories } from '@/config/farcaster'

interface Vendor {
  id: string
  name: string
  description: string
  imageUrl: string
  category: string
  subcategories?: string[] // Array of subcategory IDs
  zone: string
  zoneId?: string // Zone ID for filtering
  delegation?: string // Delegation field
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
  
  // Sincronizar balance automáticamente al montar (solo una vez por sesión)
  useSyncBalanceOnMount()
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [selectedZone, setSelectedZone] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDelegation, setSelectedDelegation] = useState('all')
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])

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

  // Zone mapping: name to ID
  const zoneMapping = {
    'all': 'all',
    'Zona Centro': '1',
    'Zona Norte': '2', 
    'Zona Sur': '3',
    'Zona Este': '4',
    'Zona Oeste': '5'
  }
  
  // Filter options
  const zones = ['all', 'Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste', 'Zona Centro']
  const categories = ['all', ...FARCASTER_CONFIG.MAIN_CATEGORIES.map(cat => cat.id)]
  const delegations = ['all', 'Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa', 'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'La Magdalena Contreras', 'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco']
  
  // Get available subcategories based on selected category
  const availableSubcategories = selectedCategory !== 'all' ? getSubcategories(selectedCategory) : []
  
  // Debug subcategories
  if (process.env.NODE_ENV === 'development') {
    console.log('Subcategory debug:', {
      selectedCategory,
      availableSubcategories,
      availableSubcategoriesLength: availableSubcategories.length,
      selectedSubcategories,
      vendorsWithSubcategories: vendors.filter(v => v.subcategories && v.subcategories.length > 0).length
    })
  }

  // Filter vendors based on search and filters
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Zone matching by ID to avoid partial name conflicts (e.g., "oeste" contains "este")
    const selectedZoneId = zoneMapping[selectedZone as keyof typeof zoneMapping]
    const matchesZone = selectedZone === 'all' || 
      (vendor.zoneId && vendor.zoneId === selectedZoneId)
    
    // More flexible category matching
    const matchesCategory = selectedCategory === 'all' || 
      (vendor.category && (
        vendor.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(vendor.category.toLowerCase())
      ))
    
    // Delegation matching - compare with delegation field
    const matchesDelegation = selectedDelegation === 'all' || 
      (vendor.delegation && vendor.delegation === selectedDelegation)
    
    // Filter by subcategories - vendor must have at least one of the selected subcategories
    const matchesSubcategories = selectedSubcategories.length === 0 || 
      (vendor.subcategories && vendor.subcategories.some(sub => selectedSubcategories.includes(sub)))
    
    // Debug subcategory filtering
    if (process.env.NODE_ENV === 'development' && selectedSubcategories.length > 0) {
      console.log(`Vendor ${vendor.name}:`, {
        vendorSubcategories: vendor.subcategories,
        selectedSubcategories,
        matchesSubcategories,
        hasSubcategories: !!vendor.subcategories,
        subcategoriesLength: vendor.subcategories?.length || 0
      })
    }
    
    return matchesSearch && matchesZone && matchesCategory && matchesDelegation && matchesSubcategories
  })

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`)
  }

  const handleRegisterVendor = () => {
    router.push('/vendors/register')
  }

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Clear subcategories when category changes
    setSelectedSubcategories([])
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
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
                showFilters ? 'bg-[#e5562e]' : 'bg-[#ff6b35] hover:bg-[#e5562e]'
              }`}
            >
              <Filter className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              {/* Filter Header with Close Button */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2d1810]">Advanced Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-[#6b5d52] hover:text-[#2d1810] transition-colors"
                  title="Close filters"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Zone Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#2d1810] mb-2">Zone</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-[#2d1810] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50"
                  >
                    {zones.map(zone => (
                      <option key={zone} value={zone}>
                        {zone === 'all' ? 'All Zones' : zone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#2d1810] mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-[#2d1810] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50"
                  >
                    {categories.map(category => {
                      const categoryInfo = category === 'all' ? null : FARCASTER_CONFIG.MAIN_CATEGORIES.find(cat => cat.id === category)
                      return (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : (categoryInfo?.name || category)}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Delegation Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#2d1810] mb-2">Delegation</label>
                  <select
                    value={selectedDelegation}
                    onChange={(e) => setSelectedDelegation(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-[#2d1810] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50"
                  >
                    {delegations.map(delegation => (
                      <option key={delegation} value={delegation}>
                        {delegation === 'all' ? 'All Delegations' : delegation}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategories Filter */}
                {selectedCategory !== 'all' && availableSubcategories.length > 0 && (
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-[#2d1810] mb-2">
                      Specialties
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                      {availableSubcategories.map((subcategory) => (
                        <label
                          key={subcategory.id}
                          className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubcategories.includes(subcategory.id)}
                            onChange={() => handleSubcategoryToggle(subcategory.id)}
                            className="w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35] focus:ring-2"
                          />
                          <span className="text-sm">{subcategory.icon}</span>
                          <span className="text-sm font-medium text-[#2d1810]">{subcategory.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-[#6b5d52] mt-2">
                      Select specific specialties to filter by
                    </p>
                  </div>
                )}
              </div>
              
              {/* Filter Actions */}
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedZone('all')
                    setSelectedCategory('all')
                    setSelectedDelegation('all')
                    setSelectedSubcategories([])
                  }}
                  className="px-4 py-2 text-sm text-[#6b5d52] hover:text-[#2d1810] transition-colors"
                >
                  Clear All Filters
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e5562e] transition-colors text-sm font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

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
              {filteredVendors.length} vendors found
              {/* Debug: Show available data */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <div>Available zones: {[...new Set(vendors.map(v => `${v.zone} (${v.zoneId})`))].join(', ')}</div>
                  <div>Available categories: {[...new Set(vendors.map(v => v.category))].join(', ')}</div>
                  <div>Available delegations: {[...new Set(vendors.map(v => v.delegation).filter(Boolean))].join(', ') || 'none'}</div>
                  <div>Selected subcategories: {selectedSubcategories.join(', ') || 'none'}</div>
                  <div>Available subcategories: {[...new Set(vendors.flatMap(v => v.subcategories || []))].join(', ') || 'none'}</div>
                  <div>Filter debug: selectedCategory={selectedCategory}, selectedDelegation={selectedDelegation}, selectedSubcategories={selectedSubcategories.length}</div>
                </div>
              )}
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
            {filteredVendors.map((vendor) => (
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
                    <div className="mb-2">
                      <h3 className="font-bold text-[#2d1810] text-lg leading-tight truncate max-w-[200px]" title={vendor.name}>
                        {vendor.name.length > 20 ? `${vendor.name.substring(0, 20)}...` : vendor.name}
                      </h3>
                      {vendor.isVerified && (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-xs text-blue-600 font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[#6b5d52] text-sm mb-2 line-clamp-2" title={vendor.description}>
                      {vendor.description?.length > 80 ? `${vendor.description.substring(0, 80)}...` : vendor.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1 bg-[#ffd23f]/10 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 text-[#ffd23f]" />
                        <span className="text-xs font-semibold text-[#2d1810]">{vendor.stats?.winRate || 0}%</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#ff6b35]/10 px-2 py-1 rounded-lg">
                        <Flame className="w-3 h-3 text-[#ff6b35]" />
                        <span className="text-xs font-medium text-[#6b5d52]">{vendor.stats?.totalVotes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#06d6a0]/10 px-2 py-1 rounded-lg">
                        <Trophy className="w-3 h-3 text-[#06d6a0]" />
                        <span className="text-xs font-medium text-[#6b5d52]">{vendor.stats?.totalBattles || 0}</span>
                      </div>
                    </div>
                    
                    {/* Zone */}
                    <div className="flex items-center space-x-1 mt-2">
                      <Map className="w-3 h-3 text-[#6b5d52]" />
                      <span className="text-xs text-[#6b5d52] bg-gray-100 px-2 py-1 rounded-full">{vendor.zone}</span>
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