'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Wallet, AlertCircle } from 'lucide-react'
import { PaymentDashboard } from '@/components/vendor-registration/PaymentDashboard'
import { useRouter } from 'next/navigation'

export default function PaymentDashboardPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular tiempo de carga para mejor UX
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fef7f0] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#2d1810]">Cargando dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fef7f0] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-[#6b5d52] hover:text-[#2d1810]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#2d1810]">Dashboard de Pagos</h1>
            <p className="text-[#6b5d52] mt-2">
              Estadísticas y análisis del sistema de registro de vendors
            </p>
          </div>

          <div className="w-20"></div> {/* Spacer para centrar el título */}
        </div>

        {/* Wallet Connection Status */}
        {!isConnected ? (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <Wallet className="w-5 h-5 mr-2" />
                Wallet no conectada
              </CardTitle>
              <CardDescription className="text-orange-700">
                Conecta tu wallet para ver estadísticas personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  Las estadísticas generales están disponibles, pero para ver tu historial personal 
                  y límites de registro, necesitas conectar tu wallet.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Wallet className="w-5 h-5 mr-2" />
                Wallet conectada
              </CardTitle>
              <CardDescription className="text-green-700">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                Puedes ver estadísticas generales del sistema y tu historial personal de registros.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payment Dashboard */}
        <PaymentDashboard userAddress={address} />

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#2d1810]">¿Cómo Funciona?</CardTitle>
              <CardDescription>
                Proceso de registro y pago para vendors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2d1810]">Conecta tu Wallet</h4>
                    <p className="text-sm text-[#6b5d52]">
                      Conecta tu wallet compatible con Base Sepolia
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2d1810]">Verifica tu Saldo</h4>
                    <p className="text-sm text-[#6b5d52]">
                      Asegúrate de tener al menos 50 $BATTLE tokens
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2d1810]">Completa el Formulario</h4>
                    <p className="text-sm text-[#6b5d52]">
                      Llena la información de tu vendor
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2d1810]">Aprueba y Registra</h4>
                    <p className="text-sm text-[#6b5d52]">
                      Aprueba el gasto y confirma el registro en blockchain
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#2d1810]">Límites del Sistema</CardTitle>
              <CardDescription>
                Restricciones para mantener la calidad del servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800">Límite Diario</h4>
                  <p className="text-sm text-blue-700">
                    Máximo 3 vendors por usuario por día
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800">Límite Semanal</h4>
                  <p className="text-sm text-green-700">
                    Máximo 10 vendors por usuario por semana
                  </p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800">Período de Cooldown</h4>
                  <p className="text-sm text-orange-700">
                    1 hora de espera entre registros
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800">Costo por Registro</h4>
                  <p className="text-sm text-purple-700">
                    50 $BATTLE tokens por vendor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="border-[#ff6b35] bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold text-[#2d1810] mb-4">
                ¿Listo para registrar tu vendor?
              </h3>
              <p className="text-[#6b5d52] mb-6 max-w-2xl mx-auto">
                Únete a la comunidad de vendors y comienza a ofrecer tus servicios. 
                El proceso es simple, seguro y transparente gracias a la tecnología blockchain.
              </p>
              <Button
                onClick={() => router.push('/vendors/register')}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-3 text-lg"
              >
                Registrar Vendor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
