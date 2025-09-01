#!/usr/bin/env tsx

async function testAPIEndpoint() {
  console.log('🧪 Probando endpoint de la API...\n')

  const testData = {
    userAddress: '0x80bEC485a67549ea32e303d3a1B8bafa4B3B5e99',
    vendorData: JSON.stringify({
      name: 'Test Vendor API',
      description: 'Vendor de prueba para API',
      delegation: 'Centro',
      category: 'mexican',
      imageUrl: 'https://example.com/test.jpg',
      ownerFid: '12345'
    }),
    vendorId: 'test_vendor_api_456',
    paymentAmount: '50',
    signature: '0x' + '0'.repeat(130)
  }

  console.log('📤 Enviando datos de prueba:')
  console.log('- User Address:', testData.userAddress)
  console.log('- Vendor ID:', testData.vendorId)
  console.log('- Payment Amount:', testData.paymentAmount)
  console.log('- Vendor Data Length:', testData.vendorData.length)

  try {
    console.log('\n🌐 Llamando a la API...')
    const response = await fetch('http://localhost:3000/api/vendors/register-with-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    
    console.log('\n📊 Respuesta de la API:')
    console.log('- Status:', response.status)
    console.log('- Success:', result.success)
    
    if (result.success) {
      console.log('✅ Registro exitoso!')
      console.log('- Transaction Hash:', result.data?.transactionHash)
      console.log('- Vendor ID:', result.data?.vendorId)
    } else {
      console.log('❌ Registro falló:')
      console.log('- Error:', result.error)
      console.log('- Details:', result.details)
    }

  } catch (error) {
    console.error('❌ Error llamando a la API:', error)
  }
}

// Ejecutar la prueba
testAPIEndpoint().catch(console.error)
