'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Coins,
  FileText
} from 'lucide-react'
import { PaymentState } from '@/hooks/useVendorRegistrationPayment'

interface TransactionStatusProps {
  paymentState: PaymentState
  onRefresh: () => void
  vendorData?: string
  vendorId?: string
  onRegister?: () => void
}

const STEPS = [
  { id: 'connect', label: 'Conectar Wallet', description: 'Conectar wallet y verificar saldo' },
  { id: 'register', label: 'Registrar Vendor', description: 'Confirmar registro y quemar tokens' },
  { id: 'complete', label: 'Completado', description: 'Vendor registrado exitosamente' }
]

export function TransactionStatus({
  paymentState,
  onRefresh,
  vendorData,
  vendorId,
  onRegister
}: TransactionStatusProps) {
  const {
    isConnected,
    hasSufficientBalance,
    isApproved,
    isTransactionPending,
    isTransactionConfirmed,
    error,
    balance
  } = paymentState

  // Determinar el paso actual
  const getCurrentStep = () => {
    if (!isConnected) return 0
    if (!hasSufficientBalance) return 0
    if (!isTransactionConfirmed) return 1
    return 2
  }

  const currentStep = getCurrentStep()
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'pending'
  }

  const getStepIcon = (stepIndex: number, status: string) => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />
    if (status === 'current') return <Clock className="h-5 w-5 text-blue-500" />
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
  }

  const getStepColor = (status: string) => {
    if (status === 'completed') return 'text-green-600'
    if (status === 'current') return 'text-blue-600'
    return 'text-muted-foreground'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Estado de la Transacción
        </CardTitle>
        <CardDescription>
          Progreso del registro de vendor con pago de tokens
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Barra de Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Pasos del Proceso */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index)
            const icon = getStepIcon(index, status)
            const color = getStepColor(status)
            
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${color}`}>
                    {step.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {step.description}
                  </div>
                  
                  {/* Información adicional para pasos específicos */}
                  {step.id === 'connect' && isConnected && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Saldo actual:</span>{' '}
                        <Badge variant={hasSufficientBalance ? "default" : "destructive"}>
                          {balance} $BATTLE
                        </Badge>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Requerido:</span>{' '}
                        <Badge variant="outline">
                          50 $BATTLE
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          {/* Botón de Registro */}
          {currentStep === 1 && isConnected && hasSufficientBalance && vendorData && vendorId && onRegister && (
            <Button 
              onClick={onRegister} 
              disabled={isTransactionPending}
              className="w-full"
            >
              {isTransactionPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Registrar Vendor (50 $BATTLE)
                </>
              )}
            </Button>
          )}

          {/* Botón de Refrescar */}
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isTransactionPending}
            className="w-full"
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Actualizar Estado
          </Button>
        </div>

        {/* Estado de Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Estado de Éxito */}
        {isTransactionConfirmed && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Vendor registrado exitosamente! Los tokens han sido quemados y el vendor está activo.
            </AlertDescription>
          </Alert>
        )}

        {/* Información de la Transacción */}
        {isTransactionConfirmed && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Transacción Completada</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• 50 $BATTLE tokens quemados</div>
              <div>• Vendor registrado en blockchain</div>
              <div>• Datos guardados en base de datos</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
