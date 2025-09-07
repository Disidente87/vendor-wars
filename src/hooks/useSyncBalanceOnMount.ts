import { useEffect, useRef } from 'react'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { useAccount } from 'wagmi'
import { useBalanceContext } from '@/contexts/BalanceContext'

/**
 * Hook que ejecuta sync balance automáticamente cuando se monta el componente
 * Solo se ejecuta una vez por sesión de ventana para evitar llamadas excesivas
 */
export function useSyncBalanceOnMount() {
  const { user: farcasterUser } = useFarcasterAuth()
  const { address } = useAccount()
  const { refreshAllBalances } = useBalanceContext()
  const hasSynced = useRef(false)

  useEffect(() => {
    // Solo ejecutar si no hemos sincronizado en esta sesión de ventana
    if (hasSynced.current) {
      console.log('⚠️ Sync balance ya ejecutado en esta sesión, saltando...')
      return
    }

    // Solo ejecutar si tenemos los datos necesarios
    if (!farcasterUser?.fid || !address) {
      console.log('⚠️ Faltan datos para sync balance (fid o address)')
      return
    }

    const syncBalance = async () => {
      try {
        console.log(`🔄 Auto-syncing balance para usuario ${farcasterUser.fid} con wallet ${address}`)
        
        // 1. Actualizar balance en la base de datos via API
        const response = await fetch('/api/wallet/sync-balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userFid: farcasterUser.fid.toString(),
            walletAddress: address
          }),
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ Balance sincronizado en BD exitosamente')
          
          // 2. Refrescar balance desde blockchain y actualizar todas las secciones
          await refreshAllBalances()
          
          console.log('✅ Balance actualizado en todas las secciones')
        } else {
          console.warn('⚠️ Error sincronizando balance en BD:', result.error)
          
          // Aún así, intentar refrescar desde blockchain
          await refreshAllBalances()
        }
      } catch (error) {
        console.error('❌ Error en auto-sync balance:', error)
        
        // Aún así, intentar refrescar desde blockchain
        try {
          await refreshAllBalances()
        } catch (refreshError) {
          console.error('❌ Error refrescando balance:', refreshError)
        }
      } finally {
        // Marcar como sincronizado para esta sesión
        hasSynced.current = true
      }
    }

    // Ejecutar con un pequeño delay para asegurar que el componente esté completamente montado
    const timeoutId = setTimeout(syncBalance, 1000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [farcasterUser?.fid, address, refreshAllBalances])

  // Función para forzar sync manual (útil para botones)
  const forceSync = async () => {
    if (!farcasterUser?.fid || !address) {
      console.warn('No Farcaster user or wallet address available')
      return
    }

    try {
      console.log(`🔄 Force-syncing balance para usuario ${farcasterUser.fid} con wallet ${address}`)
      
      const response = await fetch('/api/wallet/sync-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: farcasterUser.fid.toString(),
          walletAddress: address
        }),
      })

      const result = await response.json()

      if (result.success) {
        await refreshAllBalances()
        console.log('✅ Force-sync completado')
      } else {
        console.warn('⚠️ Error en force-sync:', result.error)
        await refreshAllBalances()
      }
    } catch (error) {
      console.error('❌ Error en force-sync:', error)
      await refreshAllBalances()
    }
  }

  return { forceSync }
}
