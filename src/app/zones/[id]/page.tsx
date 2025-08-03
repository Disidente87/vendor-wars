'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Flame } from 'lucide-react'
import { VoteResultModal } from '@/components/VoteResultModal'

interface ZoneVendor {
  id: string
  name: string
  imageUrl: string
  controlPercentage: number
  tier: 'gold' | 'silver' | 'bronze'
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
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [voteResult, setVoteResult] = useState<{
    vendor: { name: string; imageUrl: string }
    battleTokens: number
    isVerified: boolean
  } | null>(null)

  // Mock data for zone details
  const getZoneData = (zoneId: string) => {
    const zonesData = {
      'la-paz': {
        id: zoneId,
        name: 'La Paz',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXvde6oHx_nOSIZJ-lIFS7O29bdToZRumUDVltVD2d_Q2xJEogAZLA8mdQm_pUZ_iJNvT_a3vjGHx3wyAW5LOrs__Q-TTnxsp_OcclJT2RtSjQ9KYJZZEZhxreolE4UBf3KW82Gro4J9S8hlwLvQz2vitL0chkkSfU3EfrBkDYHmGrmtsaKHNMlLm4Q4V5z9Y2T74EULdBgAw6g5mKlkl8GX5THGyVbq5d5xyYzfIHcmmFR8cLI9mJokwBZ0iX9b3gd-dMGklxJhaD',
        leadingVendor: 'Pupusas_Maria',
        vendors: [
          {
            id: '1',
            name: 'Pupusas_Maria',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArmh_Dl3y-lcC0U6GTPUu8BbyD4Xc85ySiuhbd9iuv2ggvmmN-CCoqYCfDzvDtJ6W0E4kUm2CKhm_931aB_WMDpiKItJHP8a1BK7BTwbnsZYAyQyyg8My25I3qZH0X7dM4zchWnvS7Lywd9D56oR5GVIBpP6i5hTaZhAE7UKeu2AmVTWcWuvvM3GfQnZGj5MrH90pdQz6lt8iMrMWH9BjxFILCuigd2ij7THME4lH4RNVFWzGW80hAtV2Aq4KJypqTU7AQVImk3fuL',
            controlPercentage: 65,
            tier: 'gold' as const
          },
          {
            id: '2',
            name: 'Tacos_El_Gordo',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFlg5nnDeqeMp8jdgqoRWgoBNmOWjS32u9dcBADkXLrgrkLqIjXFWv8ZVw2X2mNm93udelwF92RDYdFErWyD7QLnZpW27wY96ibMfjI0tNWcYCP61-luRlhplU4BjM-hXIGOOYs3wiZEsbcZL41XCvqvfNDf1u9pO9Eb95-h6ou8e0n7QKsL1Sa8Io7tZ7wKPXzF1STf-kL3_ptLYGlKSSCsx-cu6pLlcZGXhMcEZuc-i7-wNeDX1ZNbtoGw7eO46oV7E3Z3oc-3pB',
            controlPercentage: 25,
            tier: 'silver' as const
          },
          {
            id: '3',
            name: 'Tamales_Doña_Rosa',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqf1Mzqh03c4YiWbXrG2nRPBFc_y6f__dNWLqqwqRWyZxsAeXmcmj2DEdVfvAyr0J-hzzEEBO2lVQOcPTjvFn7vDwJYY84UO6j5j1OKNsWyv-vsbbZ746XmL0l3x1LgCO8vrRJq55bj4PjKEuZEYpmD_VqODwZ92IIVSbnVtX20umbK16rAcBCB1_Ii12Aw2SNifJ7qjvvWwcDJX7ZJVSOo0u792ka1e-8cj6PV94UWeNkWyQ31D9WT3CNDv23gMzob6ONM9VFleO8',
            controlPercentage: 10,
            tier: 'bronze' as const
          }
        ]
      },
      'condesa': {
        id: zoneId,
        name: 'La Condesa',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrD9M8Er4Pg28kaw2Bjkn0FLu1jTlcKyPvbrsABFCwGqf-obgbo8yFy2wE3Igl26yxziePEpVOH3m9oKv0mSwiihiDooSXgw9aP34JpuzGwSAVazGxITrtxU8tzTxdFsfNstO5WWMv1oFIz3uDXshtX6qK2-TOh6tyi3RPTG0Pyhe2o073A0bGAKFFEt9iHJfi1OMDOfdi2SST_CZ1YB2VBDT1I-Oji0CGq1rzyQgBBp_iUtJ9D-Xxmc1-FH4M6_OlC-aeT6DnKM4T',
        leadingVendor: 'Tacos_El_Gordo',
        vendors: [
          {
            id: '1',
            name: 'Tacos_El_Gordo',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFlg5nnDeqeMp8jdgqoRWgoBNmOWjS32u9dcBADkXLrgrkLqIjXFWv8ZVw2X2mNm93udelwF92RDYdFErWyD7QLnZpW27wY96ibMfjI0tNWcYCP61-luRlhplU4BjM-hXIGOOYs3wiZEsbcZL41XCvqvfNDf1u9pO9Eb95-h6ou8e0n7QKsL1Sa8Io7tZ7wKPXzF1STf-kL3_ptLYGlKSSCsx-cu6pLlcZGXhMcEZuc-i7-wNeDX1ZNbtoGw7eO46oV7E3Z3oc-3pB',
            controlPercentage: 70,
            tier: 'gold' as const
          },
          {
            id: '2',
            name: 'Pupusas_Maria',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArmh_Dl3y-lcC0U6GTPUu8BbyD4Xc85ySiuhbd9iuv2ggvmmN-CCoqYCfDzvDtJ6W0E4kUm2CKhm_931aB_WMDpiKItJHP8a1BK7BTwbnsZYAyQyyg8My25I3qZH0X7dM4zchWnvS7Lywd9D56oR5GVIBpP6i5hTaZhAE7UKeu2AmVTWcWuvvM3GfQnZGj5MrH90pdQz6lt8iMrMWH9BjxFILCuigd2ij7THME4lH4RNVFWzGW80hAtV2Aq4KJypqTU7AQVImk3fuL',
            controlPercentage: 20,
            tier: 'silver' as const
          },
          {
            id: '3',
            name: 'Tamales_Doña_Rosa',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqf1Mzqh03c4YiWbXrG2nRPBFc_y6f__dNWLqqwqRWyZxsAeXmcmj2DEdVfvAyr0J-hzzEEBO2lVQOcPTjvFn7vDwJYY84UO6j5j1OKNsWyv-vsbbZ746XmL0l3x1LgCO8vrRJq55bj4PjKEuZEYpmD_VqODwZ92IIVSbnVtX20umbK16rAcBCB1_Ii12Aw2SNifJ7qjvvWwcDJX7ZJVSOo0u792ka1e-8cj6PV94UWeNkWyQ31D9WT3CNDv23gMzob6ONM9VFleO8',
            controlPercentage: 10,
            tier: 'bronze' as const
          }
        ],
        battleLog: [
          {
            id: '1',
            user: '@Maria',
            vendor: 'Tacos_El_Gordo',
            tokens: 15,
            timestamp: '1 minute ago'
          },
          {
            id: '2',
            user: '@Pedro',
            vendor: 'Pupusas_Maria',
            tokens: 8,
            timestamp: '3 minutes ago'
          },
          {
            id: '3',
            user: '@Ana',
            vendor: 'Tacos_El_Gordo',
            tokens: 12,
            timestamp: '6 minutes ago'
          }
        ]
      },
      'roma': {
        id: zoneId,
        name: 'La Roma',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCii9Ybv_cNNleTHxmA6VLKt2wBNqHvp-jLEornC5c120rrZmDXgxLi2ySQTIJFhP-pWwgM6zLAodVFkjk5zo_nqF1xLLU03rJhmM8-kkhEkfUcg766VH-wNJJf9IGQMahBmFEUk6xWsJDWlA5PbkD8cvcVXQUglIhPlc8Q9FwoPTvtkx8JBwLA2R8wAps8ClQuaAUG2kwlkOrbFP-lsG0Jn03K3GQrOvG0fI1GqxgHDPVY7kyTKrUs4dQwogyKHVkS0GrpEkHNw15O',
        leadingVendor: 'Elote_Supremo',
        vendors: [
          {
            id: '1',
            name: 'Elote_Supremo',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3F5G0by5kKp0DaE0K2mG7vKynCmW6-Y0GvnDH6plby6S7zLrToTzZrT6kvGWyI0Lwyfkpwa5sE4kD_hESi8dj-pzfNbKD2wsFGVP4h54JHgyd73uwTcSs4ewyNrRmZ6LDS5sPCdfJ47g9OivP7J6oB72Cn0JHByqV7uml2-vulge6jszQaXnWNxCsEXOsoarVZjUWD-D7Gvszd7sxxs4LkZReGlG5d_XFBtfzYM_iY4NU2_g4qdYTPTvAn5WgJwTpJLniSniVsxa6',
            controlPercentage: 55,
            tier: 'gold' as const
          },
          {
            id: '2',
            name: 'Tacos_El_Gordo',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFlg5nnDeqeMp8jdgqoRWgoBNmOWjS32u9dcBADkXLrgrkLqIjXFWv8ZVw2X2mNm93udelwF92RDYdFErWyD7QLnZpW27wY96ibMfjI0tNWcYCP61-luRlhplU4BjM-hXIGOOYs3wiZEsbcZL41XCvqvfNDf1u9pO9Eb95-h6ou8e0n7QKsL1Sa8Io7tZ7wKPXzF1STf-kL3_ptLYGlKSSCsx-cu6pLlcZGXhMcEZuc-i7-wNeDX1ZNbtoGw7eO46oV7E3Z3oc-3pB',
            controlPercentage: 30,
            tier: 'silver' as const
          },
          {
            id: '3',
            name: 'Pupusas_Maria',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArmh_Dl3y-lcC0U6GTPUu8BbyD4Xc85ySiuhbd9iuv2ggvmmN-CCoqYCfDzvDtJ6W0E4kUm2CKhm_931aB_WMDpiKItJHP8a1BK7BTwbnsZYAyQyyg8My25I3qZH0X7dM4zchWnvS7Lywd9D56oR5GVIBpP6i5hTaZhAE7UKeu2AmVTWcWuvvM3GfQnZGj5MrH90pdQz6lt8iMrMWH9BjxFILCuigd2ij7THME4lH4RNVFWzGW80hAtV2Aq4KJypqTU7AQVImk3fuL',
            controlPercentage: 15,
            tier: 'bronze' as const
          }
        ],
        battleLog: [
          {
            id: '1',
            user: '@Luis',
            vendor: 'Elote_Supremo',
            tokens: 20,
            timestamp: '30 seconds ago'
          },
          {
            id: '2',
            user: '@Carmen',
            vendor: 'Tacos_El_Gordo',
            tokens: 7,
            timestamp: '2 minutes ago'
          },
          {
            id: '3',
            user: '@Roberto',
            vendor: 'Elote_Supremo',
            tokens: 15,
            timestamp: '4 minutes ago'
          }
        ]
      }
    }

    return zonesData[zoneId as keyof typeof zonesData] || zonesData['la-paz']
  }

