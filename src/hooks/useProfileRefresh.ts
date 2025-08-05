import { useCallback, useEffect, useRef } from 'react'

interface UseProfileRefreshOptions {
  onRefresh: () => void
  enabled?: boolean
}

export function useProfileRefresh({ onRefresh, enabled = true }: UseProfileRefreshOptions) {
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRefreshTime = useRef<number>(0)

  const triggerRefresh = useCallback((force = false) => {
    const now = Date.now()
    
    // Prevent multiple refreshes within 2 seconds unless forced
    if (!force && now - lastRefreshTime.current < 2000) {
      return
    }

    lastRefreshTime.current = now
    onRefresh()
  }, [onRefresh])

  // Listen for custom events that indicate a vote was cast
  useEffect(() => {
    if (!enabled) return

    const handleVoteCast = () => {
      console.log('🎯 Vote cast detected, refreshing profile...')
      triggerRefresh(true)
    }

    const handleVoteSuccess = () => {
      console.log('✅ Vote success detected, refreshing profile...')
      triggerRefresh(true)
    }

    // Listen for custom events
    window.addEventListener('vote-cast', handleVoteCast)
    window.addEventListener('vote-success', handleVoteSuccess)

    return () => {
      window.removeEventListener('vote-cast', handleVoteCast)
      window.removeEventListener('vote-success', handleVoteSuccess)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [enabled, triggerRefresh])

  // Refresh when tab becomes visible
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, refreshing profile...')
        triggerRefresh(true)
      }
    }

    const handleFocus = () => {
      console.log('🎯 Window gained focus, refreshing profile...')
      triggerRefresh(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled, triggerRefresh])

  return { triggerRefresh }
}

// Helper functions to dispatch events
export const dispatchVoteCast = () => {
  window.dispatchEvent(new CustomEvent('vote-cast'))
}

export const dispatchVoteSuccess = () => {
  window.dispatchEvent(new CustomEvent('vote-success'))
} 