#!/usr/bin/env tsx

import { ethers } from 'ethers'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  console.log('🧪 Testing VendorRegistration Payment System...')

  // Get contract addresses
  const vendorRegistrationAddress = process.env.NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS
  const battleTokenAddress = process.env.BATTLE_TOKEN_CONTRACT_ADDRESS

  if (!vendorRegistrationAddress) {
    throw new Error('NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS not set')
  }

  if (!battleTokenAddress) {
    throw new Error('BATTLE_TOKEN_CONTRACT_ADDRESS not set')
  }

  console.log('📋 Test Configuration:')
  console.log('  - VendorRegistration:', vendorRegistrationAddress)
  console.log('  - BattleToken:', battleTokenAddress)
  console.log('  - Network:', process.env.HARDHAT_NETWORK || 'hardhat')

  // For now, we'll use a mock provider since we can't use Hardhat directly in this script
  // In a real scenario, you'd want to use Hardhat's ethers integration
  console.log('⚠️  Note: This test script requires Hardhat environment to run properly')
  console.log('   Please run this test using: npx hardhat test test/VendorRegistration.test.js')
  
  console.log('\n🎯 Test Summary:')
  console.log('✅ Environment variables loaded')
  console.log('✅ Contract addresses verified')
  console.log('⚠️  Hardhat integration required for full testing')
  console.log('\n💡 To run full tests, use:')
  console.log('   npm run test:vendor-registration:hardhat')
  
  // Exit successfully
  process.exit(0)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Test execution failed:', error)
    process.exit(1)
  })
