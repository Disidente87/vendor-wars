'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Map, 
  List, 
  User, 
  Users 
} from 'lucide-react'
import { VoteResultModal } from '@/components/VoteResultModal'

interface Vendor {
  id: string
  name: string
  description: string
  imageUrl: string
  zone: string
}

export default function VendorsPage() {
  const router = useRouter()
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [voteResult, setVoteResult] = useState<{
    vendor: Vendor
    battleTokens: number
    isVerified: boolean
  } | null>(null)

  // Mock vendors data grouped by zone
  const vendorsByZone: Record<string, Vendor[]> = {
    'La Paz': [
      {
        id: '1',
        name: 'Tacos Lupita',
        description: 'Authentic street tacos with homemade tortillas',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpi0Qxv3Y2ZffYYKy8Gkm6bfw5ZTL6D8JaLbYgh1DpuL5qZIrzhVtobtKKIbqqTpY03WfAIC0Vz_1fDH2LryuYH2hiE7IBH3cf69jW9F6ShsaI74kboXBUXKNVqH5Azxl3GXvifhRAuVVK4pP5xqoRyCISgbmvUWMn-iWT4bYQbqOmp_SOeBWVJqRYQ0MCuBsGauYs4nZi9gyqZHtoR3X4QsUkb-sOcwIbbJQoBNqIPoL5RXQTq21SE0vXGEkzyse-UfOP1hKiOgFD',
        zone: 'La Paz'
      },
      {
        id: '2',
        name: 'Empanadas Doña María',
        description: 'Traditional empanadas with secret family recipe',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrcqzIrczhjEy_VnXcULjwkuj8gIV6SmfXdkHSFe0RXLFJEWWDJEaXM_oSWAN3KBonPkCUSK6iiat_vUXEVXxCCPKQyhpgopbrrtiv2xg4uvhiV41hecnJRnZpoJfcYENBF0fiVl2Crsiakr4m_3OA-ceYpiD49wuC-5b4YMgPz2_YTZPZwZ0dDlQNc_EEvnG0bwEf-4Dfl2wRVKk_qj7njlGNQBmj6F04T-lskea2OwpUzXmSu3jeRR2jwv3TumlRaAMU2mCSn7Dt',
        zone: 'La Paz'
      }
    ],
    'La Condesa': [
      {
        id: '3',
        name: 'Churros El Rey',
        description: 'Fresh churros with chocolate dipping sauce',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBBHG7wNe06YgItxPYtZrNfkW6uWauEIBDkXy3s-W53gEsDkUcbvr3OFiSnOlp3GKzbxLZ8_V_pfT3dm5pcTGj6jFy_gJjbjI9SAajpWlMzkn2FmlKrhBvRCUHzOR4OmQYr9UQNdROBkbARobU3qanZ8lMp1qYAOd-bwEsYwFw-OawnXGfFtSVVfeJiNICjyKYgxZcVHjbqP98Kba0QtbyagHgYlw1JtBnO6WGpkonU5ok6X8LHmle8HGhVl_ExHvDqYO4I9F7JJ4y',
        zone: 'La Condesa'
      }
    ],
    'La Roma': [
      {
        id: '4',
        name: 'Tamales Abuela Rosa',
        description: 'Homemade tamales with love and tradition',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXGXdNUtj6vd_bmhqcmsrd1mknTagtl29KZLj5ULoBd3TnSKhcxU5J2PQwH1em-WeHUNzQqSSG-1mzx7f8KvFm4x8XY7XjWF2shs2oqZIl8q6J2UpclNQhotZ_a9X6hqlOtt4wGXTLv15Vpp4pqFuYPVwbczwQcL_UyzWihryoPtBHhaMPnPDJiYAw5XAFhT7ZqPgpTMbepWIM7bfgNUZNW_3U887dnKSNFiHY6fW_BrRTucBPHWN4SVMgI5ffQj_ATVyWNBPTna9q',
        zone: 'La Roma'
      }
    ]
  }

  const handleVote = (vendor: Vendor, isVerified: boolean = false) => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    
    const battleTokens = isVerified ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30) + 20
    
    setVoteResult({
      vendor,
      battleTokens,
      isVerified
    })
    setShowVoteModal(true)
  }

  const handleCloseVoteModal = () => {
    setShowVoteModal(false)
    setVoteResult(null)
  }

  const handleAddVendor = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    router.push('/vendors/register')
  }

  const handleVendorClick = (vendorId: string) => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    router.push(`/vendors/${vendorId}`)
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <button
            onClick={() => router.back()}
            className="text-[#181511] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full transition-colors touch-manipulation active:scale-95"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Vendors
          </h2>
        </div>

        {/* Add New Vendor Button */}
        <div className="flex px-4 py-3 justify-center">
          <Button
            onClick={handleAddVendor}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#f2920c] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#e0850b] active:scale-95 transition-transform touch-manipulation"
            style={{ minHeight: '48px' }}
          >
            <span className="truncate">+ Add New Vendor</span>
          </Button>
        </div>

        {/* Vendors by Zone */}
        {Object.entries(vendorsByZone).map(([zone, zoneVendors]) => (
          <div key={zone}>
            <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              {zone}
            </h2>
            
            {zoneVendors.map((vendor) => (
              <div 
                key={vendor.id} 
                className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between hover:bg-gray-50 transition-colors touch-manipulation active:bg-gray-100"
                style={{ minHeight: '72px' }}
              >
                <div 
                  className="flex items-center gap-4 flex-1"
                  onClick={() => handleVendorClick(vendor.id)}
                >
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14"
                    style={{
                      backgroundImage: `url("${vendor.imageUrl}")`
                    }}
                  />
                  <div className="flex flex-col justify-center flex-1">
                    <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">
                      {vendor.name}
                    </p>
                    <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
                      {vendor.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    onClick={() => handleVote(vendor, false)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#f5f3f0] text-[#181511] text-sm font-medium leading-normal w-fit hover:bg-[#ebe8e4] active:scale-95 transition-transform touch-manipulation"
                    style={{ minHeight: '32px' }}
                  >
                    <span className="truncate">Support</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#f5f3f0] bg-white px-4 pb-3 pt-2">
          <button
            onClick={() => router.push('/map')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7960] hover:text-[#181511] transition-colors"
          >
            <Map className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Map</p>
          </button>
          
          <button className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[#181511]">
            <List className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Vendors</p>
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7960] hover:text-[#181511] transition-colors"
          >
            <User className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
          </button>
          
          <button
            onClick={() => router.push('/leaderboard')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7960] hover:text-[#181511] transition-colors"
          >
            <Users className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Social</p>
          </button>
        </div>
        <div className="h-5 bg-white" />
      </div>

      {/* Vote Result Modal */}
      {voteResult && (
        <VoteResultModal
          isOpen={showVoteModal}
          onClose={handleCloseVoteModal}
          vendor={voteResult.vendor}
          battleTokens={voteResult.battleTokens}
          isVerified={voteResult.isVerified}
        />
      )}
    </div>
  )
} 