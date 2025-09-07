'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wallet, Coins, AlertCircle, CheckCircle } from 'lucide-react'
import { useBalanceContext } from '@/contexts/BalanceContext'

interface PaymentStepProps {
  onPaymentReady: (isReady: boolean) => void
  onNext: () => void
  onBack: () => void
}

const BATTLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS || '0xDa6884d4F2E68b9700678139B617607560f70Cc3'
const REQUIRED_AMOUNT = 50 // 50 $BATTLE tokens

export function PaymentStep({ onPaymentReady, onNext, onBack }: PaymentStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { refreshAllBalances } = useBalanceContext()
  
  // Obtener balance de $BATTLE tokens
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    token: BATTLE_TOKEN_ADDRESS as `0x${string}`,
  })

  const balance = balanceData ? Number(balanceData.formatted) : 0
  const hasSufficientBalance = balance >= REQUIRED_AMOUNT
  const isReady = isConnected && hasSufficientBalance && !isLoading

  useEffect(() => {
    onPaymentReady(isReady)
  }, [isReady, onPaymentReady])

  const handleConnect = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Conectar con la primera wallet disponible (MetaMask por defecto)
      const connector = connectors[0]
      if (connector) {
        await connect({ connector })
      }
    } catch (err) {
      setError('Error al conectar wallet. Asegúrate de tener MetaMask instalado.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setError(null)
  }

  const handleRefreshBalance = async () => {
    await refetchBalance()
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Conectar Wallet
          </CardTitle>
          <CardDescription>
            Conecta tu wallet para verificar tu saldo de $BATTLE tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Necesitas al menos <Badge variant="secondary">{REQUIRED_AMOUNT} $BATTLE</Badge> para registrar un vendor
            </p>
          </div>
          
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting || isLoading}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Conectar Wallet
              </>
            )}
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Verificación de Pago
        </CardTitle>
        <CardDescription>
          Verifica tu saldo de $BATTLE tokens para el registro
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información de la Wallet */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Wallet Conectada</p>
          <p className="text-xs text-muted-foreground font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Saldo de Tokens */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Saldo $BATTLE:</span>
            {isBalanceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Badge variant={hasSufficientBalance ? "default" : "destructive"}>
                {balance.toFixed(2)} $BATTLE
              </Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Costo de Registro:</span>
            <Badge variant="secondary">{REQUIRED_AMOUNT} $BATTLE</Badge>
          </div>
        </div>

        {/* Estado de Verificación */}
        <div className="p-3 rounded-lg border">
          {hasSufficientBalance ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Saldo suficiente para el registro</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Saldo insuficiente. Necesitas {(REQUIRED_AMOUNT - balance).toFixed(2)} $BATTLE más
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshBalance}
            disabled={isBalanceLoading}
            className="flex-1"
          >
            <Loader2 className={`mr-2 h-4 w-4 ${isBalanceLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDisconnect}
            className="flex-1"
          >
            Desconectar
          </Button>
        </div>

        {/* Botones de Navegación */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Anterior
          </Button>
          
          <Button 
            onClick={onNext} 
            disabled={!hasSufficientBalance}
            className="flex-1"
          >
            Continuar
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