  useEffect(() => {
    const loadZone = async () => {
      const resolvedParams = await params
      const zoneData = getZoneData(resolvedParams.id)
      // Simulate loading
      setTimeout(() => {
        setZone(zoneData)
        setLoading(false)
      }, 500)
    }
    loadZone()
  }, [params])

  const handleVote = (isVerified: boolean = false) => {
    if (!zone) return
    
    const battleTokens = isVerified ? 30 : 10
    setVoteResult({
      vendor: {
        name: zone.leadingVendor,
        imageUrl: zone.imageUrl
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'text-yellow-600'
      case 'silver':
        return 'text-gray-500'
      case 'bronze':
        return 'text-orange-700'
      default:
        return 'text-gray-600'
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'Gold'
      case 'silver':
        return 'Silver'
      case 'bronze':
        return 'Bronze'
      default:
        return tier
    }
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
            Zone: {zone.name}
          </h2>
        </div>

        {/* Hero Image */}
        <div className="@container">
          <div className="@[480px]:px-4 @[480px]:py-3">
            <div
              className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-xl min-h-[218px]"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("${zone.imageUrl}")`
              }}
            >
              <div className="flex p-4">
                <p className="text-white tracking-light text-[28px] font-bold leading-tight">
                  {zone.leadingVendor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Territory Heat */}
        <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Territory Heat
        </h3>
        <div className="flex items-center gap-4 bg-white px-4 min-h-14 justify-between">
          <p className="text-[#181511] text-base font-normal leading-normal flex-1 truncate">
            Vote Frequency
          </p>
          <div className="shrink-0">
            <div className="text-[#181511] flex size-7 items-center justify-center">
                              <Flame className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Vendor Leaderboard */}
        <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Vendor Leaderboard
        </h3>
        
