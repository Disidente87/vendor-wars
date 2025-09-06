'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAccount, useBalance, useContractRead, useWriteContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { Coins, MessageSquare, Star, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

// ABI simplificado para el token BATTLE
const BATTLE_TOKEN_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

// ABI para el contrato de reviews (usaremos el mismo VendorRegistration por ahora)
const REVIEW_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'reviewData', type: 'string' },
      { name: 'vendorId', type: 'string' }
    ],
    name: 'registerVendor', // Reutilizamos la función existente
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

const BATTLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS || '0xDa6884d4F2E68b9700678139B617607560f70Cc3'
const VENDOR_REGISTRATION_ADDRESS = process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS || '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a'
const REVIEW_COST = parseEther('50') // 50 tokens con 18 decimales (using vendor registration contract)

interface ReviewSystemProps {
  vendorId: string // UUID as string
  vendorName: string
}

interface Review {
  id: string
  userId: string
  username: string
  displayName?: string
  avatar: string
  content: string
  createdAt: string
  tokensPaid: number
}

export function ReviewSystem({ vendorId, vendorName }: ReviewSystemProps) {
  const { user: farcasterUser, isAuthenticated } = useFarcasterAuth()
  const { refreshBalance } = useTokenBalance()
  const { address, isConnected } = useAccount()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  // Leer balance del token
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: BATTLE_TOKEN_ADDRESS as `0x${string}`,
  })

  // Leer allowance del token
  const { data: allowanceData, refetch: refetchAllowance } = useContractRead({
    address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, VENDOR_REGISTRATION_ADDRESS as `0x${string}`] : undefined
  })

  // Debug logging
  console.log('🔍 Hook data:', {
    address,
    balanceData: balanceData ? Number(formatEther(balanceData.value)) : 'loading',
    allowanceData: allowanceData ? Number(formatEther(allowanceData)) : 'loading',
    needsApproval
  })

  // Contrato para aprobar tokens
  const { writeContractAsync: approveTokens, isPending: isApprovingTokens } = useWriteContract()

  // Verificar si necesita aprobación
  useEffect(() => {
    console.log('🔍 useEffect triggered:', {
      address: !!address,
      allowanceData: !!allowanceData,
      balanceData: !!balanceData,
      allowanceDataValue: allowanceData,
      balanceDataValue: balanceData
    })
    
    if (address && allowanceData && balanceData) {
      const allowance = Number(formatEther(allowanceData))
      const hasSufficientBalance = Number(formatEther(balanceData.value)) >= 50
      const shouldNeedApproval = allowance < 50 && hasSufficientBalance
      
      console.log('🔍 Approval check:', {
        allowance,
        hasSufficientBalance,
        shouldNeedApproval,
        currentNeedsApproval: needsApproval
      })
      
      setNeedsApproval(shouldNeedApproval)
    } else {
      console.log('🔍 Missing data for approval check:', {
        address: !!address,
        allowanceData: !!allowanceData,
        balanceData: !!balanceData
      })
    }
  }, [address, allowanceData, balanceData])

  // Cargar reviews existentes
  const loadReviews = useCallback(async () => {
    if (!vendorId) return
    
    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/vendors/${vendorId}/reviews`)
      const result = await response.json()
      
      if (result.success) {
        setReviews(result.data || [])
      } else {
        console.error('Error loading reviews:', result.error)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }, [vendorId])

  // Cargar reviews al montar el componente
  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  // Función para aprobar tokens
  const handleApproveTokens = async () => {
    if (!address) return

    setIsApproving(true)
    setError(null)

    try {
      await approveTokens({
        address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'approve',
        args: [VENDOR_REGISTRATION_ADDRESS as `0x${string}`, REVIEW_COST]
      })
      
      // Refrescar allowance después de la aprobación
      setTimeout(async () => {
        await refetchAllowance()
        setNeedsApproval(false)
        setIsApproving(false)
      }, 2000)
    } catch (error) {
      console.error('Error approving tokens:', error)
      setError('Error approving tokens. Please try again.')
      setIsApproving(false)
    }
  }

  // Función para enviar review
  const handleSubmitReview = async () => {
    if (!isAuthenticated || !farcasterUser || !address) {
      setError('Please connect your wallet and Farcaster account')
      return
    }

    if (!newReview.trim()) {
      setError('Please write a review')
      return
    }

    if (newReview.trim().length < 10) {
      setError('Review must be at least 10 characters long')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Crear review data
      const reviewData = JSON.stringify({
        vendorId,
        vendorName,
        content: newReview.trim(),
        userId: farcasterUser.fid,
        username: farcasterUser.username,
        avatar: farcasterUser.pfpUrl,
        timestamp: Date.now()
      })

      // Llamar a la API para registrar el review con pago (el backend se encarga de la blockchain)
      const response = await fetch('/api/vendors/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          content: newReview.trim(),
          userAddress: address,
          paymentAmount: '50',
          reviewData,
          ownerFid: farcasterUser.fid
        }),
      })

      const result = await response.json()

      if (result.success) {
        const txHash = result.data?.transactionHash
        const blockNumber = result.data?.blockNumber
        setSuccess(`Review submitted successfully! 50 BATTLE tokens have been burned.${txHash ? ` Transaction: ${txHash}` : ''}`)
        setNewReview('')
        
        // Refrescar balance y reviews
        await refreshBalance()
        await loadReviews()
      } else {
        setError(result.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const balance = balanceData ? Number(formatEther(balanceData.value)) : 0
  const hasSufficientBalance = balance >= 50

  if (!isAuthenticated || !farcasterUser) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20 text-center">
        <MessageSquare className="w-12 h-12 text-[#ff6b35] mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#2d1810] mb-2">Connect to Leave a Review</h3>
        <p className="text-[#6b5d52] text-sm mb-4">
          Connect your Farcaster account and wallet to leave a review for {vendorName}
        </p>
        <p className="text-xs text-[#6b5d52]">
          Cost: 50 BATTLE tokens per review
        </p>
        <div className="mt-4">
          <p className="text-xs text-red-600">
            Authentication required. Please connect your Farcaster account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="text-lg font-bold text-[#2d1810]">Leave a Review</h3>
        </div>

        {/* Balance and Cost Info */}
        <div className="bg-[#f4f1eb] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-[#ffd23f]" />
              <span className="text-sm text-[#6b5d52]">Your Balance:</span>
              <span className="font-semibold text-[#2d1810]">{balance.toFixed(2)} BATTLE</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#6b5d52]">Review Cost:</span>
              <span className="font-semibold text-[#ff6b35]">50 BATTLE</span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          </div>
        )}

        {/* Review Textarea */}
        <Textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder={`Share your experience with ${vendorName}...`}
          className="min-h-[100px] mb-4 border-[#e6e1db] focus:border-[#ff6b35] focus:ring-[#ff6b35]/20"
          maxLength={500}
        />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#6b5d52]">
            {newReview.length}/500 characters
          </span>
          <span className="text-xs text-[#6b5d52]">
            Minimum 10 characters required
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {needsApproval || (!allowanceData || !balanceData) ? (
            <Button
              onClick={handleApproveTokens}
              disabled={isApproving || isApprovingTokens || !hasSufficientBalance}
              className="flex-1 bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium py-3 rounded-xl shadow-lg"
            >
              {isApproving || isApprovingTokens ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Approve 50 BATTLE
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || !hasSufficientBalance || newReview.trim().length < 10}
              className="flex-1 bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium py-3 rounded-xl shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment (50 BATTLE)
                </>
              )}
            </Button>
          )}
        </div>

        {!hasSufficientBalance && (
          <p className="text-sm text-red-600 mt-2 text-center">
            Insufficient BATTLE tokens. You need at least 50 BATTLE to leave a review.
          </p>
        )}
      </div>

      {/* Reviews List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-5 h-5 text-[#ffd23f]" />
          <h3 className="text-lg font-bold text-[#2d1810]">Reviews ({reviews.length})</h3>
        </div>

        {isLoadingReviews ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#ff6b35]" />
            <p className="text-[#6b5d52] text-sm">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-[#8d99ae] mx-auto mb-4" />
            <p className="text-[#6b5d52] text-sm">No reviews yet. Be the first to review {vendorName}!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-[#e6e1db] rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ff6b35]">
                    <img 
                      src={review.avatar} 
                      alt={review.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-[#2d1810] text-sm">
                        {review.displayName || review.username}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <Coins className="w-3 h-3 text-[#ffd23f]" />
                        <span className="text-xs text-[#6b5d52]">{review.tokensPaid} BATTLE</span>
                      </div>
                    </div>
                    <p className="text-[#2d1810] text-sm leading-relaxed mb-2">{review.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-[#6b5d52]">
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      <span>{new Date(review.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
