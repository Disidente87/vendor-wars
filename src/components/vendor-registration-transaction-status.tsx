'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { useVendorRegistration } from '@/hooks/useVendorRegistration'

export function VendorRegistrationTransactionStatus() {
  const {
    registrationState,
    clearError,
    clearSuccess,
    resetRegistration
  } = useVendorRegistration()

  const { 
    paymentStatus, 
    errorMessage, 
    successMessage, 
    transactionHash,
    isSubmitting,
    isProcessingPayment
  } = registrationState

  if (paymentStatus === 'idle') {
    return null
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Processing Payment'
      case 'success':
        return 'Registration Successful!'
      case 'error':
        return 'Registration Failed'
      default:
        return 'Payment Status'
    }
  }

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Please wait while we process your payment and register your vendor...'
      case 'success':
        return 'Your vendor has been successfully registered!'
      case 'error':
        return 'There was an error during registration. Please try again.'
      default:
        return 'Checking payment status...'
    }
  }

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>
      case 'error':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusTitle()}
        </CardTitle>
        <CardDescription>
          {getStatusDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex justify-center">
          {getStatusBadge()}
        </div>

        {/* Loading State */}
        {(isSubmitting || isProcessingPayment) && (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {isProcessingPayment ? 'Processing payment...' : 'Submitting registration...'}
            </span>
          </div>
        )}

        {/* Success Message */}
        {paymentStatus === 'success' && successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {paymentStatus === 'error' && errorMessage && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction Hash */}
        {transactionHash && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Transaction Hash:
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {transactionHash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  // Copy to clipboard
                  navigator.clipboard.writeText(transactionHash)
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {paymentStatus === 'success' && (
            <Button
              onClick={resetRegistration}
              variant="outline"
              className="flex-1"
            >
              Register Another Vendor
            </Button>
          )}
          
          {paymentStatus === 'error' && (
            <>
              <Button
                onClick={clearError}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={resetRegistration}
                variant="outline"
                className="flex-1"
              >
                Start Over
              </Button>
            </>
          )}

          {paymentStatus === 'success' && (
            <Button
              onClick={() => {
                // Navigate to vendor page
                window.location.href = `/vendors/${transactionHash}`
              }}
              className="flex-1"
            >
              View Vendor
            </Button>
          )}
        </div>

        {/* Additional Info */}
        {paymentStatus === 'success' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Congratulations!</strong> Your vendor has been registered and 
              50 $BATTLE tokens have been burned. You can now manage your vendor 
              from your profile.
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'error' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Need help?</strong> If you continue to experience issues, 
              please check your wallet connection and ensure you have sufficient 
              $BATTLE tokens. Contact support if the problem persists.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export function VendorRegistrationProgress() {
  const { registrationState } = useVendorRegistration()
  const { currentStep, isSubmitting, isProcessingPayment } = registrationState

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Vendor name and details' },
    { id: 2, title: 'Image Upload', description: 'Upload vendor photo' },
    { id: 3, title: 'Delegation', description: 'Choose zone delegation' },
    { id: 4, title: 'Description', description: 'Describe your vendor' },
    { id: 5, title: 'Category', description: 'Select vendor category' },
    { id: 6, title: 'Payment', description: 'Confirm and pay' }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registration Progress</CardTitle>
        <CardDescription>
          Step {currentStep} of {steps.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            const isPending = step.id > currentStep

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isCompleted
                    ? 'border-green-200 bg-green-50'
                    : isCurrent
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-muted bg-muted/30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {step.description}
                  </div>
                </div>
                {isCurrent && (isSubmitting || isProcessingPayment) && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
