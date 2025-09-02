'use client'

import { useState } from 'react'
import { WalletConnect, useWalletConnection } from '@/components/WalletConnect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { NetworkAlert } from '@/components/NetworkAlert'
import { 
  Wallet, 
  Coins, 
  Copy,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTokenBalance } from '@/hooks/useTokenBalance'

export default function WalletPage() {
  const router = useRouter()
  const { address, isConnected, balance, chainId, isBaseSepoliaNetwork } = useWalletConnection()
  const { balance: battleTokens } = useTokenBalance()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openExplorer = () => {
    if (address) {
      const explorerUrl = isBaseSepoliaNetwork 
        ? `https://sepolia.basescan.org/address/${address}`
        : `https://etherscan.io/address/${address}`
      window.open(explorerUrl, '_blank')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-[#2d1810]">Wallet</h1>
          </div>

          {/* Wallet Connect Component */}
          <WalletConnect 
            onConnect={(address) => {
              console.log('Wallet connected:', address)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-[#2d1810]">Wallet</h1>
          </div>
          <Wallet className="w-6 h-6 text-[#ff6b35]" />
        </div>

        {/* Network Alert */}
        <NetworkAlert className="mb-6" />

        {/* Wallet Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </CardTitle>
            <CardDescription>
              {isBaseSepoliaNetwork ? 'Base Sepolia Network' : 'Other Network'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyAddress}
                  className="text-xs"
                >
                  {copied ? 'Copied!' : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openExplorer}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Balances */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Balances</label>
              
              {/* ETH/BASE Balance */}
              {balance && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">ETH</span>
                  </div>
                  <span className="text-sm font-mono">
                    {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                  </span>
                </div>
              )}

              {/* BATTLE Tokens - Only show if connected to Base */}
              {isBaseSepoliaNetwork && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">$BATTLE</span>
                  </div>
                  <span className="text-sm font-mono">
                    {battleTokens || 0} BATTLE
                  </span>
                </div>
              )}
              
              {/* App Tokens - Show when not on Base */}
              {!isBaseSepoliaNetwork && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">App Tokens</span>
                  </div>
                  <span className="text-sm font-mono">
                    {battleTokens || 0} BATTLE
                  </span>
                  <span className="text-xs text-orange-600">(Off-chain)</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Network Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network</span>
              <span className="text-sm font-medium">
                {isBaseSepoliaNetwork ? 'Base Sepolia' : 'Other'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chain ID</span>
              <span className="text-sm font-mono">{chainId}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600">
                Connected
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Disconnect Button */}
        <div className="mt-6">
          <WalletConnect 
            showBalance={false}
            showChainSwitch={false}
          />
        </div>
      </div>
    </div>
  )
}
