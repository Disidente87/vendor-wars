#!/usr/bin/env tsx

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

// Configuración
const RPC_URL = 'https://sepolia.base.org'
const USER_ADDRESS = '0x5024693cf6de4B5612965a4792041710d5eBC09a'
const BATTLE_TOKEN_ADDRESS = '0xDa6884d4F2E68b9700678139B617607560f70Cc3'

// Cliente Viem
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL)
})

async function checkRecentTransactions() {
  console.log('🔍 Verificando transacciones recientes del usuario...\n')
  console.log('👤 Usuario:', USER_ADDRESS)

  try {
    // Obtener el bloque actual para calcular un rango reciente
    const currentBlock = await publicClient.getBlockNumber()
    console.log('📊 Bloque actual:', currentBlock.toString())
    
    // Buscar en los últimos 1000 bloques (aproximadamente 4 horas)
    const fromBlock = currentBlock - 1000n
    console.log('🔍 Buscando desde el bloque:', fromBlock.toString())

    // Buscar eventos de Approval y Transfer
    console.log('\n1️⃣ Buscando eventos de Approval...')
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
        owner: USER_ADDRESS as `0x${string}`
      },
      fromBlock,
      toBlock: currentBlock
    })

    if (approvalEvents.length > 0) {
      console.log(`📜 Se encontraron ${approvalEvents.length} eventos de Approval recientes:`)
      
      for (const event of approvalEvents) {
        const spender = event.args.spender
        const value = event.args.value
        const valueInTokens = Number(value) / 1e18
        
        console.log(`\n📅 Bloque ${event.blockNumber}:`)
        console.log(`   🔐 Spender: ${spender}`)
        console.log(`   💰 Valor: ${valueInTokens} BATTLE`)
        
        // Verificar si es para nuestro contrato
        if (spender?.toLowerCase() === '0xbd93d5310bc538ce379023b32f2cf0eeb1553079') {
          console.log(`   🎯 ¡Este es nuestro contrato VendorRegistration!`)
          if (valueInTokens === 0) {
            console.log(`   ⚠️  ¡APROBACIÓN REVOCADA! (valor = 0)`)
          } else {
            console.log(`   ✅ Aprobación activa`)
          }
        }
      }
    } else {
      console.log('📜 No se encontraron eventos de Approval recientes')
    }

    // Buscar eventos de Transfer
    console.log('\n2️⃣ Buscando eventos de Transfer...')
    const transferEvents = await publicClient.getLogs({
      address: BATTLE_TOKEN_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', name: 'from', indexed: true },
          { type: 'address', name: 'to', indexed: true },
          { type: 'uint256', name: 'value', indexed: false }
        ]
      },
      args: {
        from: USER_ADDRESS as `0x${string}`
      },
      fromBlock,
      toBlock: currentBlock
    })

    if (transferEvents.length > 0) {
      console.log(`📜 Se encontraron ${transferEvents.length} eventos de Transfer recientes:`)
      
      for (const event of transferEvents.slice(-5)) { // Solo los últimos 5
        const to = event.args.to
        const value = event.args.value
        const valueInTokens = Number(value) / 1e18
        
        console.log(`\n📅 Bloque ${event.blockNumber}:`)
        console.log(`   📤 To: ${to}`)
        console.log(`   💰 Valor: ${valueInTokens} BATTLE`)
      }
    } else {
      console.log('📜 No se encontraron eventos de Transfer recientes')
    }

    // Verificar allowance actual
    console.log('\n3️⃣ Verificando allowance actual...')
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
      args: [USER_ADDRESS as `0x${string}`, '0xBD93D5310bc538Ce379023B32F2Cf0eeb1553079' as `0x${string}`]
    })
    
    console.log(`🔐 Allowance actual: ${allowance} wei (${Number(allowance) / 1e18} BATTLE)`)
    
    if (allowance === 0n) {
      console.log('❌ Allowance es 0 - la aprobación fue revocada o expiró')
    } else {
      console.log('✅ Allowance activo')
    }

  } catch (error) {
    console.error('❌ Error verificando transacciones:', error)
  }

  console.log('\n🏁 Verificación de transacciones recientes completada!')
}

// Ejecutar la verificación
checkRecentTransactions().catch(console.error)
