'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useContractRead, useContractWrite } from 'wagmi'
import { parseEther, formatEther } from 'viem'

// ABI simplificado para el token BATTLE
const BATTLE_TOKEN_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
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
  allowance: string
}

export function useVendorRegistrationPayment() {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isConnected: false,
    hasSufficientBalance: false,
    isApproved: false,
    isTransactionPending: false,
    isTransactionConfirmed: false,
    error: null,
    balance: '0',
    requiredAmount: '50',
    allowance: '0'
  })

  const { address, isConnected } = useAccount()

  // Leer balance del token
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: BATTLE_TOKEN_ADDRESS as `0x${string}`,
  })

  // Leer allowance (aprobación) del token
  const { data: allowanceData, refetch: refetchAllowance } = useContractRead({
    address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
    abi: BATTLE_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, VENDOR_REGISTRATION_ADDRESS as `0x${string}`] : undefined,
  })

  // Leer costo de registro
  const { data: registrationCost } = useContractRead({
    address: VENDOR_REGISTRATION_ADDRESS as `0x${string}`,
    abi: VENDOR_REGISTRATION_ABI,
    functionName: 'getVendorRegistrationCost',
  })

  // Estado manual para transacciones
  const [isApprovalPending, setIsApprovalPending] = useState(false)
  const [isRegistrationPending, setIsRegistrationPending] = useState(false)

  // Funciones para aprobar y registrar (simuladas por ahora)
  const approveTokens = async () => {
    console.log('🔄 Aprobando tokens...')
    setIsApprovalPending(true)
    // TODO: Implementar aprobación real cuando esté disponible
    setTimeout(() => {
      setIsApprovalPending(false)
      setPaymentState(prev => ({ ...prev, isApproved: true, error: null }))
    }, 2000)
  }

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
    if (!address || !isConnected) {
      setPaymentState(prev => ({
        ...prev,
        isConnected: false,
        hasSufficientBalance: false,
        isApproved: false
      }))
      return
    }

    const balance = balanceData ? Number(formatEther(balanceData.value)) : 0
    const allowance = allowanceData ? Number(formatEther(allowanceData)) : 0
    const hasSufficientBalance = balance >= 50
    const isApproved = allowance >= 50

    setPaymentState(prev => ({
      ...prev,
      isConnected: true,
      hasSufficientBalance,
      isApproved,
      balance: balance.toFixed(2),
      allowance: allowance.toFixed(2),
      isTransactionPending: isApprovalPending || isApprovalPending || isRegistrationPending
    }))
  }, [address, isConnected, balanceData, allowanceData, isApprovalPending, isRegistrationPending])

  // Función para aprobar tokens
  const approveTokensForRegistration = useCallback(() => {
    if (!address) return

    try {
      approveTokens()
      setPaymentState(prev => ({ ...prev, error: null }))
    } catch (error) {
      setPaymentState(prev => ({ 
        ...prev, 
        error: `Error al aprobar: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      }))
    }
  }, [address, approveTokens])

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
    await Promise.all([
      refetchBalance(),
      refetchAllowance()
    ])
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
    approveTokensForRegistration,
    registerVendorWithPayment,
    refreshData,
    resetPaymentState,
    isApproving: isApprovalPending,
    isRegistering: isRegistrationPending
  }
}
