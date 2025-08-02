'use client'

import { Frame } from '@coinbase/onchainkit'
import { Button } from '@/components/ui/button'
import { Sword, Trophy, Users } from 'lucide-react'

interface FarcasterFrameProps {
  title: string
  description: string
  imageUrl?: string
  buttons?: Array<{
    label: string
    action: 'post' | 'post_redirect' | 'mint' | 'link'
    target?: string
  }>
  postUrl?: string
}

export function FarcasterFrame({ 
  title, 
  description, 
  imageUrl = '/og-image.png',
  buttons = [],
  postUrl 
}: FarcasterFrameProps) {
  return (
    <Frame
      image={imageUrl}
      buttons={buttons}
      postUrl={postUrl}
    >
      <div className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
            <Sword className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>Join the battle</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Trophy className="h-4 w-4" />
            <span>Earn tokens</span>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// Frame específico para votar por un vendor
export function VendorVoteFrame({ vendorName, zoneName }: { vendorName: string; zoneName: string }) {
  return (
    <FarcasterFrame
      title={`Vote for ${vendorName}`}
      description={`Support ${vendorName} in ${zoneName} and earn $BATTLE tokens!`}
      imageUrl="/og-image.png"
      buttons={[
        {
          label: 'Vote Now',
          action: 'post',
          target: `https://vendorwars.app/vote/${vendorName}`
        },
        {
          label: 'View Leaderboard',
          action: 'post_redirect',
          target: 'https://vendorwars.app/leaderboard'
        }
      ]}
      postUrl="https://vendorwars.app/api/frame/vote"
    />
  )
}

// Frame para mostrar resultados de batalla
export function BattleResultFrame({ 
  winner, 
  loser, 
  zoneName 
}: { 
  winner: string; 
  loser: string; 
  zoneName: string 
}) {
  return (
    <FarcasterFrame
      title={`${winner} wins in ${zoneName}!`}
      description={`${winner} defeated ${loser} to claim territory in ${zoneName}`}
      imageUrl="/og-image.png"
      buttons={[
        {
          label: 'View Results',
          action: 'post_redirect',
          target: 'https://vendorwars.app/battles'
        },
        {
          label: 'Join Battle',
          action: 'post',
          target: 'https://vendorwars.app'
        }
      ]}
      postUrl="https://vendorwars.app/api/frame/battle-result"
    />
  )
} 