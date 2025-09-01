'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield } from 'lucide-react'

interface NetworkAlertProps {
  className?: string
}

export function NetworkAlert({ className }: NetworkAlertProps) {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Don't show if on correct network
  if (chainId === baseSepolia.id) {
    return null
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id })
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  const getNetworkName = (id: number) => {
    switch (id) {
      case 84532: return 'Base Sepolia'
      case 8453: return 'Base'
      case 10: return 'Optimism'
      default: return `Unknown (${id})`
    }
  }

  return (
    <Alert className={`border-red-200 bg-red-50 ${className || ''}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong className="text-red-800">Wrong Network Detected!</strong>
          <div className="text-sm text-red-700 mt-1">
            You&apos;re connected to <strong>{getNetworkName(chainId)}</strong> but this app requires{' '}
            <strong>Base Sepolia</strong> for token distribution.
          </div>
        </div>
        <Button
          onClick={handleSwitchNetwork}
          size="sm"
          className="ml-4 bg-red-600 hover:bg-red-700 text-white"
        >
          <Shield className="w-4 h-4 mr-2" />
          Switch to Base Sepolia
        </Button>
      </AlertDescription>
    </Alert>
  )
}

interface NetworkStatusProps {
  className?: string
}

export function NetworkStatus({ className }: NetworkStatusProps) {
  const chainId = useChainId()

  const isCorrectNetwork = chainId === baseSepolia.id

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      {isCorrectNetwork ? (
        <>
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            Base Sepolia ✅
          </span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 font-medium">
            Wrong Network ⚠️
          </span>
        </>
      )}
    </div>
  )
}
