'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Map, 
  List, 
  User, 
  Users,
  Coins
} from 'lucide-react'

interface TopVendor {
  id: string
  name: string
  imageUrl: string
  votes: number
}

export default function ProfilePage() {
  const router = useRouter()

  // Mock user data
  const user = {
    name: 'Lucas',
    username: '@lucas',
    platform: 'Farcaster',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0J7QBzLje-H8-iJa0BpRwYu4QfAckoXYgCuO1VsglwjmCTWqOQxY8xUSxtElh3EXfd5ye3r6DXpCJu1rsf46uFYiTvoM2ZOiEOj9x654z3RQVVOdV1lqa8nV7b2OGTk1dc12ajXnrLKmwCxYgDZy1LxS859rMs8h1nBmXCFpdFeZ303h0sCewok3bZ7iAmVEHunH9pN5o0yV2bjg7di8Lp8msziYW-VEwNxsNUddHAgWRsBsEjaSBbsW-wIkEomrOkhloj-qSxQ9E',
    stats: {
      currentStreak: 3,
      level: 12,
      totalVotes: 123,
      verifiedVotes: 100
    },
    battleTokens: {
      balance: 100,
      dailyReward: 50,
      lastVote: {
        vendor: 'Tacos El Compa',
        amount: -20
      }
    },
    topVendors: [
      {
        id: '1',
        name: 'Tacos El Compa',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmCqp8D2OgwKJmT4B4DCywgR3uqp--jXdNqHAaqt5c7zmXSMlJZIPY05ieaCaM7xEQ0Q9yNauTa5jvguTClDYLuFCiYZ0yFwx3IT5PgB1g8vOtynOk6t25Ylvbs622s76m1ad2aEQ_TC2ZAgF9x7L6dg543CdsF3FBH82EdvHVZcc-t_b37qxyQC0-M-GU3gzbm6FINijwnoqQIMa2MIbimDicfl4i4xdDqhkKwIXEF735yBscMPBIWi0XIX66TnVJ-Oq5zbGNOTt5',
        votes: 12
      },
      {
        id: '2',
        name: 'Helados La Michoacana',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNCQZWPMNpiiz9TT49Idw_6Bh9gYzFbZRi5TXLLbZc-TtUUDAud_O7X46RBFf1lBSE0zkMZpg1c7Iw5_x9oZofB1mUKdDtOnVm3X3oJewzQCk6Hi3ub8ahF1AMDc_CkdZS6ZpB0NsF6IK_SemwicdRo_PmRDlq84fSWR23Wm2ikVCL34jXoe-g3-9O9mRfmWusgb_78gT0WRm3_m1TOqZdHVBpVuAG5phPN3x4Rs297sfYfAlJoLIqRmfD4cciEpOu2Mt8yTY94Iup',
        votes: 10
      },
      {
        id: '3',
        name: 'Café con Leche',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0DWEm6O_aENKSDFyrba23XjH0cnaL-58Nx8vYlEz3LMjmehbpG8YsZJwQv7r4kX7mKr2iFHBCxdIx4g5qOWWzdmICFogSxzLJWtASCfGuoqacA6XINWYVbF3Fhl6xn7-_iBUbhxSUlOCojYsPXJBNyQqui0FgxQ9Uv9DwJPyytOr0F2keN5SeMBedmBW9Kr1V3jJQr8z4Y3eEylfjNO85sjQfP02ywP-gwqEfk3XMOkq2oMNUWmVYloxI2-NzHuafwQH6_SW2XbVb',
        votes: 8
      }
    ]
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
            Profile
          </h2>
        </div>

        {/* Profile Info */}
        <div className="flex p-4 @container">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                style={{
                  backgroundImage: `url("${user.avatarUrl}")`
                }}
              />
              <div className="flex flex-col items-center justify-center justify-center">
                <p className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                  {user.name}
                </p>
                <p className="text-[#8a7860] text-base font-normal leading-normal text-center">
                  {user.username}
                </p>
                <p className="text-[#8a7860] text-base font-normal leading-normal text-center">
                  {user.platform}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-3 px-4 py-3">
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#e6e1db] p-3 items-center text-center">
            <p className="text-[#181511] tracking-light text-2xl font-bold leading-tight">
              {user.stats.currentStreak}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[#8a7860] text-sm font-normal leading-normal">Current Streak</p>
            </div>
          </div>
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#e6e1db] p-3 items-center text-center">
            <p className="text-[#181511] tracking-light text-2xl font-bold leading-tight">
              {user.stats.level}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[#8a7860] text-sm font-normal leading-normal">Level</p>
            </div>
          </div>
        </div>

        {/* Vote Stats */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#e6e1db]">
            <p className="text-[#181511] text-base font-medium leading-normal">Total Votes</p>
            <p className="text-[#181511] tracking-light text-2xl font-bold leading-tight">
              {user.stats.totalVotes}
            </p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#e6e1db]">
            <p className="text-[#181511] text-base font-medium leading-normal">Verified Votes</p>
            <p className="text-[#181511] tracking-light text-2xl font-bold leading-tight">
              {user.stats.verifiedVotes}
            </p>
          </div>
        </div>

        {/* Top Vendors */}
        <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Top Vendors
        </h2>
        <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-3">
            {user.topVendors.map((vendor) => (
              <div key={vendor.id} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
                <div
                  className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex flex-col"
                  style={{
                    backgroundImage: `url("${vendor.imageUrl}")`
                  }}
                />
                <div>
                  <p className="text-[#181511] text-base font-medium leading-normal">
                    {vendor.name}
                  </p>
                  <p className="text-[#8a7860] text-sm font-normal leading-normal">
                    {vendor.votes} votes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Battle Tokens */}
        <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Battle Tokens
        </h2>
        <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
          <div className="text-[#181511] flex items-center justify-center rounded-lg bg-[#f5f3f0] shrink-0 size-12">
            <Coins className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">Balance</p>
            <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
              {user.battleTokens.balance}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
          <div className="text-[#181511] flex items-center justify-center rounded-lg bg-[#f5f3f0] shrink-0 size-12">
            <Coins className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">Daily Reward</p>
            <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
              +{user.battleTokens.dailyReward}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
          <div className="text-[#181511] flex items-center justify-center rounded-lg bg-[#f5f3f0] shrink-0 size-12">
            <Coins className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">
              Vote for {user.battleTokens.lastVote.vendor}
            </p>
            <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
              {user.battleTokens.lastVote.amount}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div>
        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
            <Button
              onClick={() => {
                // TODO: Implement profile customization
                console.log('Customize profile')
              }}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#ee8c0b] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] grow hover:bg-[#d67d0a]"
            >
              <span className="truncate">Customize Profile</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement profile sharing
                console.log('Share profile')
              }}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f5f3f0] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] grow hover:bg-[#ebe8e4] border-[#f5f3f0]"
            >
              <span className="truncate">Share Profile</span>
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
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
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7960] hover:text-[#181511] transition-colors"
          >
            <List className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Vendors</p>
          </button>
          
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-[#181511]">
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
    </div>
  )
} 