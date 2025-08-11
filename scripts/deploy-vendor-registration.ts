#!/usr/bin/env tsx

import { ethers } from 'hardhat'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  console.log('🚀 Deploying VendorRegistration smart contract...')
  
  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log('📝 Deploying with account:', deployer.address)
  console.log('💰 Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH')
  
  // Get network information
  const network = await ethers.provider.getNetwork()
  const networkName = process.env.HARDHAT_NETWORK || 'hardhat'
  console.log('🌐 Network:', networkName)
  
  // Get the BattleToken contract address from environment
  const battleTokenAddress = process.env.BATTLE_TOKEN_CONTRACT_ADDRESS
  if (!battleTokenAddress) {
    console.error('❌ Error: BATTLE_TOKEN_CONTRACT_ADDRESS not configured in environment variables')
    console.log('💡 Configure BATTLE_TOKEN_CONTRACT_ADDRESS in your .env file')
    process.exit(1)
  }
  
  console.log('🎯 BATTLE Token Address:', battleTokenAddress)
  
  try {
    // Get the contract factory
    const VendorRegistration = await ethers.getContractFactory('VendorRegistration')
    
    console.log('📋 Contract parameters:')
    console.log('  - BattleToken address:', battleTokenAddress)
    console.log('  - Registration cost: 50 $BATTLE tokens')
    console.log('  - Network:', networkName)
    console.log('  - Deployer:', deployer.address)
    
    // Deploy the contract
    console.log('🔧 Deploying contract...')
    const vendorRegistration = await VendorRegistration.deploy(battleTokenAddress)
    await vendorRegistration.waitForDeployment()
    
    const address = await vendorRegistration.getAddress()
    console.log('✅ VendorRegistration deployed to:', address)
    console.log('🔗 Contract URL:', getContractUrl(address, networkName))
    
    // Verify the deployment
    console.log('\n🔍 Verifying deployment...')
    
    try {
      const registrationCost = await vendorRegistration.getVendorRegistrationCost()
      const totalTokensBurned = await vendorRegistration.getTotalTokensBurned()
      const totalVendorsRegistered = await vendorRegistration.getTotalVendorsRegistered()
      
      console.log('✅ Contract verification successful:')
      console.log('  - Registration cost:', ethers.formatEther(registrationCost), '$BATTLE')
      console.log('  - Total tokens burned:', ethers.formatEther(totalTokensBurned), '$BATTLE')
      console.log('  - Total vendors registered:', totalVendorsRegistered.toString())
      
      // Verify owner
      const owner = await vendorRegistration.owner()
      console.log('👑 Owner:', owner)
      
      if (owner === deployer.address) {
        console.log('✅ Owner configured correctly')
      } else {
        console.log('❌ Error: Owner not configured correctly')
      }
      
      // Verify battle token
      const battleToken = await vendorRegistration.battleToken()
      console.log('🎯 BATTLE Token configured:', battleToken)
      
      if (battleToken === battleTokenAddress) {
        console.log('✅ BATTLE Token configured correctly')
      } else {
        console.log('❌ Error: BATTLE Token not configured correctly')
      }
      
    } catch (error) {
      console.error('❌ Contract verification failed:', error)
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: networkName,
      vendorRegistrationAddress: address,
      battleTokenAddress: battleTokenAddress,
      owner: deployer.address,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
      registrationCost: ethers.formatEther(await vendorRegistration.getVendorRegistrationCost()),
      constants: {
        MAX_VENDORS_PER_DAY: 3,
        MAX_VENDORS_PER_WEEK: 10,
        COOLDOWN_PERIOD: "1 hour"
      }
    }
    
    console.log('\n📋 Deployment Summary:')
    console.log(JSON.stringify(deploymentInfo, null, 2))
    
    // Save deployment info to file if requested
    if (process.env.SAVE_DEPLOY_INFO === 'true') {
      const deployFile = `deploy-info-${networkName}-${Date.now()}.json`
      fs.writeFileSync(deployFile, JSON.stringify(deploymentInfo, null, 2))
      console.log(`💾 Deployment info saved to: ${deployFile}`)
    }
    
    // Save to .env file
    const envContent = `\n# VendorRegistration Contract\nNEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS=${address}\n`
    
    console.log('\n💾 Add this to your .env file:')
    console.log(envContent)
    
    // Test basic functionality
    console.log('\n🧪 Testing basic functionality...')
    
    try {
      // Test registration cost
      const cost = await vendorRegistration.getVendorRegistrationCost()
      console.log('✅ Registration cost:', ethers.formatEther(cost), '$BATTLE')
      
      // Test initial state
      const burned = await vendorRegistration.getTotalTokensBurned()
      const vendors = await vendorRegistration.getTotalVendorsRegistered()
      console.log('✅ Initial state - Tokens burned:', ethers.formatEther(burned), 'Vendors:', vendors.toString())
      
    } catch (error) {
      console.error('❌ Basic functionality test failed:', error)
    }
    
    console.log('\n🎉 Deployment completed successfully!')
    console.log('\n📚 Next steps:')
    console.log('1. Verify the contract on the blockchain explorer')
    console.log('2. Add NEXT_PUBLIC_VENDOR_REGISTRATION_CONTRACT_ADDRESS to your .env file')
    console.log('3. Run tests: npm run test:vendor-registration')
    console.log('4. Configure environment variables in your backend')
    console.log('5. Integrate the contract in your application')
    
  } catch (error) {
    console.error('❌ Error during deployment:', error)
    process.exit(1)
  }
}

function getContractUrl(address: string, network: string): string {
  switch (network) {
    case 'sepolia':
      return `https://sepolia.etherscan.io/address/${address}`
    case 'baseSepolia':
      return `https://sepolia.basescan.org/address/${address}`
    case 'goerli':
      return `https://goerli.etherscan.io/address/${address}`
    case 'polygon':
      return `https://polygonscan.com/address/${address}`
    case 'mumbai':
      return `https://mumbai.polygonscan.com/address/${address}`
    case 'mainnet':
      return `https://etherscan.io/address/${address}`
    case 'base':
      return `https://basescan.org/address/${address}`
    default:
      return `Local network: ${address}`
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
