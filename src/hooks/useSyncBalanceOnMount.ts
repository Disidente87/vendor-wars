import { useEffect, useRef } from 'react'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { useBalanceContext } from '@/contexts/BalanceContext'

/**
 * Hook que ejecuta sync balance automáticamente cuando se monta el componente
 * Solo se ejecuta una vez por sesión de ventana para evitar llamadas excesivas
 */
export function useSyncBalanceOnMount() {
  const { user: farcasterUser } = useFarcasterAuth()
  const { refreshAllBalances } = useBalanceContext()
  const hasSynced = useRef(false)

  useEffect(() => {
    // Solo ejecutar si no hemos sincronizado en esta sesión de ventana
    if (hasSynced.current) {
      console.log('⚠️ Sync balance ya ejecutado en esta sesión, saltando...')
      return
    }

    // Solo ejecutar si tenemos los datos necesarios
    if (!farcasterUser?.fid) {
      console.log('⚠️ Faltan datos para sync balance (fid)')
      return
    }

    const syncBalance = async () => {
      try {
        console.log(`🔄 Auto-syncing balance para usuario ${farcasterUser.fid}`)
        
        // 1. First, get user's wallet address from database
        const userResponse = await fetch(`/api/auth/farcaster?fid=${farcasterUser.fid}`)
        const userResult = await userResponse.json()
        
        if (!userResult.success) {
          console.warn('⚠️ No se pudo obtener datos del usuario para sync balance')
          return
        }
        
        // Get wallet address from user data (it might be in wallet_address field)
        const userData = userResult.data
        let walletAddress = ''
        
        // Check if user has wallet address in database
        if (userData.walletAddress) {
          walletAddress = userData.walletAddress
        } else if (userData.verifiedAddresses && userData.verifiedAddresses.length > 0) {
          walletAddress = userData.verifiedAddresses[0]
        }
        
        if (!walletAddress) {
          console.log('⚠️ Usuario no tiene wallet conectada, saltando sync balance')
          return
        }
        
        console.log(`🔗 Usando wallet address: ${walletAddress}`)
        
        // 2. Actualizar balance en la base de datos via API
        const response = await fetch('/api/wallet/sync-balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          userFid: farcasterUser.fid.toString(),
          walletAddress: walletAddress
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
  }, [farcasterUser?.fid, refreshAllBalances])

  // Función para forzar sync manual (útil para botones)
  const forceSync = async () => {
    if (!farcasterUser?.fid) {
      console.warn('No Farcaster user available')
      return
    }

    try {
      console.log(`🔄 Force-syncing balance para usuario ${farcasterUser.fid}`)
      
      // First, get user's wallet address from database
      const userResponse = await fetch(`/api/auth/farcaster?fid=${farcasterUser.fid}`)
      const userResult = await userResponse.json()
      
      if (!userResult.success) {
        console.warn('⚠️ No se pudo obtener datos del usuario para force sync')
        return
      }
      
      // Get wallet address from user data
      const userData = userResult.data
      let walletAddress = ''
      
      if (userData.walletAddress) {
        walletAddress = userData.walletAddress
      } else if (userData.verifiedAddresses && userData.verifiedAddresses.length > 0) {
        walletAddress = userData.verifiedAddresses[0]
      }
      
      if (!walletAddress) {
        console.log('⚠️ Usuario no tiene wallet conectada, saltando force sync')
        return
      }
      
      console.log(`🔗 Usando wallet address para force sync: ${walletAddress}`)
      
      const response = await fetch('/api/wallet/sync-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: farcasterUser.fid.toString(),
          walletAddress: walletAddress
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
