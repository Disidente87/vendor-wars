'use client'

import { MiniAppProvider } from '@neynar/react'

export function MiniAppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider analyticsEnabled={true}>
      {children}
    </MiniAppProvider>
  )
} 