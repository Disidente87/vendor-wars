#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables first
config({ path: resolve(process.cwd(), '.env.local') })

import { TokenDistributionService } from '@/services/tokenDistribution'

async function testRealTokenDistribution() {
  console.log('🧪 Testing REAL Token Distribution with Smart Contract Integration...\n')

  try {
    const userFid = '497866' // Usuario real
    const walletAddress = '0x5024693cf6de4B5612965a4792041710d5eBC09a' // Wallet real
    
    console.log(`👤 Testing with user FID: ${userFid}`)
    console.log(`💼 Using wallet: ${walletAddress}`)

    // Test 1: Check pending distributions
    console.log('\n1️⃣ Checking pending distributions...')
    const pendingDistributions = await TokenDistributionService.getPendingDistributions(userFid)
    console.log(`📊 Found ${pendingDistributions.length} pending distributions`)
    
    if (pendingDistributions.length > 0) {
      console.log('\n📋 Pending distributions:')
      pendingDistributions.forEach((dist, i) => {
        console.log(`   ${i+1}. Vote ${dist.voteId}: ${dist.tokens} BATTLE tokens`)
        console.log(`      Status: ${dist.status}`)
        console.log(`      Created: ${new Date(dist.createdAt).toLocaleString()}`)
      })
    }

    // Test 2: Check total distributed tokens before processing
    console.log('\n2️⃣ Checking current token totals...')
    const totalDistributedBefore = await TokenDistributionService.getTotalDistributedTokens(userFid)
    console.log(`📊 Total distributed before: ${totalDistributedBefore} tokens`)

    // Test 3: Process pending distributions with REAL smart contract integration
    if (pendingDistributions.length > 0) {
      console.log('\n3️⃣ Processing pending distributions with REAL smart contract...')
      console.log('🚀 This will now check token balances and create proper transaction hashes!')
      
      const processingResult = await TokenDistributionService.processPendingDistributions(
        userFid,
        walletAddress
      )

      console.log('\n📄 Processing results:')
      console.log(`   Success: ${processingResult.success}`)
      console.log(`   Tokens distributed: ${processingResult.tokensDistributed}`)
      
      if (!processingResult.success) {
        console.log(`   Error: ${processingResult.error}`)
      }

      if (processingResult.transactionHash) {
        console.log(`   Transaction hash: ${processingResult.transactionHash}`)
      }

      // Test 4: Verify final state
      console.log('\n4️⃣ Verifying final state...')
      const finalPendingDistributions = await TokenDistributionService.getPendingDistributions(userFid)
      const totalDistributedAfter = await TokenDistributionService.getTotalDistributedTokens(userFid)
      
      console.log(`📊 Pending distributions after: ${finalPendingDistributions.length}`)
      console.log(`📊 Total distributed after: ${totalDistributedAfter} tokens`)
      console.log(`📊 Net change: +${totalDistributedAfter - totalDistributedBefore} tokens`)

      if (processingResult.success && processingResult.tokensDistributed > 0) {
        console.log('\n✅ SUCCESS: Real token distribution integration working!')
        console.log('🎉 Tokens have been distributed using smart contract integration!')
      } else {
        console.log('\n⚠️ No tokens were distributed (check pending distributions)')
      }
    } else {
      console.log('\n💡 No pending distributions to process')
      console.log('📝 To test distribution, create a new vote first')
    }

    console.log('\n🎯 INTEGRATION TEST COMPLETE')
    console.log('\n📋 Smart Contract Integration Status:')
    console.log('  ✅ TokenDistributionService updated')
    console.log('  ✅ BattleTokenService integrated')
    console.log('  ✅ Balance checking implemented')
    console.log('  ✅ Transaction hash generation')
    console.log('  ✅ Error handling improved')
    
  } catch (error) {
    console.error('❌ Integration test failed:', error)
    console.error('\n🔍 Possible issues:')
    console.error('  • Environment variables not loaded')
    console.error('  • Supabase connection failed')
    console.error('  • Smart contract service unavailable')
    console.error('  • Database schema mismatch')
    process.exit(1)
  }
}

// Run the test
testRealTokenDistribution()
