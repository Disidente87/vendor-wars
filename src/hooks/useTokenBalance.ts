import { useState, useEffect, useCallback } from 'react'
import { useFarcasterAuth } from './useFarcasterAuth'
import { useAccount } from 'wagmi'
import { useBalance } from 'wagmi'

export function useTokenBalance() {
  const { user: authenticatedUser } = useFarcasterAuth()
  const { address } = useAccount()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hook para obtener el balance de BATTLE tokens directamente de la blockchain
  const { data: battleBalance, refetch: refetchBattleBalance } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS as `0x${string}`,
  })

  const fetchBalance = useCallback(async () => {
    if (!authenticatedUser) {
      setBalance(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/tokens/balance?userFid=${authenticatedUser.fid}`)
      const result = await response.json()
      
      if (result.success) {
        setBalance(result.data.balance)
      } else {
        setError(result.error || 'Failed to fetch balance')
        // Fallback to user's battle tokens if available
        if (authenticatedUser.battleTokens) {
          setBalance(authenticatedUser.battleTokens)
        }
      }
    } catch (error) {
      console.error('Error fetching token balance:', error)
      setError('Failed to fetch balance')
      // Fallback to user's battle tokens if available
      if (authenticatedUser.battleTokens) {
        setBalance(authenticatedUser.battleTokens)
      }
    } finally {
      setLoading(false)
    }
  }, [authenticatedUser])

  const refreshBalance = useCallback(() => {
    // Refrescar tanto el balance de la API como el de la blockchain
    fetchBalance()
    refetchBattleBalance()
  }, [fetchBalance, refetchBattleBalance])

  // Escuchar eventos de actualización de balance
  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log('🔄 Balance update event received, refreshing...')
      refreshBalance()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Usuario regresó a la ventana, actualizando balance...')
        // Actualizar balance cuando el usuario regresa a la ventana
        setTimeout(() => {
          refreshBalance()
        }, 500) // Pequeño delay para asegurar que la ventana esté completamente activa
      }
    }

    const handleFocus = () => {
      console.log('🔄 Ventana enfocada, actualizando balance...')
      setTimeout(() => {
        refreshBalance()
      }, 500)
    }

    // Escuchar cambios en localStorage para comunicación entre ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'balanceUpdateEvent' && e.newValue) {
        try {
          const balanceUpdateEvent = JSON.parse(e.newValue)
          console.log('🔄 Balance update recibido desde otra ventana:', balanceUpdateEvent)
          refreshBalance()
        } catch (error) {
          console.error('Error parsing balance update event:', error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      console.log('🔄 Registrando listeners...')
      window.addEventListener('balanceUpdated', handleBalanceUpdate)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('focus', handleFocus)
      window.addEventListener('storage', handleStorageChange)
      
      return () => {
        console.log('🔄 Removiendo listeners...')
        window.removeEventListener('balanceUpdated', handleBalanceUpdate)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [refreshBalance])

  // Actualizar balance cuando cambie el balance de la blockchain
  useEffect(() => {
    if (battleBalance) {
      setBalance(Number(battleBalance.formatted))
    }
  }, [battleBalance])

  useEffect(() => {
    fetchBalance()
  }, [authenticatedUser?.fid, fetchBalance])

  // Verificar si hay actualizaciones pendientes al cargar la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkForPendingUpdates = () => {
        try {
          const balanceUpdateEvent = localStorage.getItem('balanceUpdateEvent')
          if (balanceUpdateEvent) {
            const event = JSON.parse(balanceUpdateEvent)
            // Si el evento es reciente (menos de 30 segundos), actualizar balance
            if (Date.now() - event.timestamp < 30000) {
              console.log('🔄 Actualización pendiente encontrada, refrescando balance...')
              refreshBalance()
            }
          }
        } catch (error) {
          console.error('Error checking for pending updates:', error)
        }
      }

      // Verificar inmediatamente
      checkForPendingUpdates()
      
      // Verificar cada 5 segundos
      const interval = setInterval(checkForPendingUpdates, 5000)
      
      return () => clearInterval(interval)
    }
  }, [refreshBalance])

  return {
    balance,
    loading,
    error,
    refreshBalance,
    battleBalance: battleBalance ? Number(battleBalance.formatted) : null
  }
} 