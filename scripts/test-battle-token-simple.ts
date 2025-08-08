#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createPublicClient, http, parseEther, formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'

// Contract ABI - Basic functions only
const BATTLE_TOKEN_ABI = [
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'uint8', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view'
  }
] as const

async function testBattleTokenSimple() {
  console.log('🧪 Testing Battle Token Integration (Simple)...\n')

  try {
    // Get contract address from environment
    const contractAddress = process.env.NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS
    
    if (!contractAddress) {
      throw new Error('NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS is not configured')
    }

    console.log('1️⃣ Contract Configuration:')
    console.log(`Contract Address: ${contractAddress}`)
    console.log(`Chain ID: ${baseSepolia.id}`)
    console.log('✅ Contract configuration loaded\n')

    // Create public client
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })

    // Test 2: Basic Token Information
    console.log('2️⃣ Testing Basic Token Information...')
    
    const name = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'name'
    })
    
    const symbol = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'symbol'
    })
    
    const decimals = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'decimals'
    })
    
    const totalSupply = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'totalSupply'
    })
    
    console.log(`Token Name: ${name}`)
    console.log(`Token Symbol: ${symbol}`)
    console.log(`Token Decimals: ${decimals}`)
    console.log(`Total Supply: ${formatEther(totalSupply)} ${symbol}`)
    console.log('✅ Basic token information retrieved\n')

    // Test 3: Contract Owner
    console.log('3️⃣ Testing Contract Owner...')
    const owner = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: BATTLE_TOKEN_ABI,
      functionName: 'owner'
    })
    console.log(`Contract Owner: ${owner}`)
    console.log('✅ Contract owner retrieved\n')

    // Test 4: Utility Functions
    console.log('4️⃣ Testing Utility Functions...')
    const testAmount = '123.456'
    const parsedAmount = parseEther(testAmount)
    const formattedAmount = formatEther(parsedAmount)
    
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

// Run the test
testBattleTokenSimple()
