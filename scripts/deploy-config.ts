#!/usr/bin/env tsx

/**
 * Deployment Configuration
 * 
 * This file contains configuration for different network deployments
 * of the VendorRegistration contract.
 */

export interface DeploymentConfig {
  network: string
  rpcUrl: string
  chainId: number
  explorerUrl: string
  gasPrice?: string
  confirmations: number
}

export const deploymentConfigs: Record<string, DeploymentConfig> = {
  // Local development
  hardhat: {
    network: 'hardhat',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    explorerUrl: '',
    gasPrice: undefined, // Auto
    confirmations: 1
  },
  
  // Base Sepolia testnet (L2)
  baseSepolia: {
    network: 'baseSepolia',
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    chainId: 84532,
    explorerUrl: 'https://sepolia.basescan.org',
    gasPrice: '1000000000', // 1 gwei (Base Sepolia has lower gas)
    confirmations: 3
  }
}

export function getDeploymentConfig(network: string): DeploymentConfig {
  const config = deploymentConfigs[network]
  if (!config) {
    throw new Error(`Unknown network: ${network}. Available networks: ${Object.keys(deploymentConfigs).join(', ')}`)
  }
  return config
}

export function validateEnvironment(network: string): void {
  const config = getDeploymentConfig(network)
  
  // Check required environment variables
  const requiredVars = ['BATTLE_TOKEN_CONTRACT_ADDRESS']
  
  if (network !== 'hardhat') {
    requiredVars.push('SERVER_PRIVATE_KEY')
  }
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables for ${network}: ${missing.join(', ')}`)
  }
  
  console.log(`✅ Environment validated for ${network} network`)
  console.log(`🌐 RPC URL: ${config.rpcUrl}`)
  console.log(`🔗 Explorer: ${config.explorerUrl}`)
  console.log(`⛽ Gas Price: ${config.gasPrice || 'auto'}`)
  console.log(`✅ Confirmations: ${config.confirmations}`)
  
  // Special notes for L2 networks
  if (network === 'baseSepolia') {
    console.log(`🚀 L2 Network: ${network} (Optimism-based)`)
    console.log(`💰 Lower gas costs compared to Ethereum L1`)
    console.log(`⚡ Faster finality and better scalability`)
  }
}

export function getGasSettings(network: string) {
  const config = getDeploymentConfig(network)
  
  if (config.gasPrice) {
    return {
      gasPrice: config.gasPrice
    }
  }
  
  return {}
}
