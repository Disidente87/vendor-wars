import { VendorRegistrationData, PaymentConfirmation, VendorRegistrationResponse } from '@/types/vendorPayment'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export class VendorPaymentService {
  private static instance: VendorPaymentService

  private constructor() {}

  public static getInstance(): VendorPaymentService {
    if (!VendorPaymentService.instance) {
      VendorPaymentService.instance = new VendorPaymentService()
    }
    return VendorPaymentService.instance
  }

  /**
   * Verifica si un usuario puede registrar un vendor
   * @param userAddress Dirección de la wallet del usuario
   * @returns Promise<boolean>
   */
  async canUserRegisterVendor(userAddress: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/can-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.canRegister
    } catch (error) {
      console.error('Error verificando si usuario puede registrar vendor:', error)
      return false
    }
  }

  /**
   * Registra un vendor con verificación de pago
   * @param vendorData Datos del vendor
   * @param transactionHash Hash de la transacción de pago
   * @returns Promise<PaymentConfirmation>
   */
  async registerVendorWithPayment(
    vendorData: VendorRegistrationData,
    transactionHash: string
  ): Promise<PaymentConfirmation> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...vendorData,
          transactionHash,
          paymentStatus: 'pending'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: VendorRegistrationResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Error en el registro del vendor')
      }

      return {
        success: true,
        transactionHash,
        vendorId: data.data?.id || vendorData.vendorId,
        tokensBurned: vendorData.paymentAmount,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Error registrando vendor con pago:', error)
      return {
        success: false,
        transactionHash,
        vendorId: vendorData.vendorId,
        tokensBurned: '0',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }

  /**
   * Verifica el estado de una transacción en blockchain
   * @param transactionHash Hash de la transacción
   * @returns Promise<boolean>
   */
  async verifyTransactionOnChain(transactionHash: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/blockchain/verify-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionHash }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.isValid
    } catch (error) {
      console.error('Error verificando transacción en blockchain:', error)
      return false
    }
  }

  /**
   * Confirma el pago de un vendor
   * @param vendorId ID del vendor
   * @param transactionHash Hash de la transacción
   * @returns Promise<boolean>
   */
  async confirmVendorPayment(vendorId: string, transactionHash: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionHash }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error confirmando pago del vendor:', error)
      return false
    }
  }

  /**
   * Obtiene el historial de pagos de un usuario
   * @param userAddress Dirección de la wallet del usuario
   * @returns Promise<PaymentConfirmation[]>
   */
  async getUserPaymentHistory(userAddress: string): Promise<PaymentConfirmation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/payment-history/${userAddress}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.payments || []
    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error)
      return []
    }
  }

  /**
   * Obtiene estadísticas de pagos del sistema
   * @returns Promise<{totalVendors: number, totalTokensBurned: string}>
   */
  async getPaymentStats(): Promise<{ totalVendors: number; totalTokensBurned: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/payment-stats`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        totalVendors: data.totalVendors || 0,
        totalTokensBurned: data.totalTokensBurned || '0',
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos:', error)
      return {
        totalVendors: 0,
        totalTokensBurned: '0',
      }
    }
  }

  /**
   * Valida los datos del vendor antes del registro
   * @param vendorData Datos del vendor
   * @returns Promise<{isValid: boolean, errors: string[]}>
   */
  async validateVendorData(vendorData: VendorRegistrationData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Validaciones básicas
    if (!vendorData.name || vendorData.name.trim().length < 2) {
      errors.push('El nombre del vendor debe tener al menos 2 caracteres')
    }

    if (!vendorData.description || vendorData.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres')
    }

    if (!vendorData.delegation) {
      errors.push('Debe seleccionar una delegación')
    }

    if (!vendorData.category) {
      errors.push('Debe seleccionar una categoría')
    }

    if (!vendorData.imageUrl) {
      errors.push('Debe subir una imagen del vendor')
    }

    if (!vendorData.userAddress || !vendorData.userAddress.startsWith('0x')) {
      errors.push('Dirección de wallet inválida')
    }

    if (vendorData.paymentAmount !== '50') {
      errors.push('El monto de pago debe ser exactamente 50 $BATTLE')
    }

    if (!vendorData.vendorId) {
      errors.push('ID del vendor es requerido')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Genera un ID único para el vendor
   * @returns string
   */
  generateVendorId(): string {
    const timestamp = Date.now()
    const random1 = Math.random().toString(36).substring(2, 8)
    const random2 = Math.random().toString(36).substring(2, 8)
    
    // Usar crypto del navegador si está disponible, sino generar un fallback
    let uuid = ''
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      uuid = window.crypto.randomUUID()
    } else {
      // Fallback para entornos sin crypto.randomUUID
      uuid = `${timestamp}_${random1}_${random2}_${Math.random().toString(36).substring(2, 8)}`
    }
    
    return `vendor_${timestamp}_${random1}_${random2}_${uuid.slice(-8)}`
  }

  /**
   * Formatea el monto de tokens para mostrar
   * @param amount Cantidad en wei
   * @param decimals Decimales del token (por defecto 18)
   * @returns string
   */
  formatTokenAmount(amount: string, decimals: number = 18): string {
    try {
      const numericAmount = parseFloat(amount) / Math.pow(10, decimals)
      return numericAmount.toFixed(2)
    } catch (error) {
      return '0.00'
    }
  }

  /**
   * Convierte monto de tokens a wei
   * @param amount Cantidad en tokens
   * @param decimals Decimales del token (por defecto 18)
   * @returns string
   */
  parseTokenAmount(amount: string, decimals: number = 18): string {
    try {
      const numericAmount = parseFloat(amount) * Math.pow(10, decimals)
      return numericAmount.toString()
    } catch (error) {
      return '0'
    }
  }
}

// Exportar instancia singleton
export const vendorPaymentService = VendorPaymentService.getInstance()
