'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useVendorWarsExtendedReview } from '@/hooks/useVendorWarsExtendedReview'
import { useBalanceContext } from '@/contexts/BalanceContext'
import { PAYMENT_CONFIG } from '@/config/payment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Coins } from 'lucide-react'

interface VendorWarsExtendedReviewFormProps {
  vendorId: string
  userFid: number
  onReviewSubmitted?: (reviewId: string) => void
}

export function VendorWarsExtendedReviewForm({ 
  vendorId, 
  userFid, 
  onReviewSubmitted 
}: VendorWarsExtendedReviewFormProps) {
  const [reviewContent, setReviewContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { address } = useAccount()
  const { refreshAllBalances } = useBalanceContext()

  const {
    reviewState,
    approveTokensForReview,
    submitReviewTransaction,
    resetState,
    refreshData,
    isApproving,
    isSubmittingReview,
    isPaused
  } = useVendorWarsExtendedReview()

  const handleApproveTokens = async () => {
    try {
      await approveTokensForReview()
    } catch (error) {
      console.error('Error aprobando tokens:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return

    try {
      setIsSubmitting(true)
      
      // Enviar petición a la API
      const response = await fetch('/api/vendors/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          content: reviewContent.trim(),
          userAddress: address || '',
          paymentAmount: reviewState.requiredAmount,
          reviewData: {
            vendorId,
            content: reviewContent.trim(),
            userFid,
            timestamp: Date.now()
          },
          ownerFid: userFid
        })
      })

      const result = await response.json()

      if (!result.success) {
        // Manejar errores específicos de límites
        if (result.limitType === 'daily') {
          throw new Error(result.message || 'Has alcanzado el límite diario de reviews (20 por día). Intenta mañana.')
        } else if (result.limitType === 'weekly') {
          throw new Error(result.message || 'Has alcanzado el límite semanal de reviews (100 por semana). Intenta la próxima semana.')
        } else if (result.limitType === 'cooldown') {
          throw new Error(result.message || 'Debes esperar antes de enviar otro review.')
        } else {
          throw new Error(result.error || 'Error submitiendo review')
        }
      }
      
      // Resetear formulario después del éxito
      setReviewContent('')
      resetState()
      
      // Refrescar balance en todas las secciones (con delay para que la transacción se confirme)
      setTimeout(async () => {
        await refreshAllBalances()
      }, 2000)
      
      if (onReviewSubmitted) {
        onReviewSubmitted(result.data?.id || `review_${vendorId}_${userFid}_${Date.now()}`)
      }
    } catch (error) {
      console.error('Error submitiendo review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = reviewState.isConnected && 
                   reviewState.hasSufficientBalance && 
                   reviewState.isApproved && 
                   reviewContent.trim().length >= 10 &&
                   !isPaused &&
                   !isSubmitting

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Submit Review - VendorWars Extended
        </CardTitle>
        <CardDescription>
          Submit a review for this vendor. This will burn {reviewState.requiredAmount} BATTLE tokens.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado de conexión */}
        {!reviewState.isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to submit a review.
            </AlertDescription>
          </Alert>
        )}

        {/* Estado de pausa */}
        {isPaused && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The contract is temporarily paused. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Estado de balance */}
        {reviewState.isConnected && !reviewState.hasSufficientBalance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Insufficient BATTLE tokens. You need {reviewState.requiredAmount} BATTLE tokens.
              Current balance: {reviewState.balance} BATTLE
            </AlertDescription>
          </Alert>
        )}

        {/* Estado de aprobación */}
        {reviewState.isConnected && reviewState.hasSufficientBalance && !reviewState.isApproved && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please approve {reviewState.requiredAmount} BATTLE tokens to submit a review.
            </AlertDescription>
          </Alert>
        )}

        {/* Estado de éxito */}
        {reviewState.isTransactionConfirmed && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Review submitted successfully! Tokens have been burned.
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {reviewState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {reviewState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Información de balance y allowance */}
        {reviewState.isConnected && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance</p>
              <p className="text-lg font-semibold">{reviewState.balance} BATTLE</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Allowance</p>
              <p className="text-lg font-semibold">{reviewState.allowance} BATTLE</p>
            </div>
          </div>
        )}

        {/* Formulario de review */}
        {reviewState.isConnected && (
          <div className="space-y-4">
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                Review Content
              </label>
              <Textarea
                id="review"
                placeholder="Write your review here (minimum 10 characters)..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewContent.length}/500 characters
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              {!reviewState.isApproved && reviewState.hasSufficientBalance && (
                <Button
                  onClick={handleApproveTokens}
                  disabled={isApproving || reviewState.isTransactionPending}
                  className="flex-1"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    `Approve ${reviewState.requiredAmount} BATTLE`
                  )}
                </Button>
              )}

              <Button
                onClick={handleSubmitReview}
                disabled={!canSubmit}
                className="flex-1"
              >
                {isSubmittingReview || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>

              <Button
                onClick={refreshData}
                variant="outline"
                disabled={reviewState.isTransactionPending}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Reviews cost {reviewState.requiredAmount} BATTLE tokens</p>
          <p>• Tokens are burned when submitting a review</p>
          <p>• Rate limit: 20 operations per day, 100 per week</p>
          <p>• Reviews are stored on-chain and in the database</p>
        </div>
      </CardContent>
    </Card>
  )
}
