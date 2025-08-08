'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Coins,
  Zap,
  ExternalLink
} from 'lucide-react'
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useBalance,
  useSwitchChain,
  useChainId
} from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { cn } from '@/lib/utils'

interface WalletConnectProps {
  className?: string
  onConnect?: (address: string) => void
  onDisconnect?: () => void
  showBalance?: boolean
  showChainSwitch?: boolean
}

export function WalletConnect({ 
  className,
  onConnect,
  onDisconnect,
  showBalance = true,
  showChainSwitch = true
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastConnectedConnector, setLastConnectedConnector] = useState<any>(null)

  // Load last connected connector from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('last-connected-connector')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setLastConnectedConnector(parsed)
        } catch (e) {
          console.warn('Failed to parse saved connector:', e)
        }
      }
    }
  }, [])

  const { address, isConnected, isConnecting: wagmiConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()

  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  })

  // Reset connection state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setIsConnecting(false)
      setError(null)
    }
  }, [isConnected])

  // Force connector refresh when disconnected
  useEffect(() => {
    if (!isConnected) {
      // Small delay to allow connectors to reset
      const timer = setTimeout(() => {
        // This will trigger a re-render of connectors
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  const handleConnect = async (connector: any) => {
    setIsConnecting(true)
    setError(null)

    try {
      await connect({ connector })
      
      // Save connector info to localStorage
      const connectorInfo = {
        uid: connector.uid,
        name: connector.name,
        id: connector.id
      }
      setLastConnectedConnector(connectorInfo)
      localStorage.setItem('last-connected-connector', JSON.stringify(connectorInfo))
      
      if (onConnect && address) {
        onConnect(address)
      }
    } catch (err) {
      console.error('Connection error:', err)
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleReconnect = async () => {
    if (lastConnectedConnector) {
      // Find the actual connector object
      const connector = connectors.find(c => c.uid === lastConnectedConnector.uid)
      if (connector) {
        await handleConnect(connector)
      } else {
        setError('Previous wallet not available. Please connect manually.')
      }
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      // Reset connection state
      setIsConnecting(false)
      setError(null)
      if (onDisconnect) {
        onDisconnect()
      }
    } catch (err) {
      console.error('Disconnect error:', err)
      setError('Failed to disconnect properly')
    }
  }

  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: base.id })
    } catch (err) {
      console.error('Chain switch error:', err)
      setError('Failed to switch to Base network.')
    }
  }

  const getConnectorIcon = (connector: any) => {
    const name = connector.name.toLowerCase()
    if (name.includes('coinbase')) return '🟡'
    if (name.includes('metamask')) return '🦊'
    if (name.includes('farcaster')) return '📱'
    return '🔗'
  }

  const getConnectorName = (connector: any) => {
    const name = connector.name
    if (name.includes('Coinbase')) return 'Coinbase Wallet'
    if (name.includes('MetaMask')) return 'MetaMask'
    if (name.includes('Farcaster')) return 'Farcaster Frame'
    return name
  }

  if (isConnected) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Connected State */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Wallet Connected</h3>
              <p className="text-sm text-green-600 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>

          {/* Balance */}
          {showBalance && balance && (
            <div className="mt-3 flex items-center space-x-2">
              <Coins className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </span>
            </div>
          )}

          {/* Chain Info */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                {chainId === base.id ? 'Base Network' : 'Other Network'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {showChainSwitch && chainId !== base.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSwitchChain}
                  className="text-xs"
                >
                  Switch to Base
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDisconnect}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Connection Options */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </h3>
        
        <p className="text-sm text-gray-600">
          Connect your wallet to vote for vendors and earn $BATTLE tokens
        </p>

        {/* Quick Reconnect Button */}
        {lastConnectedConnector && !isConnected && (
          <Button
            onClick={handleReconnect}
            disabled={isConnecting}
            className="w-full bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <span className="text-lg mr-2">{getConnectorIcon(lastConnectedConnector)}</span>
                Reconnect to {getConnectorName(lastConnectedConnector)}
              </>
            )}
          </Button>
        )}

        {/* Available Connectors */}
        <div className="space-y-2">
          {connectors.map((connector) => {
            const isLastUsed = lastConnectedConnector?.uid === connector.uid
            // In wagmi v2, we'll assume connector is available if it exists
            const isAvailable = true
            
            return (
              <Button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isConnecting}
                className={`w-full justify-start space-x-3 h-12 ${
                  isLastUsed ? 'border-[#ff6b35] bg-[#ff6b35]/5' : ''
                }`}
                variant="outline"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-lg">{getConnectorIcon(connector)}</span>
                )}
                <span>{getConnectorName(connector)}</span>
                {isLastUsed && (
                  <span className="text-xs text-[#ff6b35]">(Last used)</span>
                )}
              </Button>
            )
          })}
        </div>
        
        {/* Connection Status */}
        {connectors.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                No wallets available. Please install a wallet extension.
              </span>
            </div>
          </div>
        )}

        {/* Recommended Network */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Recommended: Base Network for best experience
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Coinbase Wallet: Best for mobile experience</p>
          <p>• MetaMask: Popular browser extension</p>
          <p>• Farcaster Frame: Native Farcaster integration</p>
        </div>
        
        {/* Debug: Clear saved connector */}
        {lastConnectedConnector && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem('last-connected-connector')
              setLastConnectedConnector(null)
              setError(null)
            }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear saved wallet
          </Button>
        )}
      </div>
    </div>
  )
}

// Hook para usar la wallet en otros componentes
export function useWalletConnection() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address, chainId: base.id })
  const chainId = useChainId()

  return {
    address,
    isConnected,
    isConnecting,
    balance,
    chainId,
    isBaseNetwork: chainId === base.id,
    connect,
    disconnect,
    connectors
  }
}
