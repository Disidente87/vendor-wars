'use client'

import { useEffect, useRef } from 'react'

interface VendorStatsRefreshProps {
  vendorId: string
  onStatsUpdate: (stats: any) => void
  enabled?: boolean
}

export function VendorStatsRefresh({ vendorId, onStatsUpdate, enabled = true }: VendorStatsRefreshProps) {
  const lastUpdateTime = useRef<number>(0)

  const fetchVendorStats = async (force = false) => {
    const now = Date.now()
    
    // Prevent multiple updates within 3 seconds unless forced
    if (!force && now - lastUpdateTime.current < 3000) {
      return
    }

    lastUpdateTime.current = now

    try {
      const response = await fetch(`/api/votes?vendorId=${vendorId}`)
      const result = await response.json()
      
      if (result.success) {
        console.log('📊 Vendor stats updated:', result.data)
        onStatsUpdate(result.data)
      } else {
        console.error('Failed to fetch vendor stats:', result.error)
      }
    } catch (error) {
      console.error('Error fetching vendor stats:', error)
    }
  }

  useEffect(() => {
    if (!enabled || !vendorId) return

    const handleVoteSuccess = (event: CustomEvent) => {
      if (event.detail?.vendorId === vendorId) {
        console.log('🎯 Vote success detected for this vendor, updating stats...')
        fetchVendorStats(true)
      }
    }

    // Listen for vote success events
    window.addEventListener('vote-success', handleVoteSuccess as EventListener)

    // Initial fetch
    fetchVendorStats(true)

    return () => {
      window.removeEventListener('vote-success', handleVoteSuccess as EventListener)
    }
  }, [vendorId, enabled, onStatsUpdate])

  // Refresh when tab becomes visible
  useEffect(() => {
    if (!enabled || !vendorId) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, updating vendor stats...')
        fetchVendorStats(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [vendorId, enabled])

  return null // This component doesn't render anything
} 