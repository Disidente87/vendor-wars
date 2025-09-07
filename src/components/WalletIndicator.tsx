'use client'

import { useWalletConnection } from '@/components/WalletConnect'
import { Button } from '@/components/ui/button'
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WalletIndicatorProps {
  className?: string
  showBalance?: boolean
}

export function WalletIndicator({ className, showBalance = false }: WalletIndicatorProps) {
  const { address, isConnected, balance, isBaseSepoliaNetwork } = useWalletConnection()
  const router = useRouter()

  const handleWalletClick = () => {
    router.push('/wallet')
  }

  if (!isConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleWalletClick}
        className={`border-orange-200 text-orange-700 hover:bg-orange-50 ${className}`}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleWalletClick}
      className={`border-green-200 text-green-700 hover:bg-green-50 ${className}`}
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      <span className="font-mono text-xs">
        {address?.slice(0, 4)}...{address?.slice(-4)}
      </span>
      {showBalance && balance && typeof balance === 'object' && 'formatted' in balance && 'symbol' in balance && (
        <span className="ml-2 text-xs opacity-75">
          {parseFloat((balance as any).formatted).toFixed(3)} {(balance as any).symbol}
        </span>
      )}
      {!isBaseSepoliaNetwork && (
        <AlertCircle className="w-3 h-3 ml-1 text-yellow-600" />
      )}
    </Button>
  )
}
