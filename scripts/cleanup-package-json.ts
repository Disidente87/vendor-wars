import fs from 'fs'
import path from 'path'

async function cleanupPackageJson() {
  console.log('🧹 Cleaning up package.json scripts...\n')
  
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found')
    return
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const scriptsDir = path.join(process.cwd(), 'scripts')
    
    // Get list of existing script files
    const existingScripts = fs.readdirSync(scriptsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .map(file => file.replace('.ts', '').replace('.js', ''))
    
    console.log('📁 Existing script files:')
    existingScripts.forEach(script => console.log('   - ' + script))
    console.log()
    
    // Scripts to keep (essential)
    const scriptsToKeep = [
      'dev',
      'build',
      'build:raw',
      'start',
      'lint',
      'deploy:vercel',
      'deploy:raw',
      'cleanup',
      'seed:simplified',
      'test:comprehensive',
      'cleanup:scripts',
      'cleanup:all-tests',
      'cleanup:package-json'
    ]
    
    // Remove scripts that reference non-existent files
    const scriptsToRemove: string[] = []
    
    Object.keys(packageJson.scripts).forEach(scriptName => {
      const scriptValue = packageJson.scripts[scriptName]
      
      // Check if it references a script file
      if (scriptValue.includes('scripts/')) {
        // Extract the script filename
        const match = scriptValue.match(/scripts\/([^.]+)\.(ts|js)/)
        if (match) {
          const scriptFile = match[1]
          
          // If the script file doesn't exist and it's not in the keep list
          if (!existingScripts.includes(scriptFile) && !scriptsToKeep.includes(scriptName)) {
            scriptsToRemove.push(scriptName)
          }
        }
      }
    })
    
    console.log('🗑️  Removing scripts that reference non-existent files:')
    scriptsToRemove.forEach(script => {
      console.log('   ❌ Removing: ' + script)
      delete packageJson.scripts[script]
    })
    
    // Save the cleaned package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    
    console.log('\n📊 Summary:')
    console.log('   🗑️  Removed: ' + scriptsToRemove.length + ' obsolete script references')
    console.log('   ✅ package.json cleaned up')
    
    console.log('\n📋 Remaining scripts:')
    Object.keys(packageJson.scripts).forEach(script => {
      console.log('   ✅ ' + script)
    })
    
  } catch (error) {
    console.error('❌ Error cleaning up package.json:', error)
  }
}

cleanupPackageJson() 