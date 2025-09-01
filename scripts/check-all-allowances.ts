#!/usr/bin/env tsx

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { readContract } from 'viem/actions'

// Configuración
const BATTLE_TOKEN_ADDRESS = '0xDa6884d4F2E68b9700678139B617607560f70Cc3'
const RPC_URL = 'https://sepolia.base.org'

// Usuario a verificar
const USER_TO_CHECK = '0x5024693cf6de4B5612965a4792041710d5eBC09a'

// Contratos conocidos para verificar
const KNOWN_CONTRACTS = [
  { name: 'VendorRegistration (Main)', address: '0x00aBc357C1285D3107624FF0CDBa872f50a8f36a' },
  { name: 'VendorRegistration (Test)', address: '0xBD93D5310bc538Ce379023B32F2Cf0eeb1553079' },
  { name: 'Battle Token', address: '0xDa6884d4F2E68b9700678139B617607560f70Cc3' },
  { name: 'Uniswap Router', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
  { name: 'Uniswap Factory', address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' }
]

// Cliente Viem
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL)
})

async function checkAllAllowances() {
  console.log('🔍 Verificando TODAS las aprobaciones del usuario...\n')
  console.log('👤 Usuario:', USER_TO_CHECK)

  // Test 1: Verificar balance de tokens BATTLE
  console.log('\n1️⃣ Balance de tokens BATTLE:')
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
      args: [USER_TO_CHECK as `0x${string}`]
    })
    console.log(`🎯 Balance: ${battleBalance} wei (${Number(battleBalance) / 1e18} BATTLE)`)
  } catch (error) {
    console.error('❌ Error obteniendo balance:', error)
  }

  // Test 2: Verificar allowance en contratos conocidos
  console.log('\n2️⃣ Verificando allowance en contratos conocidos:')
  
  for (const contract of KNOWN_CONTRACTS) {
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
        args: [USER_TO_CHECK as `0x${string}`, contract.address as `0x${string}`]
      })
      
      const allowanceInTokens = Number(allowance) / 1e18
      console.log(`🔐 ${contract.name}: ${allowance} wei (${allowanceInTokens} BATTLE)`)
      
      if (allowance > 0n) {
        console.log(`   ✅ ¡APROBACIÓN ENCONTRADA!`)
      }
      
    } catch (error) {
      console.log(`❌ ${contract.name}: Error - ${error instanceof Error ? error.message : 'desconocido'}`)
    }
  }

  // Test 3: Verificar si hay transacciones de approve en la blockchain
  console.log('\n3️⃣ Buscando transacciones de approve en la blockchain...')
  try {
    // Buscar eventos de Approval en el contrato BATTLE
    const approvalEvents = await publicClient.getLogs({
      address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'Approval',
        inputs: [
          { type: 'address', name: 'owner', indexed: true },
          { type: 'address', name: 'spender', indexed: true },
          { type: 'uint256', name: 'value', indexed: false }
        ]
      },
      args: {
        owner: USER_TO_CHECK as `0x${string}`
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    })

    if (approvalEvents.length > 0) {
      console.log(`📜 Se encontraron ${approvalEvents.length} eventos de Approval:`)
      
      for (const event of approvalEvents.slice(-5)) { // Mostrar solo los últimos 5
        const spender = event.args.spender
        const value = event.args.value
        const valueInTokens = Number(value) / 1e18
        
        console.log(`   📅 Bloque ${event.blockNumber}: Aprobó ${valueInTokens} BATTLE a ${spender}`)
        
        // Verificar si este spender es uno de nuestros contratos conocidos
        const knownContract = KNOWN_CONTRACTS.find(c => c.address.toLowerCase() === spender?.toLowerCase())
        if (knownContract) {
          console.log(`      🎯 ¡Este es nuestro contrato ${knownContract.name}!`)
        }
      }
    } else {
      console.log('📜 No se encontraron eventos de Approval para este usuario')
    }
    
  } catch (error) {
    console.error('❌ Error buscando eventos de Approval:', error)
  }

  console.log('\n🏁 Verificación de aprobaciones completada!')
}

// Ejecutar la verificación
checkAllAllowances().catch(console.error)
