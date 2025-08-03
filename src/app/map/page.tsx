'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Search, 
  Plus, 
  Minus, 
  Navigation, 
  Map, 
  Users, 
  User, 
  List
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  vendor: string
}

export default function MapPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Mock zones data
  const zones: Zone[] = [
    { id: 'la-paz', name: 'La Paz', vendor: '@Tacos_Lupita' },
    { id: 'condesa', name: 'La Condesa', vendor: '@Empanadas_DoñaMaria' },
    { id: 'roma', name: 'La Roma', vendor: '@Churros_El_Rey' },
    { id: 'centro', name: 'Centro Histórico', vendor: '@Tamales_AbuelaRosa' },
    { id: 'norte', name: 'Zona Norte', vendor: '@Helados_Frescos' },
    { id: 'sur', name: 'Zona Sur', vendor: '@Café_Artesanal' }
  ]

  const handleZoneClick = (zoneId: string) => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    router.push(`/zones/${zoneId}`)
  }

  const handleViewVendors = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    router.push('/vendors')
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex-1">
        <div className="@container flex flex-col h-full flex-1">
          <div className="flex flex-1 flex-col @[480px]:px-4 @[480px]:py-3">
            <div 
              className="bg-cover bg-center flex min-h-[320px] flex-1 flex-col justify-between px-4 pb-4 pt-5 @[480px]:rounded-xl @[480px]:px-8 @[480px]:pb-6 @[480px]:pt-8 relative"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDyCj758karS0R2AWRB00yuq5ZGI3_q3iFkqkzBmAfMMXcRUUSijU3DatEmTjV-BBItQuQCrAnGqA0n9jlEZgnBlw6zk7")'
              }}
            >
              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <label className="flex flex-1 items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg">
                  <div className="text-[#8a7860] flex items-center justify-center shrink-0">
                    <Search className="h-6 w-6" />
                  </div>
                  <input
                    placeholder="Search for a vendor or zone"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181511] focus:outline-0 focus:ring-0 border-none bg-white focus:border-none h-full placeholder:text-[#8a7860] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>

                {/* Map Controls */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button className="flex size-10 items-center justify-center rounded-t-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors touch-manipulation active:scale-95">
                      <Plus className="h-6 w-6 text-[#181511]" />
                    </button>
                    <button className="flex size-10 items-center justify-center rounded-b-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors touch-manipulation active:scale-95">
                      <Minus className="h-6 w-6 text-[#181511]" />
                    </button>
                  </div>
                  <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors touch-manipulation active:scale-95">
                    <Navigation className="h-6 w-6 text-[#181511]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone List */}
        {zones.map((zone) => (
          <div 
            key={zone.id} 
            onClick={() => handleZoneClick(zone.id)}
            className="flex items-center gap-4 bg-white px-4 min-h-14 justify-between hover:bg-gray-50 transition-colors cursor-pointer touch-manipulation active:bg-gray-100"
            style={{ minHeight: '56px' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-[#181511] flex items-center justify-center rounded-lg bg-[#f5f3f0] shrink-0 size-10">
                <MapPin className="h-6 w-6" />
              </div>
              <p className="text-[#181511] text-base font-normal leading-normal flex-1 truncate">
                {zone.name}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-[#181511] text-base font-normal leading-normal">
                {zone.vendor}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="pb-20 md:pb-0">
        <div className="flex justify-end overflow-hidden px-5 pb-5">
          <Button
            onClick={handleViewVendors}
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-[#f2920c] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] min-w-0 gap-4 pl-4 pr-6 hover:bg-[#e0850b] active:scale-95 transition-transform touch-manipulation"
            style={{ minHeight: '56px' }}
          >
            <List className="h-6 w-6 text-[#181511]" />
            <span className="truncate">View Vendor List</span>
          </Button>
        </div>
        <div className="h-5 bg-white" />
      </div>
    </div>
  )
} 