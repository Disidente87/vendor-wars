#!/usr/bin/env tsx

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const RPC_URLS = [
  'https://sepolia.base.org',
  'https://base-sepolia.drpc.org', 
  'https://base-sepolia.publicnode.com'
]

async function testRPC(rpcUrl: string) {
  console.log(`\n🔍 Testing RPC: ${rpcUrl}`)
  console.log('=' .repeat(50))
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    })
    
    // Test 1: Get block number
    console.log('📦 Testing eth_blockNumber...')
    const blockNumber = await client.getBlockNumber()
    console.log(`✅ Block number: ${blockNumber}`)
    
    // Test 2: Get gas price
    console.log('⛽ Testing eth_gasPrice...')
    const gasPrice = await client.getGasPrice()
    console.log(`✅ Gas price: ${gasPrice} wei`)
    
    // Test 3: Get chain ID
    console.log('🔗 Testing eth_chainId...')
    const chainId = await client.getChainId()
    console.log(`✅ Chain ID: ${chainId}`)
    
    // Test 4: Get transaction count (nonce)
    console.log('🔢 Testing eth_getTransactionCount...')
    const testAddress = '0x0000000000000000000000000000000000000000'
    const txCount = await client.getTransactionCount({ address: testAddress as `0x${string}` })
    console.log(`✅ Transaction count for ${testAddress}: ${txCount}`)
    
    // Test 5: Get balance
    console.log('💰 Testing eth_getBalance...')
    const balance = await client.getBalance({ address: testAddress as `0x${string}` })
    console.log(`✅ Balance for ${testAddress}: ${balance} wei`)
    
    // Test 6: Estimate gas (simulate a call)
    console.log('📊 Testing eth_estimateGas...')
    try {
      const estimatedGas = await client.estimateGas({
        to: testAddress as `0x${string}`,
        data: '0x'
      })
      console.log(`✅ Estimated gas: ${estimatedGas}`)
    } catch (gasError) {
      console.log(`⚠️ Gas estimation failed (expected for empty address): ${gasError}`)
    }
    
    console.log('✅ RPC is fully functional!')
    return true
    
  } catch (error) {
    console.error(`❌ RPC test failed:`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Testing Base Sepolia RPC Connectivity')
  console.log('=' .repeat(60))
  
  const results = []
  
  for (const rpcUrl of RPC_URLS) {
    const success = await testRPC(rpcUrl)
    results.push({ rpcUrl, success })
  }
  
  console.log('\n📊 Test Results Summary')
  console.log('=' .repeat(30))
  
  results.forEach(({ rpcUrl, success }) => {
    const status = success ? '✅ WORKING' : '❌ FAILED'
    console.log(`${status} - ${rpcUrl}`)
  })
  
  const workingRPCs = results.filter(r => r.success)
  if (workingRPCs.length > 0) {
    console.log(`\n🎉 ${workingRPCs.length} RPC(s) are working!`)
    console.log('💡 Recommended RPC:', workingRPCs[0].rpcUrl)
  } else {
    console.log('\n⚠️ No RPCs are working. Check your internet connection.')
  }
}

main().catch(console.error)
