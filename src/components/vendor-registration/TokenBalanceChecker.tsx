'use client'

import { useAccount } from 'wagmi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

interface TokenBalanceCheckerProps {
  showRequired?: boolean
  className?: string
}

const BATTLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS || '0xDa6884d4F2E68b9700678139B617607560f70Cc3'
const REQUIRED_AMOUNT = 50

export function TokenBalanceChecker({ showRequired = true, className = '' }: TokenBalanceCheckerProps) {
  const { address, isConnected } = useAccount()
  
  // Balance deshabilitado para evitar rate limiting
  const balanceData = null
  const isLoading = false
  const refetch = () => {}
  const balance = 0
  const hasSufficientBalance = balance >= REQUIRED_AMOUNT

  if (!isConnected) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Conecta tu wallet para ver tu saldo
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium">Saldo:</span>
      
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Badge variant={hasSufficientBalance ? "default" : "destructive"} className="text-black">
            {balance.toFixed(2)} $BATTLE
          </Badge>
          
          {showRequired && (
            <span className="text-xs text-muted-foreground">
              / {REQUIRED_AMOUNT} requeridos
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  )
}
