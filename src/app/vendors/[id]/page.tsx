'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Crown, Star, Users, Target } from 'lucide-react'
import { VoteResultModal } from '@/components/VoteResultModal'
import type { Vendor } from '@/types'
import { getVendorIdFromSlug } from '@/lib/route-utils'

interface TopVoter {
  id: string
  username: string
  displayName: string
  avatar: string
  votesGiven: number
  totalVotes: number
  isVerified: boolean
}

export default function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'rewards' | 'supporters'>('about')
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
      // Try to get vendor ID from slug first
      const actualVendorId = getVendorIdFromSlug(id) || id
      
      const response = await fetch(`/api/vendors/${actualVendorId}`)
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

  // Mock data for top voters
  const getTopVoters = (vendorId: string): TopVoter[] => {
    const topVotersData = {
      '1': [
        {
          id: '1',
          username: 'foodwarrior',
          displayName: 'FoodWarrior',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          votesGiven: 15,
          totalVotes: 89,
          isVerified: true
        },
        {
          id: '2',
          username: 'tacolover',
          displayName: 'TacoLover',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          votesGiven: 12,
          totalVotes: 67,
          isVerified: true
        },
        {
          id: '3',
          username: 'pupusas_fan',
          displayName: 'PupusasFan',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          votesGiven: 8,
          totalVotes: 45,
          isVerified: false
        }
      ],
      '2': [
        {
          id: '4',
          username: 'taco_king',
          displayName: 'TacoKing',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          votesGiven: 18,
          totalVotes: 92,
          isVerified: true
        },
        {
          id: '5',
          username: 'street_foodie',
          displayName: 'StreetFoodie',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          votesGiven: 14,
          totalVotes: 78,
          isVerified: true
        },
        {
          id: '6',
          username: 'mexican_cuisine',
          displayName: 'MexicanCuisine',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          votesGiven: 9,
          totalVotes: 56,
          isVerified: false
        }
      ],
      '3': [
        {
          id: '7',
          username: 'coffee_master',
          displayName: 'CoffeeMaster',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          votesGiven: 11,
          totalVotes: 63,
          isVerified: true
        },
        {
          id: '8',
          username: 'cafe_lover',
          displayName: 'CafeLover',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          votesGiven: 7,
          totalVotes: 41,
          isVerified: false
        },
        {
          id: '9',
          username: 'barista_pro',
          displayName: 'BaristaPro',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          votesGiven: 6,
          totalVotes: 38,
          isVerified: false
        }
      ],
      '4': [
        {
          id: '10',
          username: 'pizza_chef',
          displayName: 'PizzaChef',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          votesGiven: 13,
          totalVotes: 71,
          isVerified: true
        },
        {
          id: '11',
          username: 'italian_food',
          displayName: 'ItalianFood',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          votesGiven: 10,
          totalVotes: 58,
          isVerified: true
        },
        {
          id: '12',
          username: 'napoli_fan',
          displayName: 'NapoliFan',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          votesGiven: 8,
          totalVotes: 47,
          isVerified: false
        }
      ],
      '5': [
        {
          id: '13',
          username: 'sushi_master',
          displayName: 'SushiMaster',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          votesGiven: 16,
          totalVotes: 84,
          isVerified: true
        },
        {
          id: '14',
          username: 'japanese_food',
          displayName: 'JapaneseFood',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          votesGiven: 12,
          totalVotes: 69,
          isVerified: true
        },
        {
          id: '15',
          username: 'asian_cuisine',
          displayName: 'AsianCuisine',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          votesGiven: 9,
          totalVotes: 52,
          isVerified: false
        }
      ]
    }
    return topVotersData[vendorId as keyof typeof topVotersData] || topVotersData['1']
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
          <p className="text-gray-600">The vendor you&apos;re looking for doesn&apos;t exist</p>
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

        {/* Action Buttons - Moved to top for better visibility */}
        <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <div className="flex gap-3 justify-between max-w-md mx-auto">
            <Button
              onClick={() => handleVote(false)}
              className="flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#f2920c] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#e0850b] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span className="truncate">Vote & Support</span>
            </Button>
            <Button
              onClick={() => handleVote(true)}
              variant="outline"
              className="flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#f5f3f0] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#ebe8e4] border-[#f5f3f0] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span className="truncate">Verified Vote</span>
            </Button>
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
            <button
              onClick={() => setActiveTab('supporters')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'supporters'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'supporters' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                Supporters
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

        {/* Supporters Tab Content */}
        {activeTab === 'supporters' && (
          <div className="px-4 py-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
              <h3 className="font-bold text-[#2d1810] mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-[#ffd23f]" />
                Top Supporters
              </h3>
              <div className="space-y-3">
                {getTopVoters(vendor.id).map((voter, index) => (
                  <div 
                    key={voter.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-orange-200/30 hover:bg-white/90 transition-colors"
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

                    {/* User Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                        <img 
                          src={voter.avatar} 
                          alt={voter.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {voter.isVerified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-[#2d1810] text-sm truncate">{voter.displayName}</h4>
                        {voter.isVerified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[#6b5d52]">
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{voter.votesGiven} votes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{voter.totalVotes} total</span>
                        </div>
                      </div>
                    </div>

                    {/* Vote Percentage */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-semibold text-[#2d1810]">
                        {Math.round((voter.votesGiven / voter.totalVotes) * 100)}%
                      </div>
                      <div className="text-xs text-[#6b5d52]">of votes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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