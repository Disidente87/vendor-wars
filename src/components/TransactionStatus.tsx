'use client'

import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TransactionStatusProps {
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  error: string | null
  hash: string | null
  onReset?: () => void
  className?: string
}

export function TransactionStatus({
  isPending,
  isSuccess,
  isError,
  error,
  hash,
  onReset,
  className
}: TransactionStatusProps) {
  const openExplorer = () => {
    if (hash) {
      const explorerUrl = `https://basescan.org/tx/${hash}`
      window.open(explorerUrl, '_blank')
    }
  }

  if (!isPending && !isSuccess && !isError) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Pending State */}
      {isPending && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800">Transaction Pending</h3>
              <p className="text-sm text-blue-600">
                Please confirm the transaction in your wallet
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Transaction Successful!</h3>
              <p className="text-sm text-green-600">
                Your transaction has been confirmed on the blockchain
              </p>
              {hash && (
                <div className="mt-2 flex items-center space-x-2">
                  <code className="text-xs font-mono bg-green-100 px-2 py-1 rounded">
                    {hash.slice(0, 8)}...{hash.slice(-6)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openExplorer}
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              )}
            </div>
          </div>
          {onReset && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              className="mt-3 text-xs"
            >
              New Transaction
            </Button>
          )}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Transaction Failed</h3>
              <p className="text-sm text-red-600">
                {error || 'An error occurred while processing your transaction'}
              </p>
            </div>
          </div>
          {onReset && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              className="mt-3 text-xs"
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
