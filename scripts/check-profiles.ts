import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function checkProfiles() {
  console.log('🔍 Checking for profiling files...\n')

  const projectRoot = process.cwd()
  let foundFiles = []

  try {
    // 1. Check project root for profiling files
    console.log('1️⃣ Checking project root...')
    const rootFiles = fs.readdirSync(projectRoot)
    
    for (const file of rootFiles) {
      if (file.endsWith('.cpuprofile') || 
          file.endsWith('.heapprofile') || 
          file.endsWith('.heapsnapshot') ||
          file.startsWith('performance-') ||
          file.startsWith('trace-') ||
          file.includes('sampling-profile')) {
        
        const filePath = path.join(projectRoot, file)
        const stats = fs.statSync(filePath)
        foundFiles.push({
          path: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        })
        console.log(`   ⚠️  Found: ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
      }
    }

    // 2. Check .next directory
    console.log('\n2️⃣ Checking .next directory...')
    const nextPath = path.join(projectRoot, '.next')
    if (fs.existsSync(nextPath)) {
      const nextFiles = fs.readdirSync(nextPath)
      
      for (const file of nextFiles) {
        if (file === 'trace' || file === 'profiling') {
          const dirPath = path.join(nextPath, file)
          if (fs.existsSync(dirPath)) {
            const stats = fs.statSync(dirPath)
            foundFiles.push({
              path: `.next/${file}`,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime
            })
            console.log(`   ⚠️  Found: .next/${file} directory`)
          }
        }
      }
    }

    // 3. Check for any files with 'sampling-profile' in the name
    console.log('\n3️⃣ Checking for sampling-profile files...')
    const allFiles = getAllFiles(projectRoot)
    
    for (const file of allFiles) {
      if (file.includes('sampling-profile') || file.includes('cpuprofile')) {
        const relativePath = path.relative(projectRoot, file)
        const stats = fs.statSync(file)
        foundFiles.push({
          path: relativePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        })
        console.log(`   ⚠️  Found: ${relativePath} (${(stats.size / 1024).toFixed(2)} KB)`)
      }
    }

    // Summary
    console.log('\n📊 Summary:')
    if (foundFiles.length === 0) {
      console.log('✅ No profiling files found')
    } else {
      console.log(`⚠️  Found ${foundFiles.length} profiling files:`)
      foundFiles.forEach(file => {
        console.log(`   - ${file.path} (${(file.size / 1024).toFixed(2)} KB)`)
      })
      
      console.log('\n🧹 To clean these files, run:')
      console.log('   npm run cleanup:profiles')
    }

    // Check Next.js configuration
    console.log('\n4️⃣ Checking Next.js configuration...')
    const configPath = path.join(projectRoot, 'next.config.ts')
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8')
      if (configContent.includes('instrumentationHook: false')) {
        console.log('   ✅ Profiling disabled in next.config.ts')
      } else {
        console.log('   ⚠️  Profiling not explicitly disabled in next.config.ts')
      }
    }

  } catch (error) {
    console.error('❌ Error checking for profiling files:', error)
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git' && !file.startsWith('.')) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
      }
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

checkProfiles().catch(console.error) 