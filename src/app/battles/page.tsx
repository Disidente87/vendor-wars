'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface LiveBattle {
  id: string
  title: string
  zone: string
  imageUrl: string
  progress: number
  votes: number
}

interface LeaderboardEntry {
  id: string
  name: string
  avatarUrl: string
  points: number
  rank: number
}

export default function BattlesPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 18
  })

  // Mock data for live battles
  const liveBattles: LiveBattle[] = [
    {
      id: '1',
      title: 'Taco Truck vs. Empanada Stand',
      zone: 'Zone 1',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpi0Qxv3Y2ZffYYKy8Gkm6bfw5ZTL6D8JaLbYgh1DpuL5qZIrzhVtobtKKIbqqTpY03WfAIC0Vz_1fDH2LryuYH2hiE7IBH3cf69jW9F6ShsaI74kboXBUXKNVqH5Azxl3GXvifhRAuVVK4pP5xqoRyCISgbmvUWMn-iWT4bYQbqOmp_SOeBWVJqRYQ0MCuBsGauYs4nZi9gyqZHtoR3X4QsUkb-sOcwIbbJQoBNqIPoL5RXQTq21SE0vXGEkzyse-UfOP1hKiOgFD',
      progress: 68.18,
      votes: 60
    },
    {
      id: '2',
      title: 'Ice Cream Cart vs. Churro Vendor',
      zone: 'Zone 2',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrcqzIrczhjEy_VnXcULjwkuj8gIV6SmfXdkHSFe0RXLFJEWWDJEaXM_oSWAN3KBonPkCUSK6iiat_vUXEVXxCCPKQyhpgopbrrtiv2xg4uvhiV41hecnJRnZpoJfcYENBF0fiVl2Crsiakr4m_3OA-ceYpiD49wuC-5b4YMgPz2_YTZPZwZ0dDlQNc_EEvnG0bwEf-4Dfl2wRVKk_qj7njlGNQBmj6F04T-lskea2OwpUzXmSu3jeRR2jwv3TumlRaAMU2mCSn7Dt',
      progress: 51.14,
      votes: 45
    },
    {
      id: '3',
      title: 'Fruit Stand vs. Tamale Seller',
      zone: 'Zone 3',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBBHG7wNe06YgItxPYtZrNfkW6uWauEIBDkXy3s-W53gEsDkUcbvr3OFiSnOlp3GKzbxLZ8_V_pfT3dm5pcTGj6jFy_gJjbjI9SAajpWlMzkn2FmlKrhBvRCUHzOR4OmQYr9UQNdROBkbARobU3qanZ8lMp1qYAOd-bwEsYwFw-OawnXGfFtSVVfeJiNICjyKYgxZcVHjbqP98Kba0QtbyagHgYlw1JtBnO6WGpkonU5ok6X8LHmle8HGhVl_ExHvDqYO4I9F7JJ4y',
      progress: 85.23,
      votes: 75
    }
  ]

  // Mock data for leaderboard
  const leaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Alejandro',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXGXdNUtj6vd_bmhqcmsrd1mknTagtl29KZLj5ULoBd3TnSKhcxU5J2PQwH1em-WeHUNzQqSSG-1mzx7f8KvFm4x8XY7XjWF2shs2oqZIl8q6J2UpclNQhotZ_a9X6hqlOtt4wGXTLv15Vpp4pqFuYPVwbczwQcL_UyzWihryoPtBHhaMPnPDJiYAw5XAFhT7ZqPgpTMbepWIM7bfgNUZNW_3U887dnKSNFiHY6fW_BrRTucBPHWN4SVMgI5ffQj_ATVyWNBPTna9q',
      points: 1200,
      rank: 1
    },
    {
      id: '2',
      name: 'Sofia',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMTOotI42IKxLnOjddHJBprL6i_jJ09YmI_ErkMj0IE6GQfA3flnyw8Fq1BmKr_lJljEl3mcCEUKQYBSe0x0cIPU1yND2xz_N9P9eRq-o8wQrjoIeosTbv9CnAR9ZGHJzCVSVfjqgMRjZ_JmpOU1SKY-RzRMOCuI9VccNUvsmkxCjj2FRmlK8FzKZ88ldCjF_9bHUqDGnnKkJoFHkhNHmN747P5InQdy5BMRYmQdswYt9_0P7L6aorChLnrVsdzuzkyHU11WZyTX1s',
      points: 1150,
      rank: 2
    },
    {
      id: '3',
      name: 'Mateo',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgq-DJyyvzNVyEMermfs48JqKqif2Sw8ezCmKDAasZTGn9mDVAdXbvXfxyJXEwuFsa9Gw_JV8quhp0-f13rqsqq8TK1EKXWaFeiSErFXNynMT2eRL3Ee2UFdIxUlhd1s3FtQxV3xDjfZPMnfilOUhYBgPanPkt-rutEqaFRH04hR3OxGnI1i1luGv9qA3roebljy5n2sfqDnG5k37uBB3IHzNartyahkpviQ65S7l7M0fIigbHOlhboB4gpRhD8OpEjq0-Wc8tu47H',
      points: 1100,
      rank: 3
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) {
              hours--
            } else {
              hours = 23
              if (days > 0) {
                days--
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleJoinBattle = () => {
    // TODO: Implement join battle functionality
    console.log('Join battle clicked')
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
            Vendor Wars
          </h2>
        </div>

        {/* Event Banner */}
        <div className="@container">
          <div className="@[480px]:px-4 @[480px]:py-3">
            <div
              className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-xl min-h-[218px]"
              style={{
                backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDplreiXFYzKEKTjcWX-JxeNfYoagbl2bftn1LL3zm3XNzRyrE-Dxmw_rjLT0giR2P1kjNR1sHKxBIJIJsDv_NYvD5MUldyyynjI_hBrPDtTM7ZncFgNEGQmxfSq3Cv8nDUm-iXyH0dqczXos5LqTJkDR4zeNU-pROOSBEnkBM6gc5GmaQ6k-tCgTDkmasfOV_IX6sDBTMdgPpvZw0R7-bcRxixdYMByZMyKCouZp7C3CaQeELYcLLkk3MjLn5mFmL2S-DL6f5QcD9")'
              }}
            >
              <div className="flex p-4">
                <p className="text-white tracking-light text-[28px] font-bold leading-tight">
                  Weekend Territory Clash!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex gap-4 py-6 px-4">
          <div className="flex grow basis-0 flex-col items-stretch gap-4">
            <div className="flex h-14 grow items-center justify-center rounded-xl px-3 bg-[#f5f3f0]">
              <p className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em]">
                {countdown.days}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-[#181511] text-sm font-normal leading-normal">Days</p>
            </div>
          </div>
          <div className="flex grow basis-0 flex-col items-stretch gap-4">
            <div className="flex h-14 grow items-center justify-center rounded-xl px-3 bg-[#f5f3f0]">
              <p className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em]">
                {countdown.hours}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-[#181511] text-sm font-normal leading-normal">Hours</p>
            </div>
          </div>
          <div className="flex grow basis-0 flex-col items-stretch gap-4">
            <div className="flex h-14 grow items-center justify-center rounded-xl px-3 bg-[#f5f3f0]">
              <p className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em]">
                {countdown.minutes}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-[#181511] text-sm font-normal leading-normal">Minutes</p>
            </div>
          </div>
          <div className="flex grow basis-0 flex-col items-stretch gap-4">
            <div className="flex h-14 grow items-center justify-center rounded-xl px-3 bg-[#f5f3f0]">
              <p className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em]">
                {countdown.seconds}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-[#181511] text-sm font-normal leading-normal">Seconds</p>
            </div>
          </div>
        </div>

        {/* Live Battles */}
        <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Live Battles
        </h2>
        
        {liveBattles.map((battle) => (
          <div key={battle.id} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
            <div className="flex items-center gap-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14"
                style={{
                  backgroundImage: `url("${battle.imageUrl}")`
                }}
              />
              <div className="flex flex-col justify-center">
                <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">
                  {battle.title}
                </p>
                <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
                  {battle.zone}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-[88px] overflow-hidden rounded-sm bg-[#e6e1db]">
                  <div 
                    className="h-1 rounded-full bg-[#181511] transition-all duration-300"
                    style={{ width: `${battle.progress}%` }}
                  />
                </div>
                <p className="text-[#181511] text-sm font-medium leading-normal">
                  {battle.votes}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Join Battle Button */}
        <div className="flex px-4 py-3 justify-center">
          <Button
            onClick={handleJoinBattle}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#ee8c0b] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d67d0a]"
          >
            <span className="truncate">Join Battle</span>
          </Button>
        </div>

        {/* Event Leaderboard */}
        <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Event Leaderboard
        </h2>
        
        {leaderboard.map((entry) => (
          <div key={entry.id} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
            <div className="flex items-center gap-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                style={{
                  backgroundImage: `url("${entry.avatarUrl}")`
                }}
              />
              <div className="flex flex-col justify-center">
                <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">
                  {entry.name}
                </p>
                <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
                  {entry.points} points
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <p className="text-[#181511] text-base font-normal leading-normal">
                {entry.rank}
              </p>
            </div>
          </div>
        ))}
      </div>


    </div>
  )
} 