'use client'

import { useEffect } from 'react'
import { X, Share2, CheckCircle } from 'lucide-react'

interface VoteResultModalProps {
  isOpen: boolean
  onClose: () => void
  vendor: {
    name: string
    imageUrl: string
  }
  battleTokens: number
  isVerified: boolean
}

export function VoteResultModal({ isOpen, onClose, vendor, battleTokens, isVerified }: VoteResultModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Add haptic feedback for modal open
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(200)
      }
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    onClose()
  }

  const handleShare = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Vendor Wars',
        text: `I just voted for ${vendor.name} and earned ${battleTokens} battle tokens!`,
        url: 'https://vendor-wars.vercel.app'
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`I just voted for ${vendor.name} and earned ${battleTokens} battle tokens! Check out Vendor Wars: https://vendor-wars.vercel.app`)
      alert('Link copied to clipboard!')
    }
  }

  const handleVerify = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    
    // Verify functionality
    console.log('Verifying vote...')
    // TODO: Implement vote verification
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 modal-backdrop"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm mx-auto overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation active:scale-95"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
            Vote Successful!
          </h3>

          {/* Vendor info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-12 h-12 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url("${vendor.imageUrl}")` }}
            />
            <div>
              <p className="font-medium text-gray-900">{vendor.name}</p>
              <p className="text-sm text-gray-600">
                {isVerified ? 'Verified Vote' : 'Regular Vote'}
              </p>
            </div>
          </div>

          {/* Battle tokens */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Battle Tokens Earned</p>
            <p className="text-3xl font-bold text-orange-600">{battleTokens}</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors hover:bg-blue-700 active:scale-95 touch-manipulation"
              style={{ minHeight: '48px' }}
            >
              <Share2 className="h-5 w-5" />
              Share on Farcaster
            </button>

            {!isVerified && (
              <button
                onClick={handleVerify}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors hover:bg-gray-200 active:scale-95 touch-manipulation"
                style={{ minHeight: '48px' }}
              >
                <CheckCircle className="h-5 w-5" />
                Verify Vote
              </button>
            )}

            <button
              onClick={handleClose}
              className="w-full py-3 px-4 text-gray-600 font-medium transition-colors hover:text-gray-800 active:scale-95 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 