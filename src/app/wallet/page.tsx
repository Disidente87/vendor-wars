'use client'

import { useState, useEffect } from 'react'
import { WalletConnect, useWalletConnection } from '@/components/WalletConnect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { NetworkAlert } from '@/components/NetworkAlert'
import { 
  Wallet, 
  Coins, 
  Copy,
  ExternalLink,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'

export default function WalletPage() {
  const router = useRouter()
  const { address, isConnected, balance, chainId, isBaseSepoliaNetwork } = useWalletConnection()
  const { balance: battleTokens, refreshBalance } = useTokenBalance()
  const { user: farcasterUser } = useFarcasterAuth()
  const [copied, setCopied] = useState(false)
  const [isSavingWallet, setIsSavingWallet] = useState(false)
  const [isSynchronizing, setIsSynchronizing] = useState(false)
  const [isRetryingFailed, setIsRetryingFailed] = useState(false)
  const [isSyncingBalance, setIsSyncingBalance] = useState(false)
  const [tokenStatus, setTokenStatus] = useState<{
    hasPendingTokens: boolean
    hasFailedTokens: boolean
    pendingCount: number
    failedCount: number
    totalPendingTokens: number
    totalFailedTokens: number
  } | null>(null)
  const [syncResult, setSyncResult] = useState<{
    success: boolean
    tokensDistributed: number
    message: string
  } | null>(null)

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

  const handleWalletConnect = async (walletAddress: string) => {
    if (!farcasterUser?.fid) {
      console.warn('No Farcaster user available to save wallet')
      return
    }

    setIsSavingWallet(true)
    try {
      console.log(`🔗 Saving wallet ${walletAddress} for user ${farcasterUser.fid}`)
      
      // Call the API endpoint to sync wallet and distribute tokens
      const response = await fetch('/api/wallet/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: farcasterUser.fid.toString(),
          walletAddress: walletAddress
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log(`✅ Wallet saved successfully!`)
        if (result.tokensDistributed > 0) {
          console.log(`🎁 Processed ${result.tokensDistributed} pending tokens`)
          // Refresh balance after processing tokens
          refreshBalance()
        }
      } else {
        console.error(`❌ Failed to save wallet:`, result.error)
      }
    } catch (error) {
      console.error('Error saving wallet:', error)
    } finally {
      setIsSavingWallet(false)
    }
  }

  const handleSynchronizeBalance = async () => {
    if (!farcasterUser?.fid || !address) {
      console.warn('No Farcaster user or wallet address available')
      return
    }

    setIsSynchronizing(true)
    setSyncResult(null)
    
    try {
      console.log(`🔄 Synchronizing balance for user ${farcasterUser.fid} with wallet ${address}`)
      
      // Call the API endpoint to sync wallet and distribute tokens
      const response = await fetch('/api/wallet/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: farcasterUser.fid.toString(),
          walletAddress: address
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncResult({
          success: true,
          tokensDistributed: result.tokensDistributed,
          message: result.message
        })
        
        console.log(`✅ Synchronization successful: ${result.message}`)
        
        // Refresh token balance after successful sync
        if (result.tokensDistributed > 0) {
          // Refresh balance from database (with small delay to ensure cache is updated)
          setTimeout(() => {
            refreshBalance()
          }, 500)
        }
        
        // Check token status again to update button visibility
        checkTokenStatus()
      } else {
        setSyncResult({
          success: false,
          tokensDistributed: 0,
          message: result.error || 'Failed to synchronize balance'
        })
        console.error(`❌ Synchronization failed:`, result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSyncResult({
        success: false,
        tokensDistributed: 0,
        message: errorMessage
      })
      console.error('Error synchronizing balance:', error)
    } finally {
      setIsSynchronizing(false)
    }
  }

  const handleRetryFailed = async () => {
    if (!farcasterUser?.fid) {
      console.warn('No Farcaster user available to retry failed distributions')
      return
    }

    setIsRetryingFailed(true)
    setSyncResult(null)
    
    try {
      console.log(`🔄 Retrying failed distributions for user ${farcasterUser.fid}`)
      
      // Call the API endpoint to retry failed distributions
      const response = await fetch('/api/wallet/retry-failed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: farcasterUser.fid.toString()
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncResult({
          success: true,
          tokensDistributed: result.tokensDistributed,
          message: result.message
        })
        
        console.log(`✅ Retry successful: ${result.message}`)
        
        // Refresh balance after successful retry
        if (result.tokensDistributed > 0) {
          // Refresh balance from database (with small delay to ensure cache is updated)
          setTimeout(() => {
            refreshBalance()
          }, 500)
        }
        
        // Check token status again to update button visibility
        checkTokenStatus()
      } else {
        setSyncResult({
          success: false,
          tokensDistributed: 0,
          message: result.error || 'Failed to retry failed distributions'
        })
        console.error(`❌ Retry failed:`, result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSyncResult({
        success: false,
        tokensDistributed: 0,
        message: errorMessage
      })
      console.error('Error retrying failed distributions:', error)
    } finally {
      setIsRetryingFailed(false)
    }
  }

  const handleSyncBalanceOnly = async () => {
    if (!farcasterUser?.fid || !address) {
      console.warn('No Farcaster user or wallet address available')
      return
    }

    setIsSyncingBalance(true)
    setSyncResult(null)
    
    try {
      console.log(`🔄 Syncing balance only for user ${farcasterUser.fid} with wallet ${address}`)
      
      // Call the API endpoint to sync balance only
      const response = await fetch('/api/wallet/sync-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: farcasterUser.fid.toString(),
          walletAddress: address
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncResult({
          success: true,
          tokensDistributed: 0,
          message: result.message
        })
        
        console.log(`✅ Balance sync successful: ${result.message}`)
        
        // Refresh balance after successful sync (with small delay to ensure cache is updated)
        setTimeout(() => {
          refreshBalance()
        }, 500)
        
        // Check token status again to update button visibility
        checkTokenStatus()
      } else {
        setSyncResult({
          success: false,
          tokensDistributed: 0,
          message: result.error || 'Failed to sync balance'
        })
        console.error(`❌ Balance sync failed:`, result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSyncResult({
        success: false,
        tokensDistributed: 0,
        message: errorMessage
      })
      console.error('Error syncing balance:', error)
    } finally {
      setIsSyncingBalance(false)
    }
  }

  const checkTokenStatus = async () => {
    if (!farcasterUser?.fid) {
      return
    }

    try {
      console.log(`🔍 Checking token status for user ${farcasterUser.fid}`)
      
      const response = await fetch(`/api/wallet/check-status?userFid=${farcasterUser.fid}`)
      const result = await response.json()

      if (result.success) {
        setTokenStatus(result.data)
        console.log(`📊 Token status:`, result.data)
      } else {
        console.error(`❌ Failed to check token status:`, result.error)
      }
    } catch (error) {
      console.error('Error checking token status:', error)
    }
  }

  // Check token status when component mounts or user changes
  useEffect(() => {
    if (farcasterUser?.fid) {
      checkTokenStatus()
    }
  }, [farcasterUser?.fid])

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
            onConnect={handleWalletConnect}
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Balances</label>
                <div className="flex gap-2">
                  {/* Sync Balance Only - Always visible */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSyncBalanceOnly}
                    disabled={isSyncingBalance}
                    className="text-xs"
                  >
                    {isSyncingBalance ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Sync Balance Only
                      </>
                    )}
                  </Button>
                  
                  {/* Retry Failed - Only show if there are failed tokens */}
                  {tokenStatus?.hasFailedTokens && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetryFailed}
                      disabled={isRetryingFailed}
                      className="text-xs"
                    >
                      {isRetryingFailed ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry Failed ({tokenStatus.failedCount})
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Distribute Pending Tokens - Only show if there are pending tokens */}
                  {tokenStatus?.hasPendingTokens && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSynchronizeBalance}
                      disabled={isSynchronizing}
                      className="text-xs"
                    >
                      {isSynchronizing ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Distributing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Distribute Pending ({tokenStatus.pendingCount})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
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

        {/* Synchronization Result */}
        {syncResult && (
          <Card className={`mb-6 ${syncResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  syncResult.success ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {syncResult.success ? (
                    <span className="text-white text-xs">✓</span>
                  ) : (
                    <span className="text-white text-xs">✗</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    syncResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {syncResult.success ? 'Synchronization Successful' : 'Synchronization Failed'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    syncResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {syncResult.message}
                  </p>
                  {syncResult.success && syncResult.tokensDistributed > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      💰 Your balance has been updated across all pages
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Wallet Status */}
        {isSavingWallet && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff6b35]"></div>
                <span className="text-sm text-gray-600">Saving wallet and processing pending tokens...</span>
              </div>
            </CardContent>
          </Card>
        )}

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
