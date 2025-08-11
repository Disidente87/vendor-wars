'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Wallet, 
  Coins, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Loader2,
  Info
} from 'lucide-react'
import { useVendorRegistration } from '@/hooks/useVendorRegistration'

export function VendorRegistrationPaymentInfo() {
  const {
    paymentInfo,
    registrationCost,
    userBalance,
    isLoadingCost,
    isLoadingBalance,
    isLoadingPaymentInfo,
    canProceed
  } = useVendorRegistration()

  if (isLoadingCost || isLoadingBalance || isLoadingPaymentInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!paymentInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to view payment information
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const { cost, userBalance: balance, hasSufficientBalance, missingAmount } = paymentInfo

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription>
          Registration cost and balance verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Registration Cost */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Registration Cost:
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {cost} $BATTLE
            </Badge>
          </div>
        </div>

        {/* User Balance */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Your Balance:
          </span>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{balance} $BATTLE</span>
          </div>
        </div>

        {/* Status */}
        <div className="pt-2">
          {hasSufficientBalance ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Sufficient balance for registration
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Insufficient balance. You need {missingAmount} more $BATTLE tokens.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Additional Info */}
        <div className="pt-2">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Note:</strong> 50 $BATTLE tokens will be burned (destroyed) 
              when you register a vendor. This helps prevent spam and creates 
              scarcity for the token.
            </AlertDescription>
          </Alert>
        </div>

        {/* Proceed Status */}
        <div className="pt-2">
          {canProceed ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Ready to proceed with registration
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Cannot proceed - check requirements above
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function VendorRegistrationMetrics() {
  const { metrics, isLoadingMetrics } = useVendorRegistration()

  if (isLoadingMetrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Registration Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Registration Metrics
        </CardTitle>
        <CardDescription>
          Platform statistics and token economics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {metrics.totalTokensBurned}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Tokens Burned
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {metrics.totalVendorsRegistered}
            </div>
            <div className="text-sm text-muted-foreground">
              Vendors Registered
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {metrics.registrationCost}
            </div>
            <div className="text-sm text-muted-foreground">
              Cost per Vendor
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
