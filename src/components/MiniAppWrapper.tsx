'use client'

import { MiniAppProvider } from '@neynar/react'
import dynamic from 'next/dynamic'

// Dynamically import WagmiProvider to avoid SSR issues
const WagmiProvider = dynamic(
  () => import('@/components/providers/WagmiProvider'),
  { ssr: false }
)

export function MiniAppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <MiniAppProvider analyticsEnabled={true}>
        {children}
      </MiniAppProvider>
    </WagmiProvider>
  )
} 