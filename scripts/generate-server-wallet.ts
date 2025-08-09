#!/usr/bin/env tsx

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

/**
 * Script to generate a new server wallet for token distribution
 * 
 * IMPORTANT: 
 * - This wallet will need to be funded with BATTLE tokens to distribute
 * - Keep the private key secure and add it to your .env.local
 * - The address needs to have distributor permissions in the smart contract
 */

function generateServerWallet() {
  console.log('🔐 Generating Server Wallet for Token Distribution...\n')

  // Generate new private key
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)

  console.log('✅ New server wallet generated!')
  console.log('\n📋 Wallet Details:')
  console.log(`Private Key: ${privateKey}`)
  console.log(`Address: ${account.address}`)

  console.log('\n🔧 Environment Variables to Add:')
  console.log('Add these to your .env.local file:')
  console.log('```')
  console.log(`SERVER_PRIVATE_KEY=${privateKey}`)
  console.log(`SERVER_WALLET_ADDRESS=${account.address}`)
  console.log('```')

  console.log('\n⚠️ Important Next Steps:')
  console.log('1. Add the above environment variables to .env.local')
  console.log('2. Fund this wallet with BATTLE tokens for distribution')
  console.log('3. Ensure this address has distributor permissions in the smart contract')
  console.log('4. Test the setup with: npm run test:real-blockchain')

  console.log('\n🔒 Security Notes:')
  console.log('- Keep the private key secret and secure')
  console.log('- Do not commit the private key to version control')
  console.log('- Consider using a hardware wallet or multisig for production')
  console.log('- Monitor the wallet balance regularly')

  console.log('\n💰 Funding Instructions:')
  console.log(`1. Send BATTLE tokens to: ${account.address}`)
  console.log('2. Use the contract owner account or faucet')
  console.log('3. Recommend starting with at least 1000 BATTLE tokens')
  console.log('4. Monitor balance and refill as needed')
}

// Run the generator
generateServerWallet()
