'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  TestTube,
  Wallet,
  Coins,
  Database,
  Globe,
  Shield
} from 'lucide-react'
import { PAYMENT_CONFIG, validateVendorData, formatTokenAmount, parseTokenAmount, isNetworkSupported } from '@/config/payment'
import { useVendorRegistrationPayment } from '@/hooks/useVendorRegistrationPayment'
import { TokenBalanceChecker } from './TokenBalanceChecker'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  timestamp: Date
}

export function PaymentSystemTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testVendorData, setTestVendorData] = useState({
    name: 'Test Vendor',
    description: 'Vendor de prueba para testing del sistema',
    delegation: 'Centro',
    category: 'mexican',
    imageUrl: 'https://example.com/test.jpg'
  })

  const paymentHook = useVendorRegistrationPayment()

  const addTestResult = (name: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      name,
      status,
      message,
      timestamp: new Date()
    }])
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    try {
      // Test 1: Configuración del Sistema
      addTestResult('Configuración del Sistema', 'pending', 'Verificando configuración...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const configValid = PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS && 
                         PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS &&
                         PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT > 0
      
      addTestResult('Configuración del Sistema', 
        configValid ? 'success' : 'error',
        configValid ? 'Configuración válida' : 'Configuración inválida'
      )

      // Test 2: Validación de Datos
      addTestResult('Validación de Datos', 'pending', 'Probando validaciones...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const validationResult = validateVendorData(testVendorData)
      addTestResult('Validación de Datos',
        validationResult.isValid ? 'success' : 'error',
        validationResult.isValid ? 'Datos válidos' : `Errores: ${validationResult.errors.join(', ')}`
      )

      // Test 3: Funciones de Utilidad
      addTestResult('Funciones de Utilidad', 'pending', 'Probando funciones...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        const formattedAmount = formatTokenAmount('50000000000000000000')
        const parsedAmount = parseTokenAmount('50')
        const networkSupported = isNetworkSupported(84532)
        
        addTestResult('Funciones de Utilidad', 'success', 
          `Format: ${formattedAmount}, Parse: ${parsedAmount}, Network: ${networkSupported}`
        )
      } catch (error) {
        addTestResult('Funciones de Utilidad', 'error', 'Error en funciones de utilidad')
      }

      // Test 4: Estado del Hook de Pago
      addTestResult('Hook de Pago', 'pending', 'Verificando hook...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const hookValid = paymentHook && 
                       typeof paymentHook.isConnected === 'boolean' &&
                       typeof paymentHook.hasSufficientBalance === 'boolean'
      
      addTestResult('Hook de Pago',
        hookValid ? 'success' : 'error',
        hookValid ? 'Hook funcionando correctamente' : 'Error en hook'
      )

      // Test 5: APIs del Backend
      addTestResult('APIs del Backend', 'pending', 'Verificando endpoints...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const endpointsValid = Object.values(PAYMENT_CONFIG.API_ENDPOINTS).every(endpoint => 
        endpoint && endpoint.startsWith('/')
      )
      
      addTestResult('APIs del Backend',
        endpointsValid ? 'success' : 'error',
        endpointsValid ? 'Endpoints válidos' : 'Endpoints inválidos'
      )

      // Test 6: Rate Limiting
      addTestResult('Rate Limiting', 'pending', 'Verificando límites...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const rateLimitsValid = PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_DAY > 0 &&
                             PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_WEEK > 0 &&
                             PAYMENT_CONFIG.RATE_LIMITS.COOLDOWN_PERIOD > 0
      
      addTestResult('Rate Limiting',
        rateLimitsValid ? 'success' : 'error',
        rateLimitsValid ? 'Límites configurados correctamente' : 'Límites inválidos'
      )

      // Test 7: Mensajes del Sistema
      addTestResult('Mensajes del Sistema', 'pending', 'Verificando mensajes...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const messagesValid = Object.keys(PAYMENT_CONFIG.ERROR_MESSAGES).length > 0 &&
                           Object.keys(PAYMENT_CONFIG.SUCCESS_MESSAGES).length > 0
      
      addTestResult('Mensajes del Sistema',
        messagesValid ? 'success' : 'error',
        messagesValid ? 'Mensajes configurados' : 'Mensajes faltantes'
      )

      // Test 8: Configuración de Transacciones
      addTestResult('Configuración de Transacciones', 'pending', 'Verificando transacciones...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const transactionConfigValid = PAYMENT_CONFIG.TRANSACTION.GAS_LIMIT &&
                                   PAYMENT_CONFIG.TRANSACTION.CONFIRMATIONS > 0
      
      addTestResult('Configuración de Transacciones',
        transactionConfigValid ? 'success' : 'error',
        transactionConfigValid ? 'Configuración válida' : 'Configuración inválida'
      )

    } catch (error) {
      addTestResult('Tests Generales', 'error', 'Error ejecutando tests')
    } finally {
      setIsRunningTests(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Éxito</Badge>
      case 'error':
        return <Badge variant="destructive">❌ Error</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">⏳ Pendiente</Badge>
      default:
        return <Badge variant="outline">❓ Desconocido</Badge>
    }
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#2d1810] flex items-center justify-center gap-2">
          <TestTube className="w-8 h-8 text-[#ff6b35]" />
          Tester del Sistema de Pagos
        </h2>
        <p className="text-[#6b5d52] mt-2">
          Verifica todas las funcionalidades del sistema de pagos
        </p>
      </div>

      {/* Configuración del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ff6b35]" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>
            Información de configuración actual del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[#6b5d52]">Token:</span>
              <span className="font-medium">{PAYMENT_CONFIG.BATTLE_TOKEN.SYMBOL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#6b5d52]">Cantidad Requerida:</span>
              <span className="font-medium">{PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT} {PAYMENT_CONFIG.BATTLE_TOKEN.SYMBOL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#6b5d52]">Red:</span>
              <span className="font-medium">{PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.NAME}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[#6b5d52]">Límite Diario:</span>
              <span className="font-medium">{PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_DAY}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#6b5d52]">Límite Semanal:</span>
              <span className="font-medium">{PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_WEEK}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#6b5d52]">Cooldown:</span>
              <span className="font-medium">{Math.floor(PAYMENT_CONFIG.RATE_LIMITS.COOLDOWN_PERIOD / 60000)} min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos de Prueba */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#ff6b35]" />
            Datos de Prueba
          </CardTitle>
          <CardDescription>
            Configura los datos del vendor para las pruebas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testName">Nombre del Vendor</Label>
              <Input
                id="testName"
                value={testVendorData.name}
                onChange={(e) => setTestVendorData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del vendor"
              />
            </div>
            <div>
              <Label htmlFor="testDelegation">Delegación</Label>
              <Select
                value={testVendorData.delegation}
                onValueChange={(value) => setTestVendorData(prev => ({ ...prev, delegation: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar delegación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Centro">Centro</SelectItem>
                  <SelectItem value="Norte">Norte</SelectItem>
                  <SelectItem value="Sur">Sur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="testDescription">Descripción</Label>
            <Textarea
              id="testDescription"
              value={testVendorData.description}
              onChange={(e) => setTestVendorData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del vendor"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#ff6b35]" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>
            Estado actual del sistema de pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Balance Checker */}
          <div>
            <Label>Saldo de $BATTLE</Label>
            <TokenBalanceChecker showRequired={true} />
          </div>

          {/* Estado del Hook */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-[#6b5d52]">Estado de Conexión</div>
              <Badge variant={paymentHook.isConnected ? 'default' : 'secondary'}>
                {paymentHook.isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-[#6b5d52]">Saldo Suficiente</div>
              <Badge variant={paymentHook.hasSufficientBalance ? 'default' : 'destructive'}>
                {paymentHook.hasSufficientBalance ? 'Sí' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Testing */}
      <div className="text-center">
        <Button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-3 text-lg"
        >
          {isRunningTests ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Ejecutando Tests...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Ejecutar Todos los Tests
            </>
          )}
        </Button>
      </div>

      {/* Resultados de los Tests */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-[#ff6b35]" />
                Resultados de los Tests
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  ✅ {successCount}
                </Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  ❌ {errorCount}
                </Badge>
                <Badge variant="outline">
                  📊 {totalTests}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Resultados de la ejecución de tests del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-[#6b5d52]">{result.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}
                    <div className="text-xs text-[#6b5d52]">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            {!isRunningTests && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <h4 className="font-medium text-[#2d1810] mb-2">Resumen de Tests</h4>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{successCount}</div>
                      <div className="text-sm text-[#6b5d52]">Exitosos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                      <div className="text-sm text-[#6b5d52]">Fallidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
                      <div className="text-sm text-[#6b5d52]">Total</div>
                    </div>
                  </div>
                  {errorCount === 0 && successCount > 0 && (
                    <Alert className="mt-4 border-green-200 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ¡Todos los tests pasaron exitosamente! El sistema está funcionando correctamente.
                      </AlertDescription>
                    </Alert>
                  )}
                  {errorCount > 0 && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {errorCount} test(s) fallaron. Revisa los errores para identificar problemas.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
