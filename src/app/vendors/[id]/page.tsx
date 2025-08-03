'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Map, List, User, Users } from 'lucide-react'
import { VoteResultModal } from '@/components/VoteResultModal'
import type { Vendor } from '@/types'

export default function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'rewards'>('about')
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [voteResult, setVoteResult] = useState<{
    vendor: { name: string; imageUrl: string }
    battleTokens: number
    isVerified: boolean
  } | null>(null)

  useEffect(() => {
    const loadVendor = async () => {
      const resolvedParams = await params
      fetchVendor(resolvedParams.id)
    }
    loadVendor()
  }, [params])

  const fetchVendor = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendors/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setVendor(result.data)
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (isVerified: boolean = false) => {
    if (!vendor) return
    
    const battleTokens = isVerified ? 30 : 10
    setVoteResult({
      vendor: {
        name: vendor.name,
        imageUrl: vendor.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHROMh12mMM-2_gGTJ3qI5aTzS2u54hFmIE8RVqt907EZaLdl9Wci_s7MqEJLyqRqXi9_DYR7RKjXAETBsR6o5wbq0EzmfOueAay3hZwj3rnv9J88qPS_EMHpmdEzs9dOezTCe8KgHHwrozDymOIwt-gZd-tSI4HAQdkNxRca0CVF1tC-2ykiyxW2lySuWyqRKSYkowmjogIX02Mypco2Yv-_GTVECobgspT3GJUMkmMI3cGbInsrO0rAaDpjoUXsMXPT23HKyb7tK'
      },
      battleTokens,
      isVerified
    })
    setShowVoteModal(true)
  }

  const handleCloseVoteModal = () => {
    setShowVoteModal(false)
    setVoteResult(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor profile...</p>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor not found</h3>
          <p className="text-gray-600">The vendor you're looking for doesn't exist</p>
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
            Vendor Profile
          </h2>
        </div>

        {/* Hero Image */}
        <div className="@container">
          <div className="@[480px]:px-4 @[480px]:py-3">
            <div
              className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-xl min-h-[218px]"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("${vendor.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrD9M8Er4Pg28kaw2Bjkn0FLu1jTlcKyPvbrsABFCwGqf-obgbo8yFy2wE3Igl26yxziePEpVOH3m9oKv0mSwiihiDooSXgw9aP34JpuzGwSAVazGxITrtxU8tzTxdFsfNstO5WWMv1oFIz3uDXshtX6qK2-TOh6tyi3RPTG0Pyhe2o073A0bGAKFFEt9iHJfi1OMDOfdi2SST_CZ1YB2VBDT1I-Oji0CGq1rzyQgBBp_iUtJ9D-Xxmc1-FH4M6_OlC-aeT6DnKM4T'}")`
              }}
            >
              <div className="flex p-4">
                <p className="text-white tracking-light text-[28px] font-bold leading-tight">
                  {vendor.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pb-3">
          <div className="flex border-b border-[#e6e1db] px-4 gap-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'about'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'about' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                About
              </p>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'reviews'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'reviews' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                Reviews
              </p>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'rewards'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'rewards' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                Rewards
              </p>
            </button>
          </div>
        </div>

        {/* About Tab Content */}
        {activeTab === 'about' && (
          <div>
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Zone
            </h3>
            <p className="text-[#181511] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {vendor.zone || 'La Condesa'}
            </p>
            
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Category
            </h3>
            <p className="text-[#181511] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {vendor.category}
            </p>
            
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Hours
            </h3>
            <p className="text-[#181511] text-base font-normal leading-normal pb-3 pt-1 px-4">
              10 AM - 10 PM
            </p>
            
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Photos
            </h3>
            <div className="flex w-full grow bg-white @container p-4">
              <div className="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-[3/2] rounded-xl grid grid-cols-[2fr_1fr_1fr]">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none row-span-2"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCii9Ybv_cNNleTHxmA6VLKt2wBNqHvp-jLEornC5c120rrZmDXgxLi2ySQTIJFhP-pWwgM6zLAodVFkjk5zo_nqF1xLLU03rJhmM8-kkhEkfUcg766VH-wNJJf9IGQMahBmFEUk6xWsJDWlA5PbkD8cvcVXQUglIhPlc8Q9FwoPTvtkx8JBwLA2R8wAps8ClQuaAUG2kwlkOrbFP-lsG0Jn03K3GQrOvG0fI1GqxgHDPVY7kyTKrUs4dQwogyKHVkS0GrpEkHNw15O")'
                  }}
                />
                <div
                  className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none col-span-2"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3F5G0by5kKp0DaE0K2mG7vKynCmW6-Y0GvnDH6plby6S7zLrToTzZrT6kvGWyI0Lwyfkpwa5sE4kD_hESi8dj-pzfNbKD2wsFGVP4h54JHgyd73uwTcSs4ewyNrRmZ6LDS5sPCdfJ47g9OivP7J6oB72Cn0JHByqV7uml2-vulge6jszQaXnWNxCsEXOsoarVZjUWD-D7Gvszd7sxxs4LkZReGlG5d_XFBtfzYM_iY4NU2_g4qdYTPTvAn5WgJwTpJLniSniVsxa6")'
                  }}
                />
                <div
                  className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none col-span-2"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsavZ2bgyx3mQJL04HOY2cobc4nlKZqx69lzEaTk7LCd6JvQeygDmuY0SkxiCkjisBvzeWsNn59i7d8KxQu2OjLsbD5UHUQ8fKvcytZowZ1S-wm8LUMofPHeTbuKSWcDioZ70VI5uX42IKe9HsipBPXwcQ3VnIeADUUtTg2OcCKEI7Oer63LRufR2Kk2rKrTFuSvQyOc7zIQQ4s-12qYlsCdrJf_0yYP2WAN3RhcoRWKZj0afZ8qkKCgE_-hAFit07HG_oA3wM045D")'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="px-4 py-6">
            <p className="text-[#181511] text-base font-normal leading-normal">
              Reviews coming soon...
            </p>
          </div>
        )}

        {/* Rewards Tab Content */}
        {activeTab === 'rewards' && (
          <div className="px-4 py-6">
            <p className="text-[#181511] text-base font-normal leading-normal">
              Rewards system coming soon...
            </p>
          </div>
        )}

                        {/* Action Buttons */}
                <div className="flex justify-stretch">
                  <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-between">
                    <Button
                      onClick={() => handleVote(false)}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f2920c] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e0850b]"
                    >
                      <span className="truncate">Vote & Support</span>
                    </Button>
                    <Button
                      onClick={() => handleVote(true)}
                      variant="outline"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f5f3f0] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#ebe8e4] border-[#f5f3f0]"
                    >
                      <span className="truncate">Verified Vote</span>
                    </Button>
                  </div>
                </div>
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
          
          <button
            onClick={() => router.push('/vendors')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#181511]"
          >
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