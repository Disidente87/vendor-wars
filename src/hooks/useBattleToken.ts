import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getBattleTokenService, CONTRACT_CONFIG, BATTLE_TOKEN_ABI } from '@/services/battleToken'
import type { 
  TokenBalance, 
  TokenDistributionStats,
  DistributionRequest 
} from '@/types/contracts'

// Query keys for caching
const QUERY_KEYS = {
  tokenInfo: ['battle-token', 'info'] as const,
  balance: (address: string) => ['battle-token', 'balance', address] as const,
  distributionStats: ['battle-token', 'distribution-stats'] as const,
  allowance: (owner: string, spender: string) => ['battle-token', 'allowance', owner, spender] as const,
  owner: ['battle-token', 'owner'] as const
}

export function useBattleTokenInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.tokenInfo,
    queryFn: async () => {
      const service = getBattleTokenService()
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        service.getName(),
        service.getSymbol(),
        service.getDecimals(),
        service.getTotalSupply()
      ])
      
      return {
        name,
        symbol,
        decimals,
        totalSupply,
        formattedTotalSupply: service.formatBalance(totalSupply)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

export function useBattleTokenBalance(address?: string) {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress

  return useQuery({
    queryKey: QUERY_KEYS.balance(targetAddress || ''),
    queryFn: () => getBattleTokenService().getTokenBalance(targetAddress!),
    enabled: !!targetAddress,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  })
}

export function useBattleTokenDistributionStats() {
  return useQuery({
    queryKey: QUERY_KEYS.distributionStats,
    queryFn: () => getBattleTokenService().getDistributionStats(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  })
}

export function useBattleTokenAllowance(owner?: string, spender?: string) {
  const { address: connectedAddress } = useAccount()
  const ownerAddress = owner || connectedAddress

  return useQuery({
    queryKey: QUERY_KEYS.allowance(ownerAddress || '', spender || ''),
    queryFn: () => getBattleTokenService().getAllowance(ownerAddress!, spender!),
    enabled: !!ownerAddress && !!spender,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  })
}

export function useBattleTokenOwner() {
  return useQuery({
    queryKey: QUERY_KEYS.owner,
    queryFn: () => getBattleTokenService().getOwner(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

// Wagmi hooks for contract interactions
export function useBattleTokenContract() {
  const { address } = useAccount()

  // Read contract data using wagmi
  const { data: name } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'name'
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'symbol'
  })

  const { data: decimals } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'decimals'
  })

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'totalSupply'
  })

  const { data: balance } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  })

  const { data: owner } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'owner'
  })

  return {
    name,
    symbol,
    decimals,
    totalSupply,
    balance,
    owner,
    address: CONTRACT_CONFIG.address,
    chainId: CONTRACT_CONFIG.chainId
  }
}

// Write contract hooks
export function useBattleTokenTransfer() {
  const queryClient = useQueryClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  })

  const transfer = async (to: string, amount: string) => {
    const service = getBattleTokenService()
    if (!service.validateAddress(to)) {
      throw new Error('Invalid recipient address')
    }

    if (!service.validateAmount(amount)) {
      throw new Error('Invalid amount')
    }

    const parsedAmount = service.parseAmount(amount)

    writeContract({
      address: CONTRACT_CONFIG.address as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, parsedAmount]
    })
  }

  // Invalidate balance queries when transfer is successful
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['battle-token', 'balance'] })
  }

  return {
    transfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  }
}

export function useBattleTokenApprove() {
  const queryClient = useQueryClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  })

  const approve = async (spender: string, amount: string) => {
    const service = getBattleTokenService()
    if (!service.validateAddress(spender)) {
      throw new Error('Invalid spender address')
    }

    if (!service.validateAmount(amount)) {
      throw new Error('Invalid amount')
    }

    const parsedAmount = service.parseAmount(amount)

    writeContract({
      address: CONTRACT_CONFIG.address as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, parsedAmount]
    })
  }

  // Invalidate allowance queries when approve is successful
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['battle-token', 'allowance'] })
  }

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  }
}

export function useBattleTokenMint() {
  const queryClient = useQueryClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  })

  const mint = async (to: string, amount: string) => {
    const service = getBattleTokenService()
    if (!service.validateAddress(to)) {
      throw new Error('Invalid recipient address')
    }

    if (!service.validateAmount(amount)) {
      throw new Error('Invalid amount')
    }

    const parsedAmount = service.parseAmount(amount)

    writeContract({
      address: CONTRACT_CONFIG.address as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'mint',
      args: [to as `0x${string}`, parsedAmount]
    })
  }

  // Invalidate queries when mint is successful
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['battle-token'] })
  }

  return {
    mint,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  }
}

export function useBattleTokenDistribution() {
  const queryClient = useQueryClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  })

  const distributeTokens = async (request: DistributionRequest) => {
    if (!request.recipients.length || !request.amounts.length) {
      throw new Error('Recipients and amounts arrays cannot be empty')
    }

    if (request.recipients.length !== request.amounts.length) {
      throw new Error('Recipients and amounts arrays must have the same length')
    }

    if (request.recipients.length > 100) {
      throw new Error('Cannot distribute to more than 100 recipients at once')
    }

    // Validate all addresses and amounts
    const service = getBattleTokenService()
    for (let i = 0; i < request.recipients.length; i++) {
      if (!service.validateAddress(request.recipients[i])) {
        throw new Error(`Invalid recipient address at index ${i}`)
      }
      
      if (request.amounts[i] <= 0n) {
        throw new Error(`Amount must be greater than 0 at index ${i}`)
      }
    }

    writeContract({
      address: CONTRACT_CONFIG.address as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'distributeTokens',
      args: [
        request.recipients as `0x${string}`[],
        request.amounts,
        request.metadata
      ]
    })
  }

  // Invalidate queries when distribution is successful
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['battle-token'] })
  }

  return {
    distributeTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  }
}

// Utility hook to check if user is contract owner
export function useIsContractOwner() {
  const { address } = useAccount()
  const { data: owner } = useBattleTokenOwner()
  
  return {
    isOwner: address && owner ? address.toLowerCase() === owner.toLowerCase() : false,
    owner,
    userAddress: address
  }
}

// Hook to get formatted balance for current user
export function useUserTokenBalance() {
  const { address } = useAccount()
  const { data: balance, isLoading, error } = useBattleTokenBalance(address)
  
  return {
    balance: balance?.balance || 0n,
    formattedBalance: balance?.formatted || '0',
    symbol: balance?.symbol || 'BATTLE',
    isLoading,
    error,
    hasBalance: (balance?.balance || 0n) > 0n
  }
}
