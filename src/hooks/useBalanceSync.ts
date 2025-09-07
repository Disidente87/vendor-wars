import { useEffect, useCallback, useRef } from 'react'
import { useBalanceContext } from '@/contexts/BalanceContext'

/**
 * Hook para sincronizar el balance entre ventanas/pestañas
 * Escucha múltiples eventos para asegurar que el balance se actualice
 * Incluye debouncing para evitar llamadas excesivas
 */
export function useBalanceSync() {
  const { refreshAllBalances } = useBalanceContext()
  const lastUpdateTime = useRef<number>(0)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleBalanceUpdate = useCallback(() => {
    const now = Date.now()
    
    // Debounce: solo actualizar si han pasado al menos 2 segundos desde la última actualización
    if (now - lastUpdateTime.current < 2000) {
      console.log('⚠️ Balance update ignorado por debounce (muy reciente)')
      return
    }

    // Limpiar timeout anterior si existe
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    // Debounce adicional: esperar 500ms antes de ejecutar
    debounceTimeout.current = setTimeout(() => {
      console.log('🔄 Balance update event recibido en useBalanceSync (después de debounce)')
      lastUpdateTime.current = Date.now()
      refreshAllBalances()
    }, 500)
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

    // 4. Polling como fallback (menos agresivo)
    let lastPollingTime = 0
    const checkForUpdates = () => {
      try {
        const balanceUpdateEvent = localStorage.getItem('balanceUpdateEvent')
        if (balanceUpdateEvent) {
          const event = JSON.parse(balanceUpdateEvent)
          const now = Date.now()
          
          // Solo procesar si es reciente (30 segundos) y no lo hemos procesado
          if (now - event.timestamp < 30000 && event.timestamp > lastPollingTime) {
            console.log('🔄 Balance update encontrado via polling:', event)
            lastPollingTime = event.timestamp
            
            // Usar el mismo debounce que el resto
            handleBalanceUpdate()
          }
        }
      } catch (error) {
        console.error('Error en polling de balance:', error)
      }
    }

    // Verificar inmediatamente
    checkForUpdates()
    
    // Polling cada 10 segundos (menos frecuente)
    const interval = setInterval(checkForUpdates, 10000)

    // 5. Cuando la ventana se enfoca (con debounce)
    const handleFocus = () => {
      console.log('🔄 Ventana enfocada, verificando balance...')
      handleBalanceUpdate() // Usar el debounce
    }
    window.addEventListener('focus', handleFocus)

    // 6. Cuando la visibilidad cambia (con debounce)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Ventana visible, verificando balance...')
        handleBalanceUpdate() // Usar el debounce
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
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
      if (broadcastChannel) {
        broadcastChannel.close()
      }
    }
  }, [handleBalanceUpdate, refreshAllBalances])
}
