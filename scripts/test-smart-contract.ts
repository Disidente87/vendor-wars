#!/usr/bin/env tsx

import { createPublicClient, http } from 'viem'
import { readContract } from 'viem/actions'
import { baseSepolia } from 'viem/chains'

// Configuración del sistema de pago
const PAYMENT_CONFIG = {
  BATTLE_TOKEN: {
    ADDRESS: process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS || '0xDa6884d4F2E68b9700678139B617607560f70Cc3',
  },
  VENDOR_REGISTRATION: {
    ADDRESS: process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS || '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a',
    NETWORK: {
      RPC_URL: 'https://sepolia.base.org',
    },
  },
}

// ABI simplificado para el contrato VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  {
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'VENDOR_REGISTRATION_COST',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'battleToken',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: '_totalTokensBurned',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: '_totalVendorsRegistered',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// ABI para el token BATTLE
const BATTLE_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

async function testSmartContract() {
  console.log('🚀 Testing Smart Contract State')
  console.log('=' .repeat(50))
  
  try {
    // Crear cliente público
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
    })
    
    console.log('🔗 RPC URL:', PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
    console.log('📋 Chain ID:', baseSepolia.id)
    
    // Test 1: Verificar que el contrato existe
    console.log('\n📦 Test 1: Verificar existencia del contrato...')
    try {
      const bytecode = await client.getBytecode({ 
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}` 
      })
      
      if (bytecode && bytecode !== '0x') {
        console.log('✅ Contrato VendorRegistration existe en la blockchain')
      } else {
        console.log('❌ Contrato VendorRegistration NO existe en la blockchain')
        return
      }
    } catch (error) {
      console.log('❌ Error verificando contrato:', error)
      return
    }
    
    // Test 2: Verificar que el token BATTLE existe
    console.log('\n💰 Test 2: Verificar token BATTLE...')
    try {
      const battleBytecode = await client.getBytecode({ 
        address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}` 
      })
      
      if (battleBytecode && battleBytecode !== '0x') {
        console.log('✅ Token BATTLE existe en la blockchain')
      } else {
        console.log('❌ Token BATTLE NO existe en la blockchain')
        return
      }
    } catch (error) {
      console.log('❌ Error verificando token BATTLE:', error)
      return
    }
    
    // Test 3: Verificar estado de pausa del contrato
    console.log('\n⏸️ Test 3: Verificar estado de pausa...')
    try {
      const isPaused = await readContract(client, {
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'paused'
      })
      
      console.log(`📊 Estado de pausa: ${isPaused ? '⏸️ PAUSADO' : '✅ ACTIVO'}`)
      
      if (isPaused) {
        console.log('⚠️ El contrato está pausado. No se pueden registrar vendors.')
        return
      }
    } catch (error) {
      console.log('❌ Error verificando estado de pausa:', error)
    }
    
    // Test 4: Verificar owner del contrato
    console.log('\n👑 Test 4: Verificar owner del contrato...')
    try {
      const owner = await readContract(client, {
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'owner'
      })
      
      console.log(`👑 Owner del contrato: ${owner}`)
    } catch (error) {
      console.log('❌ Error verificando owner:', error)
    }
    
    // Test 5: Verificar costo de registro
    console.log('\n💸 Test 5: Verificar costo de registro...')
    try {
      const registrationCost = await readContract(client, {
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'VENDOR_REGISTRATION_COST'
      })
      
      console.log(`💸 Costo de registro: ${registrationCost} wei`)
      console.log(`💸 Costo de registro: ${Number(registrationCost) / 1e18} BATTLE`)
    } catch (error) {
      console.log('❌ Error verificando costo de registro:', error)
    }
    
    // Test 6: Verificar token BATTLE supply
    console.log('\n📊 Test 6: Verificar supply del token BATTLE...')
    try {
      const totalSupply = await readContract(client, {
        address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'totalSupply'
      })
      
      console.log(`📊 Total supply BATTLE: ${totalSupply} wei`)
      console.log(`📊 Total supply BATTLE: ${Number(totalSupply) / 1e18} BATTLE`)
    } catch (error) {
      console.log('❌ Error verificando supply del token:', error)
    }
    
    // Test 7: Verificar balance de una dirección de prueba
    console.log('\n👤 Test 7: Verificar balance de dirección de prueba...')
    try {
      const testAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`
      
      const balance = await readContract(client, {
        address: PAYMENT_CONFIG.BATTLE_TOKEN.ADDRESS as `0x${string}`,
        abi: BATTLE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [testAddress]
      })
      
      console.log(`💰 Balance BATTLE de ${testAddress}: ${balance} wei`)
      console.log(`💰 Balance BATTLE de ${testAddress}: ${Number(balance) / 1e18} BATTLE`)
    } catch (error) {
      console.log('❌ Error verificando balance:', error)
    }
    
    // Test 8: Verificar estadísticas del contrato
    console.log('\n📈 Test 8: Verificar estadísticas del contrato...')
    try {
      const totalTokensBurned = await readContract(client, {
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: '_totalTokensBurned'
      })
      
      const totalVendorsRegistered = await readContract(client, {
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: '_totalVendorsRegistered'
      })
      
      console.log(`🔥 Total tokens quemados: ${Number(totalTokensBurned) / 1e18} BATTLE`)
      console.log(`🏪 Total vendors registrados: ${totalVendorsRegistered}`)
    } catch (error) {
      console.log('❌ Error verificando estadísticas:', error)
    }
    
    console.log('\n✅ Smart contract tests completed!')
    
  } catch (error) {
    console.error('❌ Error general en tests del smart contract:', error)
  }
}

testSmartContract().catch(console.error)
