'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Sword } from 'lucide-react'

export default function BattlesPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
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
            onClick={handleBack}
            className="text-[#181511] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Vendor Wars
          </h2>
        </div>

        {/* Coming Soon Banner */}
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
                  Battle System Coming Soon!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
            <Sword className="h-10 w-10 text-orange-600" />
          </div>
          
          <h1 className="text-[#181511] text-2xl font-bold leading-tight tracking-[-0.015em] mb-4">
            Territory Battles
          </h1>
          
          <p className="text-[#8a7860] text-base leading-relaxed mb-8 max-w-md">
            The epic battle system is currently under development. Soon you&apos;ll be able to participate in territory wars, 
            challenge other vendors, and fight for neighborhood dominance!
          </p>

          <div className="flex items-center gap-2 text-[#8a7860] text-sm mb-8">
            <Clock className="h-4 w-4" />
            <span>Expected Launch: Q1 2025</span>
          </div>

          <div className="bg-[#f5f3f0] rounded-xl p-6 mb-8 max-w-md">
            <h3 className="text-[#181511] text-lg font-semibold mb-3">
              What&apos;s Coming:
            </h3>
            <ul className="text-[#8a7860] text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                Territory-based vendor battles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                Real-time battle leaderboards
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                Battle rewards and achievements
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                Community voting events
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/vendors')}
              className="flex items-center gap-2 px-6 py-3 bg-[#ee8c0b] text-[#181511] font-bold hover:bg-[#d67d0a]"
            >
              Browse Vendors
            </Button>
            
            <Button
              onClick={() => router.push('/leaderboard')}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 border-[#ee8c0b] text-[#ee8c0b] hover:bg-[#ee8c0b] hover:text-white"
            >
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 