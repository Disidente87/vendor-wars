'use client'

import { useTokenDistributionNotifications, useTokenDistributionSummary } from '@/hooks/useTokenDistribution'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Coins, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TokenDistributionBannerProps {
  userFid?: string
  className?: string
}

export function TokenDistributionBanner({ userFid, className = '' }: TokenDistributionBannerProps) {
  const {
    showConnectWalletPrompt,
    showDistributionSuccess,
    showDistributionError,
    pendingTokens,
    distributionResult,
    distributionError,
    triggerDistribution
  } = useTokenDistributionNotifications(userFid)

  if (!userFid) {
    return null
  }

  // Show success message
  if (showDistributionSuccess && distributionResult) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">¡Tokens Distribuidos!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-green-700">
            Se distribuyeron exitosamente {distributionResult.tokensDistributed} tokens BATTLE a tu wallet.
          </CardDescription>
          {distributionResult.transactionHash && (
            <div className="mt-2 text-sm text-green-600">
              <span className="font-mono">Tx: {distributionResult.transactionHash}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Show error message
  if (showDistributionError) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al distribuir tokens: {distributionError?.message || 'Error desconocido'}
        </AlertDescription>
      </Alert>
    )
  }

  // Show wallet connection prompt
  if (showConnectWalletPrompt) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Tokens Pendientes</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {pendingTokens} BATTLE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-orange-700 mb-4">
            Tienes {pendingTokens} tokens BATTLE esperando ser distribuidos a tu wallet.
            Conecta tu wallet para recibirlos automáticamente.
          </CardDescription>
          <Button 
            onClick={triggerDistribution}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Conectar Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}

export function TokenDistributionSummary({ userFid, className = '' }: TokenDistributionBannerProps) {
  const { pendingTokens, totalDistributed, isLoading } = useTokenDistributionSummary(userFid)

  if (!userFid || isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Cargando tokens...</span>
      </div>
    )
  }

  if (pendingTokens === 0 && totalDistributed === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coins className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">
        {totalDistributed > 0 && `${totalDistributed} distribuidos`}
        {pendingTokens > 0 && totalDistributed > 0 && ' • '}
        {pendingTokens > 0 && (
          <span className="text-orange-600">
            {pendingTokens} pendientes
          </span>
        )}
      </span>
    </div>
  )
}
