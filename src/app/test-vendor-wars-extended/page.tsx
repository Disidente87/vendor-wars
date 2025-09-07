'use client'

import { useState } from 'react'
import { VendorWarsExtendedReviewForm } from '@/components/VendorWarsExtendedReviewForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, ExternalLink, Coins } from 'lucide-react'

export default function TestVendorWarsExtendedPage() {
  const [vendorId, setVendorId] = useState('da84f637-28be-4d52-902b-a5df6bd949db')
  const [userFid, setUserFid] = useState(465823)
  const [submittedReviews, setSubmittedReviews] = useState<string[]>([])

  const handleReviewSubmitted = (reviewId: string) => {
    setSubmittedReviews(prev => [...prev, reviewId])
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">VendorWars Extended - Test Page</h1>
        <p className="text-xl text-muted-foreground">
          Prueba el nuevo sistema de reviews con VendorWarsExtended
        </p>
      </div>

      {/* Información del contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Información del Contrato
          </CardTitle>
          <CardDescription>
            Detalles del contrato VendorWarsExtended deployado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Dirección del Contrato</Label>
              <p className="text-sm text-muted-foreground font-mono">
                0x71a602d04f1aFe473C7557e72e6d6C26cBa2fA75
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Red</Label>
              <p className="text-sm text-muted-foreground">Base Sepolia (84532)</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Costo de Review</Label>
              <p className="text-sm text-muted-foreground">15 BATTLE tokens</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">20 operaciones/día, 100/semana</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://sepolia.basescan.org/address/0x71a602d04f1aFe473C7557e72e6d6C26cBa2fA75', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver en Basescan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de prueba */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Prueba</CardTitle>
          <CardDescription>
            Configura los parámetros para probar el sistema de reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorId">Vendor ID</Label>
              <Input
                id="vendorId"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="test-vendor-123"
              />
            </div>
            <div>
              <Label htmlFor="userFid">User FID</Label>
              <Input
                id="userFid"
                type="number"
                value={userFid}
                onChange={(e) => setUserFid(Number(e.target.value))}
                placeholder="12345"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Review */}
      <VendorWarsExtendedReviewForm
        vendorId={vendorId}
        userFid={userFid}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Reviews Submitidos */}
      {submittedReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Reviews Submitidos
            </CardTitle>
            <CardDescription>
              Lista de reviews enviados exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {submittedReviews.map((reviewId, index) => (
                <Alert key={index} className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Review ID:</strong> {reviewId}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
          <CardDescription>
            Cómo usar el sistema de reviews VendorWarsExtended
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Conectar Wallet</h4>
            <p className="text-sm text-muted-foreground">
              Asegúrate de tener tu wallet conectada a Base Sepolia
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. Obtener BATTLE Tokens</h4>
            <p className="text-sm text-muted-foreground">
              Necesitas al menos 15 BATTLE tokens para submitir un review
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. Aprobar Tokens</h4>
            <p className="text-sm text-muted-foreground">
              Aprueba el gasto de 15 BATTLE tokens al contrato VendorWarsExtended
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">4. Submitir Review</h4>
            <p className="text-sm text-muted-foreground">
              Escribe tu review y envíalo. Los tokens serán quemados automáticamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
