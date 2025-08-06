import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

async function cleanupObsoleteScripts() {
  console.log('🧹 Identifying obsolete scripts after battle_id removal...\n')

  const scriptsDir = path.join(process.cwd(), 'scripts')
  const obsoleteScripts: string[] = []
  const needsUpdateScripts: string[] = []

  // Scripts that should be completely removed
  const removeScripts = [
    'create-battles-table.ts',
    'create-vendor-battles.ts',
    'create-user-battles.ts',
    'create-encoded-battles.ts',
    'add-battles-data.ts',
    'check-battles-table.ts',
    'check-battle-exists.ts',
    'cleanup-battles.ts',
    'create-default-battle.ts',
    'test-user-battle-system.ts',
    'test-encoded-battle-system.ts',
    'test-battle-system-removal.ts',
    'check-battles.ts',
    'modify-votes-table.ts'
  ]

  // Scripts that need updates to remove battle_id references
  const updateScripts = [
    'test-vote-registration.ts',
    'delete-specific-vote.ts',
    'test-vote-system-final.ts',
    'test-voting-real.ts',
    'test-vote-fix.ts',
    'check-existing-votes.ts',
    'test-vote-insertion.ts',
    'debug-vote-insertion.ts',
    'debug-vote-issue.ts',
    'test-multiple-voting-fixed.ts',
    'test-voting-integration.ts',
    'test-multiple-voting-live.ts',
    'test-multiple-votes-fixed.ts',
    'test-vote-fix-final.ts',
    'test-vote-database.ts',
    'clear-test-votes.ts',
    'delete-all-user-votes.ts'
  ]

  console.log('📋 Scripts to be REMOVED (battle system related):')
  removeScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script)
    if (fs.existsSync(scriptPath)) {
      obsoleteScripts.push(script)
      console.log(`   ❌ ${script}`)
    }
  })

  console.log('\n📋 Scripts that need UPDATES (remove battle_id references):')
  updateScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script)
    if (fs.existsSync(scriptPath)) {
      needsUpdateScripts.push(script)
      console.log(`   🔧 ${script}`)
    }
  })

  console.log('\n📊 Summary:')
  console.log(`   • Scripts to remove: ${obsoleteScripts.length}`)
  console.log(`   • Scripts to update: ${needsUpdateScripts.length}`)
  console.log(`   • Total affected: ${obsoleteScripts.length + needsUpdateScripts.length}`)

  console.log('\n💡 Recommendations:')
  console.log('   1. Remove all scripts in the "REMOVED" list')
  console.log('   2. Update scripts in the "UPDATES" list to remove battle_id references')
  console.log('   3. Test the new voting system with test:new-voting script')
  console.log('   4. Update package.json to remove obsolete script commands')

  return {
    obsoleteScripts,
    needsUpdateScripts
  }
}

cleanupObsoleteScripts().catch(console.error) 