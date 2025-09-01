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
    isApproved: true, // Siempre true porque no necesitamos allowance para burnFrom
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

  // Estado manual para transacciones
  const [isRegistrationPending, setIsRegistrationPending] = useState(false)

  const registerVendor = async () => {
    console.log('🔄 Registrando vendor...')
    setIsRegistrationPending(true)
    // TODO: Implementar registro real cuando esté disponible
    setTimeout(() => {
      setIsRegistrationPending(false)
      setPaymentState(prev => ({ 
        ...prev, 
        isTransactionConfirmed: true, 
        error: null,
        isTransactionPending: false 
      }))
    }, 2000)
  }

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

      setPaymentState(prev => ({
        ...prev,
        isConnected: true,
        hasSufficientBalance,
        balance: balance.toFixed(2),
        isTransactionPending: isRegistrationPending
      }))
    }
  }, [address, isConnected, balanceData, isRegistrationPending])

  // Función para registrar vendor
  const registerVendorWithPayment = useCallback((
    vendorData: string, 
    vendorId: string
  ) => {
    if (!address || !paymentState.isApproved) return

    try {
      registerVendor()
      setPaymentState(prev => ({ 
        ...prev, 
        error: null,
        isTransactionPending: true 
      }))
    } catch (error) {
      setPaymentState(prev => ({ 
        ...prev, 
        error: `Error al registrar: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      }))
    }
  }, [address, paymentState.isApproved, registerVendor])

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    await refetchBalance()
  }, [refetchBalance])

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
