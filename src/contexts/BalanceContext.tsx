'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useBalance } from 'wagmi'

interface BalanceContextType {
  refreshAllBalances: () => void
  isRefreshing: boolean
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Safely get address and balance hooks
  let address: string | undefined
  let refetchBattleBalance: (() => Promise<any>) | undefined
  
  try {
    const account = useAccount()
    address = account.address
  } catch (error) {
    // Wagmi not available during SSR
    address = undefined
  }
  
  try {
    const balance = useBalance({
      address: address as `0x${string}`,
      token: process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS as `0x${string}`,
    })
    refetchBattleBalance = balance.refetch
  } catch (error) {
    // Wagmi not available during SSR
    refetchBattleBalance = undefined
  }

  const refreshAllBalances = useCallback(async () => {
    if (isRefreshing) {
      console.log('⚠️ Balance refresh ya en progreso, saltando...')
      return // Evitar múltiples refreshes simultáneos
    }
    
    setIsRefreshing(true)
    try {
      console.log('🔄 Iniciando refresh de balance...')
      
      // Refrescar balance de BATTLE tokens si está disponible
      if (refetchBattleBalance) {
        await refetchBattleBalance()
      }
      
      // Disparar evento personalizado para que otros componentes se actualicen
      if (typeof window !== 'undefined') {
        console.log('🔄 Disparando evento balanceUpdated...')
        window.dispatchEvent(new CustomEvent('balanceUpdated'))
        console.log('✅ Evento balanceUpdated disparado')
        
        // También usar localStorage para comunicar entre ventanas/pestañas
        const balanceUpdateEvent = {
          timestamp: Date.now(),
          type: 'balanceUpdated',
          address: address,
          id: Math.random().toString(36).substr(2, 9) // ID único para forzar el cambio
        }
        localStorage.setItem('balanceUpdateEvent', JSON.stringify(balanceUpdateEvent))
        console.log('🔄 Balance update guardado en localStorage para otras ventanas:', balanceUpdateEvent)
        
        // Forzar un cambio en localStorage para disparar el evento storage
        setTimeout(() => {
          localStorage.setItem('balanceUpdateTrigger', Date.now().toString())
        }, 100)
        
        // Usar BroadcastChannel para comunicación entre ventanas (más confiable)
        try {
          const channel = new BroadcastChannel('balance-updates')
          channel.postMessage({
            type: 'balanceUpdated',
            timestamp: Date.now(),
            address: address
          })
          channel.close()
          console.log('🔄 Balance update enviado via BroadcastChannel')
        } catch (error) {
          console.log('⚠️ BroadcastChannel no disponible, usando localStorage')
        }
      }
      
      console.log('🔄 Balance actualizado en todas las secciones')
    } catch (error) {
      console.error('Error refreshing balances:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchBattleBalance, isRefreshing])

  return (
    <BalanceContext.Provider value={{ refreshAllBalances, isRefreshing }}>
      {children}
    </BalanceContext.Provider>
  )
}

export function useBalanceContext() {
  const context = useContext(BalanceContext)
  if (context === undefined) {
    throw new Error('useBalanceContext must be used within a BalanceProvider')
  }
  return context
}
