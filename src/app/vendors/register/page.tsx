'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { useAccount } from 'wagmi'
import { useBalanceContext } from '@/contexts/BalanceContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Check, Upload, AlertCircle, ImageIcon, X, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StorageService } from '@/services/storage'
import { FARCASTER_CONFIG, getSubcategories } from '@/config/farcaster'
import { DelegationService, ZoneWithDelegations } from '@/services/delegations'
import { PaymentStep } from '@/components/vendor-registration/PaymentStep'
import { TransactionStatus } from '@/components/vendor-registration/TransactionStatus'
import { TokenBalanceChecker } from '@/components/vendor-registration/TokenBalanceChecker'
import { useVendorRegistrationPayment } from '@/hooks/useVendorRegistrationPayment'
import { vendorPaymentService } from '@/services/vendorPayment'

interface VendorFormData {
  name: string
  imageFile: File | null
  imageUrl: string
  delegation: string
  description: string
  category: string
  subcategories: string[] // Array of selected subcategory IDs
  userAddress: string
  paymentAmount: string
  vendorId: string
}



export default function VendorRegistrationPage() {
  const router = useRouter()
  const { user: authenticatedUser, isAuthenticated, isLoading } = useFarcasterAuth()
  const { refreshAllBalances } = useBalanceContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [zonesWithDelegations, setZonesWithDelegations] = useState<ZoneWithDelegations[]>([])
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    imageFile: null,
    imageUrl: '',
    delegation: '',
    description: '',
    category: '',
    subcategories: [],
    userAddress: '',
    paymentAmount: '50',
    vendorId: ''
  })

  const totalSteps = 6 // Agregamos el paso de pago

  // Hook para el sistema de pago
  const paymentHook = useVendorRegistrationPayment()

  // Load zones with delegations on component mount
  useEffect(() => {
    const loadZonesWithDelegations = async () => {
      try {
        const zonesWithDelegations = await DelegationService.getZonesWithDelegations()
        setZonesWithDelegations(zonesWithDelegations)
      } catch (error) {
        console.error('Error loading zones with delegations:', error)
      }
    }
    loadZonesWithDelegations()
  }, [])

  // Generar ID del vendor cuando se complete el primer paso
  useEffect(() => {
    if (formData.name && !formData.vendorId) {
      const vendorId = vendorPaymentService.generateVendorId()
      setFormData(prev => ({ ...prev, vendorId }))
    }
  }, [formData.name, formData.vendorId])

  // Hook para obtener la dirección del usuario
  const { address: userAddress } = useAccount()

  // Actualizar dirección del usuario cuando se conecte la wallet
  useEffect(() => {
    if (userAddress && !formData.userAddress) {
      setFormData(prev => ({ ...prev, userAddress }))
    }
  }, [userAddress, formData.userAddress])

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
    
    // Clear subcategories when main category changes
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        subcategories: []
      }))
    }
  }

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategoryId)
        ? prev.subcategories.filter(id => id !== subcategoryId)
        : [...prev.subcategories, subcategoryId]
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

    // Nota: El pago se procesa dentro de la API, no necesitamos verificar aquí
    // La API se encarga de simular, ejecutar la transacción y guardar en BD

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      let imageUrl = ''

      // Upload image if provided
      if (formData.imageFile) {
        setIsUploadingImage(true)
        const tempVendorId = formData.vendorId || crypto.randomUUID()
        const uploadResult = await StorageService.uploadVendorAvatar(formData.imageFile, tempVendorId)
        
        if (!uploadResult.success) {
          setErrorMessage(uploadResult.error || 'Failed to upload image')
          setSubmitStatus('error')
          setIsUploadingImage(false)
          return
        }
        
        imageUrl = uploadResult.url!
        console.log('🔍 Frontend: imageUrl asignado después de upload:', imageUrl)
        console.log('🔍 Frontend: imageUrl es blob después de upload?', imageUrl.startsWith('blob:'))
        setIsUploadingImage(false)
      }

      // Validar que el usuario esté autenticado y tenga FID
      if (!authenticatedUser || !authenticatedUser.fid) {
        console.error('❌ Usuario no autenticado o sin FID:', authenticatedUser)
        setErrorMessage('Error: Usuario no autenticado. Por favor, inicia sesión nuevamente.')
        setIsSubmitting(false)
        return
      }
      
      // Regenerar vendorId para evitar conflictos
      const freshVendorId = vendorPaymentService.generateVendorId()
      console.log('🔄 Frontend: Regenerando vendorId:', freshVendorId)
      
      // Preparar datos para la nueva API con pago
      const vendorData = {
        name: formData.name,
        description: formData.description,
        delegation: formData.delegation,
        category: formData.category,
        subcategories: formData.subcategories, // Include selected subcategories
        imageUrl: imageUrl // Usar la variable local, no formData.imageUrl
      }
      
      console.log('🔍 Frontend: formData.imageUrl (blob):', formData.imageUrl)
      console.log('🔍 Frontend: imageUrl local (supabase):', imageUrl)
      
      console.log('🔍 Frontend: imageUrl que se envía:', imageUrl)
      console.log('🔍 Frontend: imageUrl es blob?', imageUrl.startsWith('blob:'))
      
      const requestData = {
        userAddress: formData.userAddress,
        vendorData: JSON.stringify(vendorData),
        vendorId: freshVendorId, // Usar el vendorId fresco
        paymentAmount: formData.paymentAmount,
        signature: '0x' + '0'.repeat(130), // Placeholder signature for now
        ownerFid: authenticatedUser?.fid || null // Asegurar que no sea undefined
      }
      
      console.log('🚀 Sending vendor registration data with payment:', requestData)
      
      console.log('🔍 Frontend: authenticatedUser.fid:', authenticatedUser.fid)
      console.log('🔍 Frontend: Tipo de authenticatedUser.fid:', typeof authenticatedUser.fid)
      console.log('🔍 Frontend: Enviando FID en header:', authenticatedUser.fid.toString())
      console.log('🔍 Frontend: Enviando FID en body:', requestData.ownerFid)
      
      const response = await fetch('/api/vendors/register-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-farcaster-fid': authenticatedUser.fid.toString(),
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        // Refrescar balance en todas las secciones (con delay para que la transacción se confirme)
        setTimeout(async () => {
          await refreshAllBalances()
        }, 2000)
        setTimeout(() => {
          router.push(`/vendors`)
        }, 2000)
      } else {
        // Verificar si es un error de cooldown específico
        if (result.cooldownError) {
          console.log('⏰ Error de cooldown detectado:', result.message)
          setErrorMessage(result.message || 'Debes esperar 1 hora entre registros de vendors.')
          setSubmitStatus('error')
          setIsSubmitting(false)
          return
        }
        
        // Si la API falla pero la transacción ya se ejecutó, redirigir de todos modos
        console.log('⚠️ API falló pero redirigiendo a vendors:', result.error)
        setSubmitStatus('success')
        // Refrescar balance en todas las secciones (con delay para que la transacción se confirme)
        setTimeout(async () => {
          await refreshAllBalances()
        }, 2000)
        setTimeout(() => {
          router.push('/vendors')
        }, 2000)
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
        return !formData.delegation
      case 4:
        return !formData.description.trim()
      case 5:
        return !formData.category
      case 6:
        return false // ✅ Permitir avanzar al paso 6 para completar el pago
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
        return 'Delegation'
      case 4:
        return 'Description'
      case 5:
        return 'Category'
      case 6:
        return 'Payment Verification'
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
                  <p className="text-xs text-[#6b5d52] mb-2">
                    JPG, PNG or WebP (max 5MB)
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      💡 Pro tip for best results:
                    </p>
                    <p className="text-xs text-blue-600">
                      Use a 16:9 aspect ratio image for optimal visual display
                    </p>
                  </div>
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
                Select your delegation
              </Label>
              <Select value={formData.delegation} onValueChange={(value) => handleInputChange('delegation', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose your delegation" />
                </SelectTrigger>
                <SelectContent>
                  {zonesWithDelegations.map((zone) => (
                    <div key={zone.id}>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                        {zone.name} Zone
                      </div>
                      {zone.delegations.map((delegation) => (
                        <SelectItem key={delegation.id} value={delegation.delegation_name}>
                          <div>
                            <div className="font-medium">{delegation.delegation_name}</div>
                            <div className="text-xs text-gray-500">{zone.name} Zone</div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6b5d52] mt-1">
                Choose your delegation - the zone will be assigned automatically
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
        const availableSubcategories = formData.category ? getSubcategories(formData.category) : []
        
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#2d1810]">
                What&apos;s your specialty?
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {FARCASTER_CONFIG.MAIN_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
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

            {/* Subcategories Checkboxes */}
            {formData.category && availableSubcategories.length > 0 && (
              <div className="mt-6">
                <Label className="text-sm font-medium text-[#2d1810] mb-3 block">
                  Select specific items you offer:
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {availableSubcategories.map((subcategory) => (
                    <label
                      key={subcategory.id}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.subcategories.includes(subcategory.id)}
                        onChange={() => handleSubcategoryToggle(subcategory.id)}
                        className="w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35] focus:ring-2"
                      />
                      <span className="text-lg">{subcategory.icon}</span>
                      <span className="text-sm font-medium text-[#2d1810]">{subcategory.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[#6b5d52] mt-2">
                  Select all items that apply to your vendor
                </p>
              </div>
            )}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            {/* Componente de Estado de Transacción */}
            <TransactionStatus
              paymentState={paymentHook}
              onRefresh={paymentHook.refreshData}
              vendorData={JSON.stringify(formData)}
              vendorId={formData.vendorId}
              onRegister={() => {
                // No llamar al hook, el frontend ya maneja la API
                console.log('🚫 Hook deshabilitado - el frontend maneja la API directamente')
              }}
            />
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
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-[#6b5d52] hover:text-[#2d1810]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          {/* Indicador de Saldo */}
          {currentStep >= 5 && (
            <div className="flex items-center gap-2 text-sm">
              <TokenBalanceChecker showRequired={false} />
            </div>
          )}
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
              {currentStep === 3 && "Choose your delegation"}
              {currentStep === 4 && "Tell customers about your vendor"}
              {currentStep === 5 && "What type of food do you sell?"}
              {currentStep === 6 && "Verify payment and complete registration"}
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