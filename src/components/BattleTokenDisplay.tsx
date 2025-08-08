'use client'

import { useBattleTokenInfo, useUserTokenBalance, useIsContractOwner } from '@/hooks/useBattleToken'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, Coins, Crown } from 'lucide-react'

export function BattleTokenDisplay() {
  const { data: tokenInfo, isLoading: isLoadingInfo, error: infoError } = useBattleTokenInfo()
  const { balance, formattedBalance, symbol, isLoading: isLoadingBalance, hasBalance } = useUserTokenBalance()
  const { isOwner } = useIsContractOwner()

  if (isLoadingInfo || isLoadingBalance) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (infoError) {
    return (
      <Card className="w-full max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Token</CardTitle>
          <CardDescription>
            Failed to load Battle Token information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {infoError.message}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <CardTitle>{tokenInfo?.name || 'Battle Token'}</CardTitle>
          </div>
          {isOwner && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Owner
            </Badge>
          )}
        </div>
        <CardDescription>
          Symbol: {tokenInfo?.symbol || 'BATTLE'} • Decimals: {tokenInfo?.decimals || 18}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Balance:</span>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-lg">
                {formattedBalance} {symbol}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Supply:</span>
            <span className="font-mono text-sm">
              {tokenInfo?.formattedTotalSupply || '0'} {tokenInfo?.symbol || 'BATTLE'}
            </span>
          </div>

          {hasBalance && (
            <Badge variant="default" className="w-full justify-center">
              You have tokens! 🎉
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function BattleTokenBalance() {
  const { balance, formattedBalance, symbol, isLoading, hasBalance } = useUserTokenBalance()

  if (isLoading) {
    return <Skeleton className="h-6 w-24" />
  }

  return (
    <div className="flex items-center gap-2">
      <Coins className="h-4 w-4 text-primary" />
      <span className="font-mono font-medium">
        {formattedBalance} {symbol}
      </span>
      {hasBalance && (
        <Badge variant="secondary" className="text-xs">
          Active
        </Badge>
      )}
    </div>
  )
}
