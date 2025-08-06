import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function cleanupProfiles() {
  console.log('🧹 Cleaning up profiling files...\n')

  const projectRoot = process.cwd()
  const filesToClean = [
    // Next.js profiling files
    '.next/cache',
    '.next/server',
    '.next/static',
    
    // CPU profile files
    '*.cpuprofile',
    '*.heapprofile',
    '*.heapsnapshot',
    
    // Performance files
    'performance-*.json',
    'trace-*.json',
    
    // Temporary files
    '.next/trace',
    '.next/profiling',
  ]

  let cleanedCount = 0

  try {
    // 1. Clean .next directory cache
    const nextCachePath = path.join(projectRoot, '.next', 'cache')
    if (fs.existsSync(nextCachePath)) {
      console.log('1️⃣ Cleaning Next.js cache...')
      fs.rmSync(nextCachePath, { recursive: true, force: true })
      console.log('   ✅ Next.js cache cleaned')
      cleanedCount++
    }

    // 2. Clean profiling files in project root
    console.log('2️⃣ Looking for profiling files...')
    const rootFiles = fs.readdirSync(projectRoot)
    
    for (const file of rootFiles) {
      if (file.endsWith('.cpuprofile') || 
          file.endsWith('.heapprofile') || 
          file.endsWith('.heapsnapshot') ||
          file.startsWith('performance-') ||
          file.startsWith('trace-')) {
        
        const filePath = path.join(projectRoot, file)
        fs.unlinkSync(filePath)
        console.log(`   ✅ Deleted: ${file}`)
        cleanedCount++
      }
    }

    // 3. Clean .next/trace directory if it exists
    const tracePath = path.join(projectRoot, '.next', 'trace')
    if (fs.existsSync(tracePath)) {
      console.log('3️⃣ Cleaning trace directory...')
      fs.rmSync(tracePath, { recursive: true, force: true })
      console.log('   ✅ Trace directory cleaned')
      cleanedCount++
    }

    // 4. Clean .next/profiling directory if it exists
    const profilingPath = path.join(projectRoot, '.next', 'profiling')
    if (fs.existsSync(profilingPath)) {
      console.log('4️⃣ Cleaning profiling directory...')
      fs.rmSync(profilingPath, { recursive: true, force: true })
      console.log('   ✅ Profiling directory cleaned')
      cleanedCount++
    }

    console.log(`\n🎉 Cleanup complete! ${cleanedCount} items cleaned`)
    
    if (cleanedCount === 0) {
      console.log('✅ No profiling files found to clean')
    }

    console.log('\n📝 To prevent future profiling files:')
    console.log('   - The next.config.ts has been updated to disable profiling')
    console.log('   - Restart your development server: npm run dev')
    console.log('   - If files still appear, run this script again')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

cleanupProfiles().catch(console.error) 