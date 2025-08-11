#!/usr/bin/env tsx

/**
 * Script de Testing de las APIs del Sistema de Pagos
 * 
 * Este script prueba todas las APIs del backend:
 * - Verificación de pagos
 * - Historial de pagos
 * - Estadísticas de pagos
 * - Registro de vendors
 */

import { PAYMENT_CONFIG } from '@/config/payment'

const BASE_URL = 'http://localhost:3000'

interface ApiTestResult {
  name: string
  endpoint: string
  method: string
  status: 'pending' | 'success' | 'error'
  message: string
  response?: any
  error?: string
}

class ApiTester {
  private results: ApiTestResult[] = []

  async testApi(
    name: string,
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<void> {
    const result: ApiTestResult = {
      name,
      endpoint,
      method,
      status: 'pending',
      message: 'Probando...'
    }

    this.results.push(result)

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (response.ok) {
        const data = await response.json()
        result.status = 'success'
        result.message = `API respondió correctamente (${response.status})`
        result.response = data
      } else {
        result.status = 'error'
        result.message = `API respondió con error (${response.status})`
        result.error = `Status: ${response.status}`
      }
    } catch (error) {
      result.status = 'error'
      result.message = 'Error de conexión'
      result.error = error instanceof Error ? error.message : 'Error desconocido'
    }
  }

  async testPaymentVerification(): Promise<void> {
    console.log('🔍 Probando API de Verificación de Pagos...')
    
    // Test GET - Verificar estado de vendor
    await this.testApi(
      'Verificar Estado de Vendor',
      '/api/vendors/verify-payment?address=0x1234567890123456789012345678901234567890',
      'GET'
    )

    // Test POST - Verificar transacción
    await this.testApi(
      'Verificar Transacción',
      '/api/vendors/verify-payment',
      'POST',
      {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        userAddress: '0x1234567890123456789012345678901234567890'
      }
    )
  }

  async testPaymentHistory(): Promise<void> {
    console.log('📚 Probando API de Historial de Pagos...')
    
    // Test GET - Obtener estadísticas del usuario
    await this.testApi(
      'Obtener Estadísticas de Usuario',
      '/api/vendors/payment-history?address=0x1234567890123456789012345678901234567890',
      'GET'
    )

    // Test POST - Obtener historial filtrado
    await this.testApi(
      'Obtener Historial Filtrado',
      '/api/vendors/payment-history',
      'POST',
      {
        userAddress: '0x1234567890123456789012345678901234567890',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    )
  }

  async testPaymentStats(): Promise<void> {
    console.log('📊 Probando API de Estadísticas de Pagos...')
    
    // Test GET - Estadísticas diarias
    await this.testApi(
      'Estadísticas Diarias',
      '/api/vendors/payment-stats?period=daily',
      'GET'
    )

    // Test GET - Estadísticas semanales
    await this.testApi(
      'Estadísticas Semanales',
      '/api/vendors/payment-stats?period=weekly',
      'GET'
    )

    // Test GET - Estadísticas mensuales
    await this.testApi(
      'Estadísticas Mensuales',
      '/api/vendors/payment-stats?period=monthly',
      'GET'
    )

    // Test GET - Estadísticas totales
    await this.testApi(
      'Estadísticas Totales',
      '/api/vendors/payment-stats?period=all',
      'GET'
    )
  }

  async testVendorRegistration(): Promise<void> {
    console.log('📝 Probando API de Registro de Vendors...')
    
    // Test POST - Registro de vendor (sin imagen para testing)
    await this.testApi(
      'Registro de Vendor',
      '/api/vendors/register',
      'POST',
      {
        name: 'Vendor de Prueba',
        description: 'Vendor para testing del sistema de pagos',
        delegation: 'Centro',
        category: 'mexican',
        imageUrl: 'https://example.com/test.jpg',
        owner_address: '0x1234567890123456789012345678901234567890',
        payment_amount: '50',
        vendorId: 'test-vendor-123'
      }
    )
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando Testing de APIs del Sistema de Pagos...\n')

    try {
      await this.testPaymentVerification()
      await this.testPaymentHistory()
      await this.testPaymentStats()
      await this.testVendorRegistration()
    } catch (error) {
      console.error('❌ Error ejecutando tests:', error)
    }

    this.printResults()
  }

  printResults(): void {
    console.log('\n📋 Resultados de los Tests de APIs\n')
    console.log('='.repeat(80))

    const successCount = this.results.filter(r => r.status === 'success').length
    const errorCount = this.results.filter(r => r.status === 'error').length
    const totalTests = this.results.length

    this.results.forEach((result, index) => {
      const statusIcon = result.status === 'success' ? '✅' : 
                        result.status === 'error' ? '❌' : '⏳'
      const statusText = result.status === 'success' ? 'ÉXITO' :
                        result.status === 'error' ? 'ERROR' : 'PENDIENTE'
      
      console.log(`${index + 1}. ${statusIcon} ${result.name}`)
      console.log(`   Método: ${result.method} ${result.endpoint}`)
      console.log(`   Estado: ${statusText}`)
      console.log(`   Mensaje: ${result.message}`)
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      if (result.response) {
        console.log(`   Respuesta: ${JSON.stringify(result.response, null, 2)}`)
      }
      
      console.log('')
    })

    console.log('='.repeat(80))
    console.log(`📊 Resumen: ${successCount} ✅ | ${errorCount} ❌ | ${totalTests} Total`)
    
    if (errorCount === 0) {
      console.log('🎉 ¡Todas las APIs están funcionando correctamente!')
    } else {
      console.log(`⚠️  ${errorCount} API(s) tienen problemas que necesitan atención.`)
    }
  }

  getResults(): ApiTestResult[] {
    return this.results
  }
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ApiTester()
  tester.runAllTests()
}

export { ApiTester }
