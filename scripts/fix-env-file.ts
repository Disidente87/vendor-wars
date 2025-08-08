#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function fixEnvFile() {
  console.log('🔧 Fixing .env.local file format...')
  
  try {
    const envPath = join(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf8')
    
    // Fix the malformed line
    let fixedContent = content
      .replace(
        /BASESCAN_API_KEY=MHJ6AXHCK9CP23YJI3AFGHP1JJC964WUPDNEXT_PUBLIC_BATTLE_TOKEN_ADDRESS=0xDa6884d4F2E68b9700678139B617607560f70Cc3\nNEXT_PUBLIC_BATTLE_TOKEN_ADDRESS=0xDa6884d4F2E68b9700678139B617607560f70Cc3/,
        'BASESCAN_API_KEY=MHJ6AXHCK9CP23YJI3AFGHP1JJC964WUPD\n\n# Smart Contract Configuration\nNEXT_PUBLIC_BATTLE_TOKEN_ADDRESS=0xDa6884d4F2E68b9700678139B617607560f70Cc3'
      )
    
    writeFileSync(envPath, fixedContent)
    console.log('✅ .env.local file fixed successfully!')
    
    // Verify the fix
    const newContent = readFileSync(envPath, 'utf8')
    const hasBattleToken = newContent.includes('NEXT_PUBLIC_BATTLE_TOKEN_ADDRESS=0xDa6884d4F2E68b9700678139B617607560f70Cc3')
    
    if (hasBattleToken) {
      console.log('✅ Battle Token address found in .env.local')
    } else {
      console.log('❌ Battle Token address not found in .env.local')
    }
    
  } catch (error) {
    console.error('❌ Error fixing .env.local:', error)
    process.exit(1)
  }
}

// Run the fix
fixEnvFile()
