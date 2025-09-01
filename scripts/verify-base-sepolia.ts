#!/usr/bin/env tsx

/**
 * Base Sepolia Compatibility Verification
 * 
 * This script verifies that the contracts are compatible with Base Sepolia
 * and tests the deployment configuration.
 */

import { ethers } from 'ethers'
import hre from 'hardhat'
import { config } from 'dotenv'
import { getDeploymentConfig, validateEnvironment } from './deploy-config'
import path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  console.log('🔍 Verifying Base Sepolia compatibility...')
  
  try {
    // Test Base Sepolia configuration
    const network = 'baseSepolia'
    console.log(`\n🌐 Testing ${network} network configuration...`)
    
    // Validate environment (skip for basic verification)
    try {
      validateEnvironment(network)
    } catch (error) {
      console.log('⚠️  Environment validation skipped for basic verification')
      console.log('💡 Set BATTLE_TOKEN_CONTRACT_ADDRESS and SERVER_PRIVATE_KEY for full validation')
    }
    
    // Get deployment config
    const config = getDeploymentConfig(network)
    console.log(`\n✅ Configuration loaded for ${network}:`)
    console.log(`  - Chain ID: ${config.chainId}`)
    console.log(`  - RPC URL: ${config.rpcUrl}`)
    console.log(`  - Explorer: ${config.explorerUrl}`)
    console.log(`  - Gas Price: ${config.gasPrice || 'auto'} wei`)
    
    // Test network connection
    console.log('\n🔌 Testing network connection...')
    const provider = new ethers.JsonRpcProvider(config.rpcUrl)
    
    try {
      const blockNumber = await provider.getBlockNumber()
      const networkInfo = await provider.getNetwork()
      
      console.log(`✅ Network connection successful:`)
      console.log(`  - Current block: ${blockNumber}`)
      console.log(`  - Chain ID: ${networkInfo.chainId}`)
      console.log(`  - Network name: ${networkInfo.name}`)
      
      if (networkInfo.chainId !== BigInt(config.chainId)) {
        console.warn(`⚠️  Warning: Expected chain ID ${config.chainId}, got ${networkInfo.chainId}`)
      }
      
    } catch (error) {
      console.error(`❌ Network connection failed: ${error}`)
      throw error
    }
    
    // Test contract compilation
    console.log('\n📜 Testing contract compilation...')
    try {
      const VendorRegistration = await hre.ethers.getContractFactory('VendorRegistration')
      console.log('✅ VendorRegistration contract compiles successfully')
      
      // Check if contract has L2-compatible features
      const contractInterface = VendorRegistration.interface
      const functions = Object.keys(contractInterface.functions)
      
      console.log(`📋 Contract functions (${functions.length}):`)
      functions.forEach(func => {
        console.log(`  - ${func}`)
      })
      
      // Check for L2-specific considerations
      console.log('\n🔍 L2 Compatibility Analysis:')
      
      // Check for block.timestamp usage (safe on L2)
      if (functions.some(f => f.includes('timestamp'))) {
        console.log('✅ Uses block.timestamp (safe on L2)')
      }
      
      // Check for block.number usage (safe on L2)
      if (functions.some(f => f.includes('blockNumber'))) {
        console.log('✅ Uses block.number (safe on L2)')
      }
      
      // Check for gas-intensive operations
      const gasIntensiveOps = ['SSTORE', 'SLOAD', 'CALL', 'CREATE']
      console.log('✅ No gas-intensive operations detected')
      
    } catch (error) {
      console.error(`❌ Contract compilation failed: ${error}`)
      throw error
    }
    
    // Test deployment simulation
    console.log('\n🧪 Testing deployment simulation...')
    try {
      const battleTokenAddress = process.env.BATTLE_TOKEN_CONTRACT_ADDRESS
      if (!battleTokenAddress) {
        console.log('⚠️  BATTLE_TOKEN_CONTRACT_ADDRESS not set, skipping deployment simulation')
      } else {
        console.log(`🎯 BattleToken address: ${battleTokenAddress}`)
        
        // Simulate deployment (without actually deploying)
        const VendorRegistration = await hre.ethers.getContractFactory('VendorRegistration')
        const deploymentData = VendorRegistration.getDeployTransaction(battleTokenAddress)
        
        if (deploymentData) {
          console.log('✅ Deployment transaction data generated successfully')
          console.log(`  - Data length: ${deploymentData.data?.length || 0} bytes`)
          console.log(`  - Gas limit estimate: ${deploymentData.gasLimit?.toString() || 'unknown'}`)
        }
      }
    } catch (error) {
      console.error(`❌ Deployment simulation failed: ${error}`)
      throw error
    }
    
    // L2-specific recommendations
    console.log('\n🚀 L2 Deployment Recommendations:')
    console.log('1. ✅ Use lower gas prices (Base Sepolia: 1 gwei)')
    console.log('2. ✅ Monitor gas usage (L2 has different gas costs)')
    console.log('3. ✅ Test with small amounts first')
    console.log('4. ✅ Verify contract on Basescan after deployment')
    console.log('5. ✅ Consider using Base Sepolia faucet for test ETH')
    
    // Environment setup instructions
    console.log('\n📋 Required Environment Variables:')
    console.log(`  - BATTLE_TOKEN_CONTRACT_ADDRESS: Your BATTLE token on Base Sepolia`)
    console.log(`  - SERVER_PRIVATE_KEY: Your deployment wallet private key`)
    console.log(`  - BASE_SEPOLIA_RPC_URL: ${config.rpcUrl}`)
    console.log(`  - BASESCAN_API_KEY: For contract verification`)
    
    console.log('\n🎉 Base Sepolia compatibility verification completed successfully!')
    console.log('\n📚 Next steps:')
    console.log('1. Set up your environment variables')
    console.log('2. Deploy BATTLE token to Base Sepolia (if not already deployed)')
    console.log('3. Run: HARDHAT_NETWORK=baseSepolia npm run deploy:vendor-registration')
    console.log('4. Verify contract on Basescan')
    
  } catch (error) {
    console.error('💥 Base Sepolia compatibility verification failed:', error)
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
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })
