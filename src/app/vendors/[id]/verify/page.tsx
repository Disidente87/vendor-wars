'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, Upload, Camera } from 'lucide-react'
import { useDevAuth } from '@/hooks/useDevAuth'

interface VerificationFormData {
  businessLicense: string
  locationPhoto: string
  socialMedia: string
  receipt: string
  communityVouch: string
}

export default function VendorVerificationPage() {
  const router = useRouter()
  const params = useParams()
  const { user: authenticatedUser, isAuthenticated, isLoading: authLoading } = useDevAuth()
  const [vendor, setVendor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState<VerificationFormData>({
    businessLicense: '',
    locationPhoto: '',
    socialMedia: '',
    receipt: '',
    communityVouch: ''
  })

  const vendorId = params.id as string

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/')
      return
    }

    if (isAuthenticated) {
      fetchVendor()
    }
  }, [isAuthenticated, authLoading, router, vendorId])

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`)
      const result = await response.json()

      if (result.success) {
        setVendor(result.data)
        
        // Check if user is the owner
        if (result.data.owner?.fid !== authenticatedUser?.fid) {
          setErrorMessage('Only the vendor owner can submit verification')
          setSubmitStatus('error')
        }
      } else {
        setErrorMessage('Vendor not found')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
      setErrorMessage('Failed to load vendor information')
      setSubmitStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof VerificationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const submitVerification = async () => {
    if (!authenticatedUser || !vendor) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/vendors/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          ownerFid: authenticatedUser.fid.toString(),
          ...formData
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          router.push(`/vendors/${vendorId}`)
        }, 3000)
      } else {
        setErrorMessage(result.error || 'Failed to submit verification')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting verification:', error)
      setErrorMessage('Network error. Please try again.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProofCount = () => {
    return Object.values(formData).filter(value => value.trim() !== '').length
  }

  const isSubmitDisabled = () => {
    return getProofCount() < 2 || isSubmitting
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ee8c0b] mx-auto"></div>
          <p className="mt-2 text-[#8a7860]">Loading vendor information...</p>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700">Vendor not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center bg-white p-4 pb-2 justify-between">
        <button
          onClick={() => router.back()}
          className="text-[#181511] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Verify {vendor.name}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-[480px] mx-auto">
          {/* Vendor Info */}
          <div className="bg-[#f5f3f0] rounded-xl p-4 mb-6">
            <h3 className="font-bold text-[#181511] mb-2">{vendor.name}</h3>
            <p className="text-[#8a7860] text-sm">{vendor.description}</p>
            <p className="text-[#8a7860] text-sm mt-1">Zone: {vendor.zone}</p>
          </div>

          {/* Verification Requirements */}
          <div className="mb-6">
            <h3 className="font-bold text-[#181511] mb-3">Verification Requirements</h3>
            <p className="text-[#8a7860] text-sm mb-4">
              To verify your vendor, please provide at least 2 of the following forms of proof:
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#181511] mb-2">
                  Business License/Permit
                </label>
                <input
                  type="text"
                  placeholder="Enter license number or upload image URL"
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e1db] bg-white text-[#181511] placeholder:text-[#8a7860] focus:outline-none focus:ring-2 focus:ring-[#ee8c0b]"
                  value={formData.businessLicense}
                  onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181511] mb-2">
                  Location Photo
                </label>
                <input
                  type="text"
                  placeholder="Enter photo URL showing your business location"
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e1db] bg-white text-[#181511] placeholder:text-[#8a7860] focus:outline-none focus:ring-2 focus:ring-[#ee8c0b]"
                  value={formData.locationPhoto}
                  onChange={(e) => handleInputChange('locationPhoto', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181511] mb-2">
                  Social Media Account
                </label>
                <input
                  type="text"
                  placeholder="Instagram, Facebook, or other social media URL"
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e1db] bg-white text-[#181511] placeholder:text-[#8a7860] focus:outline-none focus:ring-2 focus:ring-[#ee8c0b]"
                  value={formData.socialMedia}
                  onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181511] mb-2">
                  Receipt/Invoice
                </label>
                <input
                  type="text"
                  placeholder="Enter receipt URL or invoice number"
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e1db] bg-white text-[#181511] placeholder:text-[#8a7860] focus:outline-none focus:ring-2 focus:ring-[#ee8c0b]"
                  value={formData.receipt}
                  onChange={(e) => handleInputChange('receipt', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181511] mb-2">
                  Community Member Vouch
                </label>
                <input
                  type="text"
                  placeholder="Farcaster username of community member vouching for you"
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e1db] bg-white text-[#181511] placeholder:text-[#8a7860] focus:outline-none focus:ring-2 focus:ring-[#ee8c0b]"
                  value={formData.communityVouch}
                  onChange={(e) => handleInputChange('communityVouch', e.target.value)}
                />
              </div>
            </div>

            {/* Proof Counter */}
            <div className="mt-4 p-3 bg-[#f5f3f0] rounded-lg">
              <p className="text-sm text-[#8a7860]">
                Proofs provided: <span className="font-bold text-[#181511]">{getProofCount()}/5</span>
                {getProofCount() < 2 && (
                  <span className="text-red-500 ml-2">(Need at least 2)</span>
                )}
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg mb-4">
              <CheckCircle className="h-5 w-5" />
              <span>Verification submitted successfully! Review process takes up to 48 hours.</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <div className="flex px-4 py-3 justify-end">
          <button
            onClick={submitVerification}
            disabled={isSubmitDisabled()}
            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] transition-colors ${
              isSubmitDisabled()
                ? 'bg-[#e6e1db] text-[#8a7860] cursor-not-allowed'
                : 'bg-[#ee8c0b] hover:bg-[#d67d0a]'
            }`}
          >
            <span className="truncate">
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </span>
          </button>
        </div>
        <div className="h-5 bg-white" />
      </div>
    </div>
  )
} 