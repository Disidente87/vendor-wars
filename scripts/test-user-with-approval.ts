#!/usr/bin/env tsx

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { simulateContract, readContract } from 'viem/actions'

// Configuración
const VENDOR_REGISTRATION_ADDRESS = '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a'
const BATTLE_TOKEN_ADDRESS = '0xDa6884d4F2E68b9700678139B617607560f70Cc3'
const RPC_URL = 'https://sepolia.base.org'

// Usuario que YA tiene aprobación
const USER_WITH_APPROVAL = '0x5024693cf6de4B5612965a4792041710d5eBC09a'

// ABI para el contrato VendorRegistration
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
  }
] as const

// Cliente Viem
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL)
})

async function testUserWithApproval() {
  console.log('🧪 Probando usuario que YA tiene aprobación...\n')
  console.log('👤 Usuario:', USER_WITH_APPROVAL)

  // Test 1: Verificar balance de tokens BATTLE
  console.log('\n1️⃣ Verificando balance de tokens BATTLE...')
  try {
    const battleBalance = await readContract(publicClient, {
      address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
      abi: [
        {
          inputs: [{ name: 'owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        }
      ],
      functionName: 'balanceOf',
      args: [USER_WITH_APPROVAL as `0x${string}`]
    })
    console.log(`🎯 Balance BATTLE: ${battleBalance} wei (${Number(battleBalance) / 1e18} BATTLE)`)
  } catch (error) {
    console.error('❌ Error obteniendo balance BATTLE:', error)
    return
  }

  // Test 2: Verificar allowance
  console.log('\n2️⃣ Verificando allowance...')
  try {
    const allowance = await readContract(publicClient, {
      address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
      abi: [
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
      ],
      functionName: 'allowance',
      args: [USER_WITH_APPROVAL as `0x${string}`, VENDOR_REGISTRATION_ADDRESS as `0x${string}`]
    })
    console.log(`🔐 Allowance: ${allowance} wei (${Number(allowance) / 1e18} BATTLE)`)
    
    if (allowance < 50000000000000000000n) {
      console.log('⚠️  Allowance insuficiente para 50 BATTLE')
      return
    } else {
      console.log('✅ Allowance suficiente para registrar vendor')
    }
  } catch (error) {
    console.error('❌ Error obteniendo allowance:', error)
    return
  }

  // Test 3: Simular transacción de registro
  console.log('\n3️⃣ Simulando transacción de registro...')
  const testVendorData = JSON.stringify({
    name: 'Vendor con Aprobación',
    description: 'Vendor de prueba con usuario que ya aprobó',
    delegation: 'Centro',
    category: 'mexican',
    imageUrl: 'https://example.com/approved.jpg',
    ownerFid: '67890'
  })
  const testVendorId = 'vendor_approved_123'
  const testAmount = 50000000000000000000n // 50 tokens en wei

  try {
    await simulateContract(publicClient, {
      address: VENDOR_REGISTRATION_ADDRESS as `0x${string}`,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'registerVendor',
      args: [USER_WITH_APPROVAL as `0x${string}`, testAmount, testVendorData, testVendorId],
      account: USER_WITH_APPROVAL as `0x${string}`
    })
    console.log('✅ Simulación exitosa! Este usuario SÍ puede registrar vendor')
    
    // Test 4: Probar con la API real
    console.log('\n4️⃣ Probando con la API real...')
    const testData = {
      userAddress: USER_WITH_APPROVAL,
      vendorData: testVendorData,
      vendorId: testVendorId,
      paymentAmount: '50',
      signature: '0x' + '0'.repeat(130)
    }

    try {
      const response = await fetch('http://localhost:3000/api/vendors/register-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('🎉 ¡Registro exitoso en la API!')
        console.log('- Transaction Hash:', result.data?.transactionHash)
        console.log('- Vendor ID:', result.data?.vendorId)
      } else {
        console.log('❌ API falló:', result.error)
      }
      
    } catch (apiError) {
      console.error('❌ Error llamando a la API:', apiError)
    }
    
  } catch (simulationError: any) {
    console.log('❌ Simulación falló:', simulationError?.message || 'Error desconocido')
  }

  console.log('\n🏁 Test del usuario con aprobación completado!')
}

// Ejecutar la prueba
testUserWithApproval().catch(console.error)
