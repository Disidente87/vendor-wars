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
    if (isRefreshing) return // Evitar múltiples refreshes simultáneos
    
    setIsRefreshing(true)
    try {
      // Refrescar balance de BATTLE tokens si está disponible
      if (refetchBattleBalance) {
        await refetchBattleBalance()
      }
      
      // Disparar evento personalizado para que otros componentes se actualicen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('balanceUpdated'))
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
