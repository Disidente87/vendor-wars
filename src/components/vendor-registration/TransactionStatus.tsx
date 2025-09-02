'use client'

import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  Shield
} from 'lucide-react'
import { PaymentState } from '@/hooks/useVendorRegistrationPayment'
import { useBattleTokenApprove } from '@/hooks/useBattleToken'
import { useAccount } from 'wagmi'

// Constantes del contrato
const VENDOR_REGISTRATION_ADDRESS = process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS || '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a'

interface TransactionStatusProps {
  paymentState: PaymentState
  onRefresh: () => void
  vendorData?: string
  vendorId?: string
  onRegister?: () => void
}

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

  // Hook para aprobar tokens
  const { 
    approve, 
    isPending: isApprovalPending, 
    isSuccess: isApprovalSuccess,
    error: approvalError 
  } = useBattleTokenApprove()

  // Función para aprobar tokens
  const handleApprove = async () => {
    if (!address) return
    
    try {
      await approve(
        VENDOR_REGISTRATION_ADDRESS,
        '50' // 50 BATTLE tokens
      )
    } catch (err) {
      console.error('Error al aprobar tokens:', err)
    }
  }

  const { address } = useAccount()
  const isApprovedNow = isApproved || isApprovalSuccess

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Botón de aprobación: deshabilitar tras aprobar y mostrar mensaje */}
      {isConnected && hasSufficientBalance && (
        <>
          <Button 
            onClick={handleApprove} 
            disabled={isApprovalPending || isApprovedNow}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isApprovalPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aprobando...
              </>
            ) : isApprovedNow ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Successful Payment
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Pay Tokens (50 $BATTLE)
              </>
            )}
          </Button>

          {isApprovedNow && (
            <div className="mt-2 text-sm text-green-700">
              ✅ Aprobación exitosa. Ya puedes continuar con el registro.
            </div>
          )}
        </>
      )}
    </div>
  )
}
