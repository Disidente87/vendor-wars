'use client'

import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { useMiniApp } from '@neynar/react'

export function AuthDebugger() {
  const { isAuthenticated, user, isLoading, error } = useFarcasterAuth()
  const { isSDKLoaded, context } = useMiniApp()

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      
      <div className="space-y-1">
        <div>SDK Loaded: <span className={isSDKLoaded ? 'text-green-400' : 'text-red-400'}>{isSDKLoaded ? '✅' : '❌'}</span></div>
        <div>Has Context: <span className={!!context ? 'text-green-400' : 'text-red-400'}>{!!context ? '✅' : '❌'}</span></div>
        <div>Context User: <span className={!!context?.user ? 'text-green-400' : 'text-red-400'}>{!!context?.user ? '✅' : '❌'}</span></div>
        <div>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>{isLoading ? '⏳' : '✅'}</span></div>
        <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? '✅' : '❌'}</span></div>
        <div>Has User: <span className={!!user ? 'text-green-400' : 'text-red-400'}>{!!user ? '✅' : '❌'}</span></div>
      </div>

      {context?.user && (
        <div className="mt-2 p-2 bg-gray-800 rounded">
          <div className="font-semibold">Context User:</div>
          <div>FID: {context.user.fid}</div>
          <div>Username: {context.user.username}</div>
          <div>Display: {context.user.displayName}</div>
        </div>
      )}

      {user && (
        <div className="mt-2 p-2 bg-gray-800 rounded">
          <div className="font-semibold">Auth User:</div>
          <div>FID: {user.fid}</div>
          <div>Username: {user.username}</div>
          <div>Display: {user.displayName}</div>
          <div>Tokens: {user.battleTokens}</div>
          <div>Streak: {user.voteStreak}</div>
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-800 rounded">
          <div className="font-semibold">Error:</div>
          <div>{error}</div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400">
        Check console for detailed logs
      </div>
    </div>
  )
} 