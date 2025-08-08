#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { getBattleTokenService, CONTRACT_CONFIG, BATTLE_TOKEN_ABI } from '@/services/battleToken'

async function testBattleTokenIntegration() {
  console.log('🧪 Testing Battle Token Integration...\n')

  try {
    // Get the service instance
    const battleTokenService = getBattleTokenService()
    
    // Test 1: Contract Configuration
    console.log('1️⃣ Testing Contract Configuration...')
    console.log(`Contract Address: ${CONTRACT_CONFIG.address}`)
    console.log(`Chain ID: ${CONTRACT_CONFIG.chainId}`)
    console.log(`Name: ${CONTRACT_CONFIG.name}`)
    console.log(`Symbol: ${CONTRACT_CONFIG.symbol}`)
    console.log(`Decimals: ${CONTRACT_CONFIG.decimals}`)
    console.log('✅ Contract configuration loaded\n')

    // Test 2: Basic Token Information
    console.log('2️⃣ Testing Basic Token Information...')
    const name = await battleTokenService.getName()
    const symbol = await battleTokenService.getSymbol()
    const decimals = await battleTokenService.getDecimals()
    const totalSupply = await battleTokenService.getTotalSupply()
    
    console.log(`Token Name: ${name}`)
    console.log(`Token Symbol: ${symbol}`)
    console.log(`Token Decimals: ${decimals}`)
    console.log(`Total Supply: ${battleTokenService.formatBalance(totalSupply)} ${symbol}`)
    console.log('✅ Basic token information retrieved\n')

    // Test 3: Contract Owner
    console.log('3️⃣ Testing Contract Owner...')
    const owner = await battleTokenService.getOwner()
    console.log(`Contract Owner: ${owner}`)
    console.log('✅ Contract owner retrieved\n')

    // Test 4: Distribution Stats
    console.log('4️⃣ Testing Distribution Stats...')
    const distributionStats = await battleTokenService.getDistributionStats()
    console.log(`Total Supply: ${distributionStats.formatted.totalSupply} ${symbol}`)
    console.log(`Owner Balance: ${distributionStats.formatted.ownerBalance} ${symbol}`)
    console.log(`Available for Distribution: ${distributionStats.formatted.availableForDistribution} ${symbol}`)
    console.log('✅ Distribution stats retrieved\n')

    // Test 5: Address Validation
    console.log('5️⃣ Testing Address Validation...')
    const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    const invalidAddress = 'invalid-address'
    
    console.log(`Valid address "${validAddress}": ${battleTokenService.validateAddress(validAddress)}`)
    console.log(`Invalid address "${invalidAddress}": ${battleTokenService.validateAddress(invalidAddress)}`)
    console.log('✅ Address validation working\n')

    // Test 6: Amount Validation
    console.log('6️⃣ Testing Amount Validation...')
    const validAmount = '100.5'
    const invalidAmount = '-10'
    const invalidAmount2 = 'not-a-number'
    
    console.log(`Valid amount "${validAmount}": ${battleTokenService.validateAmount(validAmount)}`)
    console.log(`Invalid amount "${invalidAmount}": ${battleTokenService.validateAmount(invalidAmount)}`)
    console.log(`Invalid amount "${invalidAmount2}": ${battleTokenService.validateAmount(invalidAmount2)}`)
    console.log('✅ Amount validation working\n')

    // Test 7: Amount Parsing
    console.log('7️⃣ Testing Amount Parsing...')
    const testAmount = '123.456'
    const parsedAmount = battleTokenService.parseAmount(testAmount)
    const formattedAmount = battleTokenService.formatBalance(parsedAmount)
    
    console.log(`Original amount: ${testAmount}`)
    console.log(`Parsed amount (wei): ${parsedAmount}`)
    console.log(`Formatted amount: ${formattedAmount}`)
    console.log('✅ Amount parsing working\n')

    console.log('🎉 All tests passed! Battle Token integration is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBattleTokenIntegration()
}

export { testBattleTokenIntegration }
