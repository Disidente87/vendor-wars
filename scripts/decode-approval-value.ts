#!/usr/bin/env tsx

// Decodificar el valor de la aprobación
const approvalData = '0x000000000000000000000000000000000000000000000002b5e3af16b1880000'

console.log('🔍 Decodificando valor de la aprobación...\n')
console.log('📊 Data raw:', approvalData)

// Convertir de hex a BigInt
const valueInWei = BigInt(approvalData)
console.log('💰 Valor en wei:', valueInWei.toString())

// Convertir a tokens BATTLE (18 decimales)
const valueInTokens = Number(valueInWei) / 1e18
console.log('🎯 Valor en BATTLE tokens:', valueInTokens)

// Verificar si es suficiente para 50 BATTLE
const requiredAmount = 50
if (valueInTokens >= requiredAmount) {
  console.log(`✅ Aprobación suficiente: ${valueInTokens} >= ${requiredAmount} BATTLE`)
} else {
  console.log(`❌ Aprobación insuficiente: ${valueInTokens} < ${requiredAmount} BATTLE`)
}

// Información adicional
console.log('\n📋 Resumen de la transacción:')
console.log('- Hash:', '0xf75fc5f62080ab4f50e17fb7175daa1d47127965b5ea4a13bfb04c3d2f61ea30')
console.log('- From (Owner):', '0x5024693cf6de4b5612965a4792041710d5eBC09a')
console.log('- To (Token):', '0xDa6884d4F2E68b9700678139B617607560f70Cc3')
console.log('- Spender (Contrato):', '0xBD93D5310bc538Ce379023B32F2Cf0eeb1553079')
console.log('- Valor Aprobado:', `${valueInTokens} BATTLE`)
console.log('- Fecha:', '29 de Agosto, 2025, 8:18:56 PM')
console.log('- Estado:', '✅ Exitoso')
