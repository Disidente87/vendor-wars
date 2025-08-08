import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { TokenDistributionService } from '@/services/tokenDistribution'
import type { PendingTokenDistribution, TokenDistributionResult } from '@/services/tokenDistribution'

// Query keys for caching
const QUERY_KEYS = {
  pendingDistributions: (userFid: string) => ['token-distributions', 'pending', userFid] as const,
  totalDistributed: (userFid: string) => ['token-distributions', 'total', userFid] as const
}

export function usePendingTokenDistributions(userFid?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.pendingDistributions(userFid || ''),
    queryFn: () => TokenDistributionService.getPendingDistributions(userFid!),
    enabled: !!userFid,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  })
}

export function useTotalDistributedTokens(userFid?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.totalDistributed(userFid || ''),
    queryFn: () => TokenDistributionService.getTotalDistributedTokens(userFid!),
    enabled: !!userFid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

export function useUpdateUserWallet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userFid, walletAddress }: { userFid: string; walletAddress: string }) => {
      return TokenDistributionService.updateUserWallet(userFid, walletAddress)
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.pendingDistributions(variables.userFid) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.totalDistributed(variables.userFid) 
      })
      
      if (result.success && result.tokensDistributed > 0) {
        console.log(`🎉 Successfully distributed ${result.tokensDistributed} BATTLE tokens!`)
      }
    },
    onError: (error) => {
      console.error('Error updating user wallet:', error)
    }
  })
}

export function useAutoDistributeTokens() {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userFid }: { userFid: string }) => {
      if (!address) {
        throw new Error('No wallet connected')
      }
      return TokenDistributionService.updateUserWallet(userFid, address)
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.pendingDistributions(variables.userFid) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.totalDistributed(variables.userFid) 
      })
      
      if (result.success && result.tokensDistributed > 0) {
        console.log(`🎉 Auto-distributed ${result.tokensDistributed} BATTLE tokens!`)
      }
    },
    onError: (error) => {
      console.error('Error auto-distributing tokens:', error)
    }
  })
}

// Hook to automatically distribute tokens when wallet connects
export function useAutoDistributeOnWalletConnect(userFid?: string) {
  const { address, isConnected } = useAccount()
  const { data: pendingDistributions } = usePendingTokenDistributions(userFid)
  const autoDistribute = useAutoDistributeTokens()
  
  // Auto-distribute when wallet connects and there are pending distributions
  React.useEffect(() => {
    if (isConnected && address && userFid && pendingDistributions && pendingDistributions.length > 0) {
      console.log(`🔗 Wallet connected! Auto-distributing ${pendingDistributions.length} pending distributions`)
      autoDistribute.mutate({ userFid })
    }
  }, [isConnected, address, userFid, pendingDistributions, autoDistribute])
  
  return {
    isAutoDistributing: autoDistribute.isPending,
    autoDistributeResult: autoDistribute.data,
    autoDistributeError: autoDistribute.error
  }
}

// Hook to get token distribution summary
export function useTokenDistributionSummary(userFid?: string) {
  const { data: pendingDistributions, isLoading: isLoadingPending } = usePendingTokenDistributions(userFid)
  const { data: totalDistributed, isLoading: isLoadingTotal } = useTotalDistributedTokens(userFid)
  
  const pendingTokens = pendingDistributions?.reduce((total, dist) => total + dist.tokens, 0) || 0
  const totalTokens = totalDistributed || 0
  
  return {
    pendingDistributions: pendingDistributions || [],
    pendingTokens,
    totalDistributed: totalTokens,
    totalTokens: pendingTokens + totalTokens,
    isLoading: isLoadingPending || isLoadingTotal,
    hasPendingDistributions: pendingTokens > 0
  }
}

// Hook to show token distribution notifications
export function useTokenDistributionNotifications(userFid?: string) {
  const { address, isConnected } = useAccount()
  const { pendingTokens, hasPendingDistributions } = useTokenDistributionSummary(userFid)
  const autoDistribute = useAutoDistributeTokens()
  
  const showConnectWalletPrompt = hasPendingDistributions && !isConnected
  const showDistributionSuccess = autoDistribute.isSuccess && autoDistribute.data?.tokensDistributed > 0
  const showDistributionError = autoDistribute.isError
  
  return {
    showConnectWalletPrompt,
    showDistributionSuccess,
    showDistributionError,
    pendingTokens,
    distributionResult: autoDistribute.data,
    distributionError: autoDistribute.error,
    triggerDistribution: () => {
      if (userFid && address) {
        autoDistribute.mutate({ userFid })
      }
    }
  }
}
