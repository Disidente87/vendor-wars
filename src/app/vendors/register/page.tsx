'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Check, Upload, AlertCircle, ImageIcon, X, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StorageService } from '@/services/storage'
import { FARCASTER_CONFIG } from '@/config/farcaster'

interface VendorFormData {
  name: string
  imageFile: File | null
  imageUrl: string
  zoneId: string
  description: string
  category: string
}

interface Zone {
  id: string
  name: string
  description: string
}

export default function VendorRegistrationPage() {
  const router = useRouter()
  const { user: authenticatedUser, isAuthenticated, isLoading } = useFarcasterAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [zones, setZones] = useState<Zone[]>([])
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    imageFile: null,
    imageUrl: '',
    zoneId: '',
    description: '',
    category: ''
  })

  const totalSteps = 5

  // Load zones on component mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetch('/api/zones')
        if (response.ok) {
          const result = await response.json()
          setZones(result.data || [])
        }
      } catch (error) {
        console.error('Error loading zones:', error)
      }
    }
    loadZones()
  }, [])

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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Please use JPG, PNG, GIF, or WebP.')
        return
      }

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        setErrorMessage('File too large. Maximum size is 2MB.')
        return
      }

      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file)
      }))
      setErrorMessage('')
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imageUrl: ''
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
      let imageUrl = ''

      // Upload image if provided
      if (formData.imageFile) {
        setIsUploadingImage(true)
        const tempVendorId = crypto.randomUUID()
        const uploadResult = await StorageService.uploadVendorAvatar(formData.imageFile, tempVendorId)
        
        if (!uploadResult.success) {
          setErrorMessage(uploadResult.error || 'Failed to upload image')
          setSubmitStatus('error')
          setIsUploadingImage(false)
          return
        }
        
        imageUrl = uploadResult.url!
        setIsUploadingImage(false)
      }

      // Submit vendor data
      const response = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          zoneId: formData.zoneId,
          category: formData.category,
          imageUrl: imageUrl,
          adminFid: authenticatedUser.fid
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
      setIsUploadingImage(false)
    }
  }

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return !formData.name.trim()
      case 2:
        return !formData.imageFile
      case 3:
        return !formData.zoneId
      case 4:
        return !formData.description.trim()
      case 5:
        return !formData.category
      default:
        return true
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Vendor Name'
      case 2:
        return 'Vendor Photo'
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="vendorName" className="text-sm font-medium text-[#2d1810]">
                What&apos;s your vendor name?
              </Label>
              <Input
                id="vendorName"
                type="text"
                placeholder="e.g., Tacos El Güero"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1"
                maxLength={100}
              />
              <p className="text-xs text-[#6b5d52] mt-1">
                Choose a memorable name for your vendor
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#2d1810]">
                Upload vendor photo
              </Label>
              
              {!formData.imageFile ? (
                <div 
                  className="mt-2 border-2 border-dashed border-[#ff6b35] rounded-lg p-8 text-center cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-[#ff6b35] mx-auto mb-4" />
                  <p className="text-sm text-[#2d1810] font-medium mb-1">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-[#6b5d52]">
                    JPG, PNG or WebP (max 5MB)
                  </p>
                </div>
              ) : (
                <div className="mt-2 relative">
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={formData.imageUrl}
                      alt="Vendor preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-center text-sm text-[#6b5d52] mt-2">
                    Click to change photo
                  </p>
                  <div 
                    className="mt-2 w-full h-8 bg-gray-100 rounded cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#2d1810]">
                Select your zone
              </Label>
              <Select value={formData.zoneId} onValueChange={(value) => handleInputChange('zoneId', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a battle zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      <div>
                        <div className="font-medium">{zone.name}</div>
                        <div className="text-xs text-gray-500">{zone.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6b5d52] mt-1">
                Choose the zone where your vendor operates
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-[#2d1810]">
                Describe your vendor
              </Label>
              <Textarea
                id="description"
                placeholder="Tell people about your delicious food, specialties, and what makes you unique..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-2 min-h-[120px]"
                maxLength={500}
              />
              <p className="text-xs text-[#6b5d52] mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#2d1810]">
                What&apos;s your specialty?
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select food category" />
                </SelectTrigger>
                <SelectContent>
                  {FARCASTER_CONFIG.CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6b5d52] mt-1">
                Choose your main food category
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fef7f0] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fef7f0] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-[#2d1810]">Authentication Required</CardTitle>
            <CardDescription>
              You need to log in with Farcaster to register a vendor
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/')}
              className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fef7f0] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-[#6b5d52] hover:text-[#2d1810]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#2d1810]">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-[#6b5d52]">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#ff6b35] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2d1810]">{getStepTitle()}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with your vendor's name"}
              {currentStep === 2 && "Add a photo to represent your vendor"}
              {currentStep === 3 && "Choose the zone where you operate"}
              {currentStep === 4 && "Tell customers about your vendor"}
              {currentStep === 5 && "What type of food do you sell?"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Messages */}
            {errorMessage && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {submitStatus === 'success' && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <Check className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Vendor registered successfully! Redirecting to your vendor page...
                </AlertDescription>
              </Alert>
            )}

            {/* Step Content */}
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={isNextDisabled() || isSubmitting || isUploadingImage}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUploadingImage ? 'Uploading...' : 'Registering...'}
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Register Vendor
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}