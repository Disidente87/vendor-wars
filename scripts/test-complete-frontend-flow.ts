#!/usr/bin/env tsx

async function testCompleteFrontendFlow() {
  console.log('🧪 Probando flujo completo del frontend...\n')

  // Simular el estado del hook de pago
  let paymentState = {
    isConnected: true,
    hasSufficientBalance: true,
    isApproved: false, // Usuario no ha aprobado tokens
    isTransactionPending: false,
    isTransactionConfirmed: false,
    error: null,
    balance: '20999619.00',
    requiredAmount: '50'
  }

  console.log('📱 Estado inicial del frontend:')
  console.log('- Wallet conectada:', paymentState.isConnected)
  console.log('- Saldo suficiente:', paymentState.hasSufficientBalance)
  console.log('- Tokens aprobados:', paymentState.isApproved)
  console.log('- Saldo BATTLE:', paymentState.balance)

  // Simular que el usuario hace clic en "Registrar Vendor"
  console.log('\n🔄 Usuario hace clic en "Registrar Vendor"...')
  
  if (!paymentState.isApproved) {
    console.log('⚠️  Usuario no ha aprobado tokens - mostrando mensaje de error')
    paymentState.error = 'Para continuar, necesitas aprobar que el contrato gaste tus tokens BATTLE primero'
    paymentState.isTransactionPending = false
    paymentState.isTransactionConfirmed = false
    
    console.log('❌ Error mostrado al usuario:', paymentState.error)
    console.log('📋 Estado actualizado:')
    console.log('- Error:', paymentState.error)
    console.log('- Transacción pendiente:', paymentState.isTransactionPending)
    console.log('- Transacción confirmada:', paymentState.isTransactionConfirmed)
    
    return
  }

  // Si llegara aquí (que no debería), simular la llamada a la API
  console.log('✅ Usuario ha aprobado tokens - procediendo con registro...')
  
  const testData = {
    userAddress: '0x80bEC485a67549ea32e303d3a1B8bafa4B3B5e99',
    vendorData: JSON.stringify({
      name: 'Test Vendor Frontend',
      description: 'Vendor de prueba del frontend',
      delegation: 'Centro',
      category: 'mexican',
      imageUrl: 'https://example.com/test.jpg',
      ownerFid: '12345'
    }),
    vendorId: 'test_vendor_frontend_789',
    paymentAmount: '50',
    signature: '0x' + '0'.repeat(130)
  }

  console.log('📤 Enviando datos a la API...')
  
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
      console.log('✅ Registro exitoso!')
      paymentState.isTransactionConfirmed = true
      paymentState.error = null
    } else {
      console.log('❌ Registro falló:', result.error)
      paymentState.error = result.error
      paymentState.isTransactionConfirmed = false
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error)
    paymentState.error = `Error de red: ${error instanceof Error ? error.message : 'desconocido'}`
  }

  console.log('\n🏁 Flujo del frontend completado!')
  console.log('\n📋 Estado final:')
  console.log('- Error:', paymentState.error)
  console.log('- Transacción confirmada:', paymentState.isTransactionConfirmed)
  console.log('- Transacción pendiente:', paymentState.isTransactionPending)
}

// Ejecutar la prueba
testCompleteFrontendFlow().catch(console.error)
