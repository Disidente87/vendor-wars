import { Coins, RefreshCw } from 'lucide-react'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { Button } from '@/components/ui/button'

export function TokenBalance() {
  const { balance, loading, error, refreshBalance } = useTokenBalance()

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <Coins className="h-4 w-4" />
        <span>Error loading balance</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshBalance}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-amber-700">
      <Coins className="h-4 w-4" />
      <span className="text-sm font-medium">
        {loading ? (
          'Loading...'
        ) : (
          `${balance?.toLocaleString() || 0} $BATTLE`
        )}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={refreshBalance}
        disabled={loading}
        className="h-6 w-6 p-0 hover:bg-amber-100"
      >
        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
} 