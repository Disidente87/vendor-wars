#!/usr/bin/env tsx

/**
 * Simple Deployment Script
 * 
 * A simplified deployment script that uses the deployment configuration
 * and provides a cleaner interface for deploying the VendorRegistration contract.
 */

import { ethers } from 'hardhat'
import { config } from 'dotenv'
import { getDeploymentConfig, validateEnvironment } from './deploy-config'
import path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  // Get network from environment or default to hardhat
  const network = process.env.HARDHAT_NETWORK || 'hardhat'
  
  console.log(`🚀 Deploying VendorRegistration to ${network} network...`)
  
  try {
    // Validate environment for the target network
    validateEnvironment(network)
    
    // Get deployment configuration
    const config = getDeploymentConfig(network)
    
    // Get deployer account
    const [deployer] = await ethers.getSigners()
    console.log(`📝 Deploying with account: ${deployer.address}`)
    console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`)
    
    // Get BattleToken address
    const battleTokenAddress = process.env.BATTLE_TOKEN_CONTRACT_ADDRESS!
    console.log(`🎯 BattleToken: ${battleTokenAddress}`)
    
    // Deploy contract
    console.log('🔧 Deploying VendorRegistration contract...')
    const VendorRegistration = await ethers.getContractFactory('VendorRegistration')
    const vendorRegistration = await VendorRegistration.deploy(battleTokenAddress)
    
    // Wait for deployment
    console.log('⏳ Waiting for deployment confirmation...')
    await vendorRegistration.waitForDeployment()
    
    const address = await vendorRegistration.getAddress()
    console.log(`✅ Contract deployed to: ${address}`)
    console.log(`🔗 Explorer: ${config.explorerUrl}/address/${address}`)
    
    // Verify deployment
    console.log('🔍 Verifying deployment...')
    const cost = await vendorRegistration.getVendorRegistrationCost()
    const burned = await vendorRegistration.getTotalTokensBurned()
    const vendors = await vendorRegistration.getTotalVendorsRegistered()
    
    console.log('✅ Deployment verified:')
    console.log(`  - Registration cost: ${ethers.formatEther(cost)} $BATTLE`)
    console.log(`  - Tokens burned: ${ethers.formatEther(burned)} $BATTLE`)
    console.log(`  - Vendors registered: ${vendors}`)
    
    // Save to .env
    const envContent = `\n# VendorRegistration Contract (${network})\nNEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=${address}\n`
    console.log('\n💾 Add to your .env file:')
    console.log(envContent)
    
    console.log('\n🎉 Deployment completed successfully!')
    console.log('\n📚 Next steps:')
    console.log('1. Add the contract address to your .env file')
    console.log('2. Test the system: npm run test:vendor-registration')
    console.log('3. Integrate with your frontend application')
    
  } catch (error) {
    console.error('💥 Deployment failed:', error)
    process.exit(1)
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Deployment failed:', error)
    process.exit(1)
  })
