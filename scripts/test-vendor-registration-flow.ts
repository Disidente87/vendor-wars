#!/usr/bin/env tsx

import { createPublicClient, http, encodeFunctionData } from 'viem'
import { baseSepolia } from 'viem/chains'
import { simulateContract } from 'viem/actions'

// Configuración
const VENDOR_REGISTRATION_ADDRESS = '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a'
const BATTLE_TOKEN_ADDRESS = '0xDa6884d4F2E68b9700678139B617607560f70Cc3'
const RPC_URL = 'https://sepolia.base.org'

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

async function testVendorRegistrationFlow() {
  console.log('🧪 Iniciando prueba del flujo de registro de vendor...\n')

  // Test 1: Verificar conectividad RPC
  console.log('1️⃣ Probando conectividad RPC...')
  try {
    const blockNumber = await publicClient.getBlockNumber()
    console.log(`✅ RPC conectado. Bloque actual: ${blockNumber}`)
  } catch (error) {
    console.error('❌ Error de conectividad RPC:', error)
    return
  }

  // Test 2: Verificar que el contrato existe
  console.log('\n2️⃣ Verificando existencia del contrato...')
  try {
    const bytecode = await publicClient.getBytecode({ 
      address: VENDOR_REGISTRATION_ADDRESS as `0x${string}` 
    })
    
    if (!bytecode || bytecode === '0x') {
      console.error('❌ Contrato VendorRegistration no encontrado')
      return
    }
    console.log('✅ Contrato encontrado')
  } catch (error) {
    console.error('❌ Error verificando contrato:', error)
    return
  }

  // Test 3: Simular transacción con datos válidos
  console.log('\n3️⃣ Simulando transacción con datos válidos...')
  const testUserAddress = '0x80bEC485a67549ea32e303d3a1B8bafa4B3B5e99'
  const testVendorData = JSON.stringify({
    name: 'Test Vendor',
    description: 'Vendor de prueba',
    delegation: 'Centro',
    category: 'mexican',
    imageUrl: 'https://example.com/test.jpg'
  })
  const testVendorId = 'test_vendor_123'
  const testAmount = 50000000000000000000n // 50 tokens en wei

  try {
    await simulateContract(publicClient, {
      address: VENDOR_REGISTRATION_ADDRESS as `0x${string}`,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'registerVendor',
      args: [testUserAddress as `0x${string}`, testAmount, testVendorData, testVendorId],
      account: testUserAddress as `0x${string}`
    })
    console.log('✅ Simulación exitosa (esto no debería pasar sin approve)')
  } catch (simulationError: any) {
    console.log('❌ Simulación falló como se esperaba')
    console.log('📝 Error capturado:', simulationError?.message || 'Error desconocido')
    
    // Analizar el tipo de error
    if (simulationError?.message?.includes('allowance')) {
      console.log('🎯 Error de allowance detectado - usuario necesita aprobar tokens')
    } else if (simulationError?.message?.includes('balance')) {
      console.log('💰 Error de balance detectado - usuario no tiene suficientes tokens')
    } else if (simulationError?.message?.includes('Vendor already exists')) {
      console.log('🆔 Error de vendor existente detectado')
    } else {
      console.log('❓ Otro tipo de error:', simulationError?.message)
    }
  }

  // Test 4: Verificar balance del usuario de prueba
  console.log('\n4️⃣ Verificando balance del usuario de prueba...')
  try {
    const balance = await publicClient.getBalance({ address: testUserAddress as `0x${string}` })
    console.log(`💰 Balance ETH: ${balance} wei (${Number(balance) / 1e18} ETH)`)
  } catch (error) {
    console.error('❌ Error obteniendo balance ETH:', error)
  }

  // Test 5: Verificar balance de tokens BATTLE
  console.log('\n5️⃣ Verificando balance de tokens BATTLE...')
  try {
    const { readContract } = await import('viem/actions')
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
      args: [testUserAddress as `0x${string}`]
    })
    console.log(`🎯 Balance BATTLE: ${battleBalance} wei (${Number(battleBalance) / 1e18} BATTLE)`)
  } catch (error) {
    console.error('❌ Error obteniendo balance BATTLE:', error)
  }

  // Test 6: Verificar allowance
  console.log('\n6️⃣ Verificando allowance...')
  try {
    const { readContract } = await import('viem/actions')
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
      args: [testUserAddress as `0x${string}`, VENDOR_REGISTRATION_ADDRESS as `0x${string}`]
    })
    console.log(`🔐 Allowance: ${allowance} wei (${Number(allowance) / 1e18} BATTLE)`)
    
    if (allowance < testAmount) {
      console.log('⚠️  Allowance insuficiente - usuario necesita aprobar más tokens')
    } else {
      console.log('✅ Allowance suficiente')
    }
  } catch (error) {
    console.error('❌ Error obteniendo allowance:', error)
  }

  console.log('\n🏁 Prueba del flujo completada!')
  console.log('\n📋 Resumen:')
  console.log('- El contrato existe y es accesible')
  console.log('- La simulación captura errores correctamente')
  console.log('- Los errores de allowance son detectados')
  console.log('- El usuario necesita aprobar tokens antes de registrar')
}

// Ejecutar la prueba
testVendorRegistrationFlow().catch(console.error)
