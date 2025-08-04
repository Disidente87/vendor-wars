'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useDevAuth } from '@/hooks/useDevAuth'

interface VendorFormData {
  name: string
  logo: string
  zone: string
  description: string
  category: string
}

export default function VendorRegistrationPage() {
  const router = useRouter()
  const { user: authenticatedUser, isAuthenticated, isLoading } = useDevAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    logo: '',
    zone: '',
    description: '',
    category: 'Category'
  })

  const totalSteps = 5

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleInputChange = (field: keyof VendorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      await submitVendorRegistration()
    }
  }

  const submitVendorRegistration = async () => {
    if (!authenticatedUser) {
      setErrorMessage('You must be logged in to register a vendor')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ownerFid: authenticatedUser.fid.toString(),
          ownerName: authenticatedUser.displayName
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          router.push(`/vendors/${result.data.id}`)
        }, 2000)
      } else {
        setErrorMessage(result.error || 'Failed to register vendor')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error registering vendor:', error)
      setErrorMessage('Network error. Please try again.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return !formData.name.trim()
      case 2:
        return !formData.logo.trim()
      case 3:
        return !formData.zone.trim()
      case 4:
        return !formData.description.trim()
      case 5:
        return formData.category === 'Category'
      default:
        return true
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Vendor Name'
      case 2:
        return 'Vendor Logo'
      case 3:
        return 'Zone'
      case 4:
        return 'Description'
      case 5:
        return 'Category'
      default:
        return 'Vendor Registration'
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                placeholder="Vendor Name"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181511] focus:outline-0 focus:ring-0 border-none bg-[#f5f3f0] focus:border-none h-14 placeholder:text-[#8a7860] p-4 text-base font-normal leading-normal"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </label>
          </div>
        )
      case 2:
        return (
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                placeholder="Vendor Logo"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181511] focus:outline-0 focus:ring-0 border-none bg-[#f5f3f0] focus:border-none h-14 placeholder:text-[#8a7860] p-4 text-base font-normal leading-normal"
                value={formData.logo}
                onChange={(e) => handleInputChange('logo', e.target.value)}
              />
            </label>
          </div>
        )
      case 3:
        return (
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                placeholder="Zone"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181511] focus:outline-0 focus:ring-0 border-none bg-[#f5f3f0] focus:border-none h-14 placeholder:text-[#8a7860] p-4 text-base font-normal leading-normal"
                value={formData.zone}
                onChange={(e) => handleInputChange('zone', e.target.value)}
              />
            </label>
          </div>
        )
      case 4:
        return (
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea
                placeholder="Description"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181511] focus:outline-0 focus:ring-0 border-none bg-[#f5f3f0] focus:border-none min-h-36 placeholder:text-[#8a7860] p-4 text-base font-normal leading-normal"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </label>
          </div>
        )
      case 5:
        return (
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <select
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181511] focus:outline-0 focus:ring-0 border-none bg-[#f5f3f0] focus:border-none h-14 bg-[image:--select-button-svg] placeholder:text-[#8a7860] p-4 text-base font-normal leading-normal"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={{
                  '--select-button-svg': `url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(138,120,96)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')`
                } as React.CSSProperties}
              >
                <option value="Category">Category</option>
                <option value="Tacos">Tacos</option>
                <option value="Tortas">Tortas</option>
                <option value="Tamales">Tamales</option>
                <option value="Elotes">Elotes</option>
                <option value="Churros">Churros</option>
                <option value="Helados">Helados</option>
                <option value="Café">Café</option>
                <option value="Aguas Frescas">Aguas Frescas</option>
                <option value="Otros">Otros</option>
              </select>
            </label>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ 
        fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
        '--select-button-svg': `url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(138,120,96)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')`
      } as React.CSSProperties}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <button
            onClick={() => router.back()}
            className="text-[#181511] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            {getStepTitle()}
          </h2>
        </div>

        {/* Progress Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-3 py-5">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index + 1 <= currentStep ? 'bg-[#181511]' : 'bg-[#e6e1db]'
              }`}
            />
          ))}
        </div>

        {/* Current Step Form */}
        {renderCurrentStep()}

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg mx-4">
            <CheckCircle className="h-5 w-5" />
            <span>Vendor registered successfully! Redirecting...</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg mx-4">
            <AlertCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div>
        <div className="flex px-4 py-3 justify-end">
          <button
            onClick={handleNext}
            disabled={isNextDisabled() || isSubmitting}
            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] transition-colors ${
              isNextDisabled() || isSubmitting
                ? 'bg-[#e6e1db] text-[#8a7860] cursor-not-allowed'
                : 'bg-[#ee8c0b] hover:bg-[#d67d0a]'
            }`}
          >
            <span className="truncate">
              {isSubmitting ? 'Submitting...' : currentStep === totalSteps ? 'Submit' : 'Next'}
            </span>
          </button>
        </div>
        <div className="h-5 bg-white" />
      </div>
    </div>
  )
} 