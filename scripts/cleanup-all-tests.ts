import fs from 'fs'
import path from 'path'

// Scripts to KEEP (essential functionality)
const SCRIPTS_TO_KEEP = [
  'dev.js',
  'deploy.ts',
  'setup-supabase.ts',
  'check-database-status.ts',
  'cleanup.js',
  'seed-simplified.ts',
  'test-comprehensive.ts',
  'cleanup-and-simplify.ts'
]

// Scripts to DELETE (all specific tests and utilities)
const SCRIPTS_TO_DELETE = [
  // Test scripts
  'test-voting-without-redis.ts',
  'test-voting-admin.ts',
  'test-new-voting-system.ts',
  'test-simple-vote.ts',
  
  // Check scripts
  'check-users-schema.ts',
  'check-vendors-schema.ts',
  'check-rls-policies.ts',
  'check-profiles.ts',
  
  // Cleanup scripts
  'cleanup-test-votes-admin.ts',
  'cleanup-profiles.ts',
  
  // Utility scripts
  'clear-redis-cache.ts',
  'reset-tokens-db.ts',
  'sync-tokens-redis-db.ts'
]

async function cleanupAllTests() {
  console.log('🧹 Removing all specific test scripts for on-demand approach...\n')
  
  const scriptsDir = path.join(process.cwd(), 'scripts')
  
  // 1. Delete all specific test scripts
  console.log('🗑️  Deleting specific test scripts...')
  let deletedCount = 0
  for (const script of SCRIPTS_TO_DELETE) {
    const scriptPath = path.join(scriptsDir, script)
    if (fs.existsSync(scriptPath)) {
      try {
        fs.unlinkSync(scriptPath)
        console.log('   ✅ Deleted: ' + script)
        deletedCount++
      } catch (error) {
        console.log('   ❌ Failed to delete: ' + script)
      }
    }
  }
  console.log('   📊 Deleted ' + deletedCount + ' specific test scripts\n')
  
  // 2. Create a template for on-demand test generation
  console.log('📝 Creating test template for on-demand generation...')
  const testTemplateContent = `import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function specificTest() {
  console.log('🧪 Running specific test...')
  
  try {
    // TODO: Add your specific test logic here
    
    console.log('\\n🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in test:', error)
  }
}

specificTest()
`
  
  fs.writeFileSync(path.join(scriptsDir, 'test-template.ts'), testTemplateContent)
  console.log('   ✅ Created: test-template.ts\n')
  
  // 3. Create a README for test generation
  console.log('📖 Creating test generation guide...')
  const readmeContent = `# Scripts de Test - Enfoque On-Demand

## 🎯 Filosofía

En lugar de mantener muchos scripts de test específicos, generamos scripts de test según sea necesario para casos específicos.

## 📁 Scripts Esenciales

- \`dev.js\` - Servidor de desarrollo
- \`deploy.ts\` - Despliegue a producción
- \`setup-supabase.ts\` - Configuración inicial de Supabase
- \`check-database-status.ts\` - Verificación de estado de la DB
- \`seed-simplified.ts\` - Seed de base de datos
- \`test-comprehensive.ts\` - Test comprehensivo del sistema
- \`test-template.ts\` - Plantilla para nuevos tests

## 🚀 Generando Tests Específicos

### 1. Usar la plantilla
\`\`\`bash
cp scripts/test-template.ts scripts/test-[caso-especifico].ts
\`\`\`

### 2. Agregar al package.json
\`\`\`json
{
  "scripts": {
    "test:[caso-especifico]": "npx tsx scripts/test-[caso-especifico].ts"
  }
}
\`\`\`

### 3. Ejecutar el test
\`\`\`bash
npm run test:[caso-especifico]
\`\`\`

## 📋 Casos Comunes

### Test de Votación
- Verificar inserción de votos
- Probar restricciones únicas
- Validar actualización de estadísticas

### Test de Esquema
- Verificar estructura de tablas
- Validar tipos de datos
- Comprobar restricciones

### Test de Integración
- Probar flujo completo de votación
- Validar sincronización Redis-DB
- Verificar manejo de errores

## 🧹 Limpieza

Después de resolver un problema específico, puedes eliminar el script de test temporal:

\`\`\`bash
rm scripts/test-[caso-especifico].ts
\`\`\`

Y remover la entrada del package.json.

## 💡 Beneficios

- ✅ Código más limpio
- ✅ Mantenimiento más fácil
- ✅ Tests específicos para cada problema
- ✅ Sin scripts obsoletos
- ✅ Enfoque más ágil
`
  
  fs.writeFileSync(path.join(scriptsDir, 'README.md'), readmeContent)
  console.log('   ✅ Created: README.md\n')
  
  console.log('📊 Summary:')
  console.log('   🗑️  Deleted: ' + deletedCount + ' specific test scripts')
  console.log('   📝 Created: test-template.ts for on-demand generation')
  console.log('   📖 Created: README.md with guidelines')
  
  console.log('\\n🎉 Cleanup completed! Now using on-demand test approach.')
  console.log('\\n📋 Next time you need a specific test:')
  console.log('   1. Copy test-template.ts to a new file')
  console.log('   2. Add your specific test logic')
  console.log('   3. Add script to package.json')
  console.log('   4. Run the test')
  console.log('   5. Delete when done')
}

cleanupAllTests() 