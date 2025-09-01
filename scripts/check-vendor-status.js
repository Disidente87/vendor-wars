import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import dotenv from 'dotenv'

dotenv.config()

// ABI simplificado para verificar si un vendor existe
const VENDOR_REGISTRATION_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "isVendorRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "vendorId",
        "type": "string"
      }
    ],
    "name": "vendorExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const VENDOR_REGISTRATION_ADDRESS = process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS || '0xBD93D5310bc538Ce379023B32F2Cf0eeb1553079'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
})

async function checkVendorStatus() {
  const userAddress = '0x5024693cf6de4B5612965a4792041710d5eBC09a'
  const vendorId = 'vendor_1756749124708_i9bgrz'
  
  console.log('🔍 Verificando estado del vendor...')
  console.log('👤 Usuario:', userAddress)
  console.log('🆔 Vendor ID:', vendorId)
  console.log('📋 Contrato:', VENDOR_REGISTRATION_ADDRESS)
  console.log('')

  try {
    // Verificar si el usuario está registrado como vendor
    console.log('1️⃣ Verificando si el usuario está registrado como vendor...')
    const isUserRegistered = await client.readContract({
      address: VENDOR_REGISTRATION_ADDRESS,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'isVendorRegistered',
      args: [userAddress]
    })
    
    console.log('✅ Usuario registrado como vendor:', isUserRegistered)
    
    // Verificar si el vendor ID existe
    console.log('\n2️⃣ Verificando si el vendor ID existe...')
    const vendorIdExists = await client.readContract({
      address: VENDOR_REGISTRATION_ADDRESS,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'vendorExists',
      args: [vendorId]
    })
    
    console.log('✅ Vendor ID existe:', vendorIdExists)
    
    // Resumen
    console.log('\n📋 RESUMEN:')
    if (isUserRegistered) {
      console.log('❌ El usuario YA está registrado como vendor en el contrato')
      console.log('💡 Solución: El usuario no puede registrarse dos veces')
    } else {
      console.log('✅ El usuario NO está registrado como vendor')
    }
    
    if (vendorIdExists) {
      console.log('❌ El vendor ID YA existe en el contrato')
      console.log('💡 Solución: Generar un nuevo vendor ID único')
    } else {
      console.log('✅ El vendor ID NO existe')
    }
    
  } catch (error) {
    console.error('❌ Error al verificar estado del vendor:', error)
  }
}

checkVendorStatus()
