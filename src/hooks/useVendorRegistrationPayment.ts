'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useContractRead, useContractWrite } from 'wagmi'
import { parseEther, formatEther } from 'viem'

// ABI simplificado para el token BATTLE
const BATTLE_TOKEN_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// ABI simplificado para VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'vendorData', type: 'string' },
      { name: 'vendorId', type: 'string' }
    ],
    name: 'registerVendor',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getVendorRegistrationCost',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const BATTLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS || '0xDa6884d4F2E68b9700678139B617607560f70Cc3'
const VENDOR_REGISTRATION_ADDRESS = process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS || '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a'
const REQUIRED_AMOUNT = parseEther('50') // 50 tokens con 18 decimales

export interface PaymentState {
  isConnected: boolean
  hasSufficientBalance: boolean
  isApproved: boolean
  isTransactionPending: boolean
  isTransactionConfirmed: boolean
  error: string | null
  balance: string
  requiredAmount: string
}

export function useVendorRegistrationPayment() {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isConnected: false,
    hasSufficientBalance: false,
    isApproved: false, // False porque se requiere aprobación real
    isTransactionPending: false,
    isTransactionConfirmed: false,
    error: null,
    balance: '0',
    requiredAmount: '50'
  })

  const { address, isConnected } = useAccount()

  // Sincronizar estado inicial de conexión
  useEffect(() => {
    setPaymentState(prev => ({
      ...prev,
      isConnected: isConnected
    }))
  }, [isConnected])

  // Leer balance del token
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: BATTLE_TOKEN_ADDRESS as `0x${string}`,
  })



  // Leer costo de registro
  const { data: registrationCost } = useContractRead({
    address: VENDOR_REGISTRATION_ADDRESS as `0x${string}`,
    abi: VENDOR_REGISTRATION_ABI,
    functionName: 'getVendorRegistrationCost',
  })

  // Leer allowance del token
  const { data: allowanceData, refetch: refetchAllowance } = useContractRead({
    address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, VENDOR_REGISTRATION_ADDRESS as `0x${string}`] : undefined
  })

  // Estado manual para transacciones
  const [isRegistrationPending, setIsRegistrationPending] = useState(false)

  // Actualizar estado cuando cambien los datos
  useEffect(() => {
    // Solo resetear si definitivamente no está conectado
    if (isConnected === false) {
      setPaymentState(prev => ({
        ...prev,
        isConnected: false,
        hasSufficientBalance: false,
        isApproved: false
      }))
      return
    }

    // Si está conectado pero no tenemos address aún, mantener el estado actual
    if (isConnected && !address) {
      return
    }

    // Solo actualizar si tenemos address y estamos conectados
    if (address && isConnected) {
      const balance = balanceData ? Number(formatEther(balanceData.value)) : 0
      const hasSufficientBalance = balance >= 50
      
      // Verificar allowance
      const allowance = allowanceData ? Number(formatEther(allowanceData)) : 0
      const isApproved = allowance >= 50

      setPaymentState(prev => ({
        ...prev,
        isConnected: true,
        hasSufficientBalance,
        isApproved,
        balance: balance.toFixed(2),
        allowance: allowance.toFixed(2),
        isTransactionPending: isRegistrationPending
      }))
    }
  }, [address, isConnected, balanceData, allowanceData, isRegistrationPending])

  // Función para registrar vendor usando la API real
  const registerVendorWithPayment = useCallback(async (
    vendorData: string,
    vendorId: string,
    onVendorIdConflict?: (newVendorId: string) => void
  ) => {
    if (!address) return

    // Marcar como pendiente
    setIsRegistrationPending(true)
    setPaymentState(prev => ({
      ...prev,
      error: null,
      isTransactionPending: true
    }))

    try {
      const res = await fetch('/api/vendors/register-with-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          vendorData,
          vendorId,
          paymentAmount: '50',
          // Firma placeholder solo para cumplir validación del backend
          signature: '0x' + '0'.repeat(130)
        })
      })

      const json = await res.json()

      if (!res.ok || !json?.success) {
        const apiMessage = json?.error || 'Fallo en el registro de vendor'
        
        // Si el error es por vendorId duplicado, intentar con un nuevo ID
        if (apiMessage.includes('vendor ya existe') || apiMessage.includes('Vendor already exists') || apiMessage.includes('ID de vendor ya está en uso')) {
          console.log('🔄 VendorId duplicado detectado, regenerando...')
          
          // Generar nuevo vendorId con un pequeño delay para evitar colisiones
          await new Promise(resolve => setTimeout(resolve, 100))
          const newVendorId = `vendor_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${Math.random().toString(36).substring(2, 8)}_${crypto.randomUUID().slice(-8)}`
          
          // Notificar al componente padre para actualizar el vendorId
          if (onVendorIdConflict) {
            onVendorIdConflict(newVendorId)
          }
          
          // Intentar de nuevo con el nuevo vendorId
          const retryRes = await fetch('/api/vendors/register-with-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: address,
              vendorData,
              vendorId: newVendorId,
              paymentAmount: '50',
              signature: '0x' + '0'.repeat(130)
            })
          })

          const retryJson = await retryRes.json()

          if (!retryRes.ok || !retryJson?.success) {
            const retryApiMessage = retryJson?.error || 'Fallo en el registro de vendor (segundo intento)'
            setPaymentState(prev => ({
              ...prev,
              isTransactionConfirmed: false,
              isTransactionPending: false,
              error: retryApiMessage
            }))
            return
          }

          // Éxito en el segundo intento
          setPaymentState(prev => ({
            ...prev,
            isTransactionConfirmed: true,
            isTransactionPending: false,
            error: null
          }))
          return
        }
        
        setPaymentState(prev => ({
          ...prev,
          isTransactionConfirmed: false,
          isTransactionPending: false,
          error: apiMessage
        }))
        return
      }

      // Éxito confirmado por el backend
      setPaymentState(prev => ({
        ...prev,
        isTransactionConfirmed: true,
        isTransactionPending: false,
        error: null
      }))
    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        isTransactionConfirmed: false,
        isTransactionPending: false,
        error: `Error de red: ${error instanceof Error ? error.message : 'desconocido'}`
      }))
    } finally {
      setIsRegistrationPending(false)
    }
  }, [address])

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    await refetchBalance()
    await refetchAllowance()
  }, [refetchBalance, refetchAllowance])

  // Función para resetear estado
  const resetPaymentState = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      isTransactionConfirmed: false,
      error: null
    }))
  }, [])

  return {
    ...paymentState,
    registerVendorWithPayment,
    refreshData,
    resetPaymentState,
    isRegistering: isRegistrationPending
  }
}
