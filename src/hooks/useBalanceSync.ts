import { useEffect, useCallback } from 'react'
import { useBalanceContext } from '@/contexts/BalanceContext'

/**
 * Hook para sincronizar el balance entre ventanas/pestañas
 * Escucha múltiples eventos para asegurar que el balance se actualice
 */
export function useBalanceSync() {
  const { refreshAllBalances } = useBalanceContext()

  const handleBalanceUpdate = useCallback(() => {
    console.log('🔄 Balance update event recibido en useBalanceSync')
    refreshAllBalances()
  }, [refreshAllBalances])

  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('🔄 useBalanceSync: Registrando listeners...')

    // 1. Evento personalizado (misma ventana)
    window.addEventListener('balanceUpdated', handleBalanceUpdate)

    // 2. Evento storage (otras ventanas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'balanceUpdateEvent' || e.key === 'balanceUpdateTrigger') {
        console.log('🔄 Balance update recibido via storage:', e.key)
        refreshAllBalances()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // 3. BroadcastChannel (otras ventanas)
    let broadcastChannel: BroadcastChannel | null = null
    try {
      broadcastChannel = new BroadcastChannel('balance-updates')
      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'balanceUpdated') {
          console.log('🔄 Balance update recibido via BroadcastChannel:', event.data)
          refreshAllBalances()
        }
      }
    } catch (error) {
      console.log('⚠️ BroadcastChannel no disponible en useBalanceSync')
    }

    // 4. Polling como fallback
    let lastUpdateTime = 0
    const checkForUpdates = () => {
      try {
        const balanceUpdateEvent = localStorage.getItem('balanceUpdateEvent')
        if (balanceUpdateEvent) {
          const event = JSON.parse(balanceUpdateEvent)
          if (Date.now() - event.timestamp < 30000 && event.timestamp > lastUpdateTime) {
            console.log('🔄 Balance update encontrado via polling:', event)
            lastUpdateTime = event.timestamp
            refreshAllBalances()
          }
        }
      } catch (error) {
        console.error('Error en polling de balance:', error)
      }
    }

    // Verificar inmediatamente
    checkForUpdates()
    
    // Polling cada 3 segundos
    const interval = setInterval(checkForUpdates, 3000)

    // 5. Cuando la ventana se enfoca
    const handleFocus = () => {
      console.log('🔄 Ventana enfocada, verificando balance...')
      setTimeout(() => {
        refreshAllBalances()
      }, 500)
    }
    window.addEventListener('focus', handleFocus)

    // 6. Cuando la visibilidad cambia
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Ventana visible, verificando balance...')
        setTimeout(() => {
          refreshAllBalances()
        }, 500)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      console.log('🔄 useBalanceSync: Removiendo listeners...')
      window.removeEventListener('balanceUpdated', handleBalanceUpdate)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
      if (broadcastChannel) {
        broadcastChannel.close()
      }
    }
  }, [handleBalanceUpdate, refreshAllBalances])
}
