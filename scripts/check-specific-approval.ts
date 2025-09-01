#!/usr/bin/env tsx

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

// Configuración
const RPC_URL = 'https://sepolia.base.org'
const APPROVAL_TX_HASH = '0xf75fc5f62080ab4f50e17fb7175daa1d47127965b5ea4a13bfb04c3d2f61ea30'

// Cliente Viem
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL)
})

async function checkSpecificApproval() {
  console.log('🔍 Analizando transacción específica de approve...\n')
  console.log('📜 Transaction Hash:', APPROVAL_TX_HASH)

  try {
    // Obtener detalles de la transacción
    console.log('\n1️⃣ Obteniendo detalles de la transacción...')
    const tx = await publicClient.getTransaction({ hash: APPROVAL_TX_HASH as `0x${string}` })
    
    if (!tx) {
      console.log('❌ Transacción no encontrada')
      return
    }

    console.log('✅ Transacción encontrada!')
    console.log('- From:', tx.from)
    console.log('- To:', tx.to)
    console.log('- Block Number:', tx.blockNumber)
    console.log('- Gas Used:', tx.gasUsed)
    console.log('- Status:', tx.status)

    // Obtener receipt para ver el estado final
    console.log('\n2️⃣ Obteniendo receipt de la transacción...')
    const receipt = await publicClient.getTransactionReceipt({ hash: APPROVAL_TX_HASH as `0x${string}` })
    
    if (receipt) {
      console.log('✅ Receipt obtenido!')
      console.log('- Status:', receipt.status)
      console.log('- Gas Used:', receipt.gasUsed)
      console.log('- Logs count:', receipt.logs.length)
      
      // Analizar logs para encontrar el evento Approval
      if (receipt.logs.length > 0) {
        console.log('\n3️⃣ Analizando logs de la transacción...')
        
        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i]
          console.log(`\n📋 Log ${i + 1}:`)
          console.log('- Address:', log.address)
          console.log('- Topics:', log.topics)
          console.log('- Data:', log.data)
          
          // Si es un evento Approval del token BATTLE
          if (log.address.toLowerCase() === '0xda6884d4f2e68b9700678139b617607560f70cc3') {
            console.log('🎯 ¡Este es un log del contrato BATTLE Token!')
            
            // Decodificar el evento Approval
            try {
              // Topics: [0] = event signature, [1] = owner, [2] = spender
              const owner = '0x' + log.topics[1].slice(26) // Remover padding
              const spender = '0x' + log.topics[2].slice(26) // Remover padding
              
              console.log('👤 Owner (quien aprueba):', owner)
              console.log('🔐 Spender (quien recibe la aprobación):', spender)
              
              // Verificar si el spender es nuestro contrato VendorRegistration
              const vendorRegistrationAddresses = [
                '0x00abc357c1285d3107624ff0cdba872f50a8f36a',
                '0xbd93d5310bc538ce379023b32f2cf0eeb1553079'
              ]
              
              const isOurContract = vendorRegistrationAddresses.includes(spender.toLowerCase())
              if (isOurContract) {
                console.log('🎉 ¡APROBACIÓN ENCONTRADA PARA NUESTRO CONTRATO!')
                console.log('📍 Contrato:', spender)
              } else {
                console.log('⚠️  Aprobación para otro contrato:', spender)
              }
              
            } catch (decodeError) {
              console.log('❌ Error decodificando log:', decodeError)
            }
          }
        }
      }
    }

    // Obtener el bloque para ver la fecha
    if (tx.blockNumber) {
      console.log('\n4️⃣ Obteniendo información del bloque...')
      const block = await publicClient.getBlock({ blockNumber: tx.blockNumber })
      
      if (block) {
        const timestamp = new Date(Number(block.timestamp) * 1000)
        console.log('📅 Fecha del bloque:', timestamp.toLocaleString())
        console.log('⏰ Timestamp:', block.timestamp)
      }
    }

  } catch (error) {
    console.error('❌ Error analizando la transacción:', error)
  }

  console.log('\n🏁 Análisis de la transacción completado!')
}

// Ejecutar el análisis
checkSpecificApproval().catch(console.error)