        {zone.vendors.map((vendor: ZoneVendor) => (
          <div key={vendor.id} className="p-4">
            <div className="flex items-stretch justify-between gap-4 rounded-xl">
              <div className="flex flex-col gap-1 flex-[2_2_0px]">
                <p className={`text-sm font-normal leading-normal ${getTierColor(vendor.tier)}`}>
                  {getTierLabel(vendor.tier)}
                </p>
                <p className="text-[#181511] text-base font-bold leading-tight">
                  {vendor.name}
                </p>
                <p className="text-[#8a7960] text-sm font-normal leading-normal">
                  {vendor.controlPercentage}% Control
                </p>
              </div>
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                style={{
                  backgroundImage: `url("${vendor.imageUrl}")`
                }}
              />
            </div>
          </div>
        ))}

        {/* Battle Log */}
        <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Battle Log
        </h3>
        
        {zone.battleLog.map((log: BattleLog) => (
          <div key={log.id} className="flex items-center gap-4 bg-white px-4 min-h-14">
            <p className="text-[#181511] text-base font-normal leading-normal flex-1 truncate">
              {log.user} voted for {log.vendor} (+{log.tokens} BATTLE)
            </p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div>
        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
            <Button
              onClick={() => handleVote(false)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#f2920c] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#e0850b]"
            >
              <span className="truncate">Vote for This Vendor</span>
            </Button>
            <Button
              onClick={() => handleVote(true)}
              variant="outline"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#f5f3f0] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#ebe8e4] border-[#f5f3f0]"
            >
              <span className="truncate">Verify Vote</span>
            </Button>
          </div>
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