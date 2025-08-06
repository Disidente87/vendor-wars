import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Scripts to DELETE (completely obsolete)
const SCRIPTS_TO_DELETE = [
  // Battle system related (obsolete)
  'create-battles-table.ts',
  'create-default-battle.ts',
  'create-encoded-battles.ts',
  'create-generic-battle.ts',
  'create-temp-battles.ts',
  'create-user-battles.ts',
  'create-vendor-battles.ts',
  'test-encoded-battle-system.ts',
  'test-user-battle-system.ts',
  'test-battle-system-removal.ts',
  'check-battles-table.ts',
  'check-battles-schema.ts',
  'check-battle-exists.ts',
  'check-battles.ts',
  'cleanup-battles.ts',
  'cleanup-temp-battles.ts',
  'add-battles-data.ts',
  'add-more-battles.ts',
  
  // Old voting system tests (obsolete)
  'test-vote-registration.ts',
  'test-vote-system-final.ts',
  'test-vote-fix.ts',
  'test-vote-fix-final.ts',
  'test-vote-insertion.ts',
  'test-vote-database.ts',
  'test-voting-real.ts',
  'test-voting-integration.ts',
  'test-multiple-voting-fixed.ts',
  'test-multiple-voting-live.ts',
  'test-multiple-votes-fixed.ts',
  'test-multiple-votes.ts',
  'test-multiple-votes-endpoint.ts',
  'test-voting-system.ts',
  'test-voting-service-fixed.ts',
  'test-voting-with-server.ts',
  'test-voting-fixes.ts',
  'test-voting-logic.ts',
  'test-voting-with-env.ts',
  'test-voting-simple.ts',
  
  // Debug scripts (obsolete)
  'debug-vote-error.ts',
  'debug-vote-issue.ts',
  'debug-vote-insertion.ts',
  'debug-vendor-not-found.ts',
  'debug-routes.ts',
  
  // Old cleanup scripts (obsolete)
  'cleanup-test-votes.ts',
  'cleanup-test-votes-simple.ts',
  'clear-test-votes.ts',
  'delete-specific-vote.ts',
  'delete-all-user-votes.ts',
  'check-existing-votes.ts',
  
  // Old test scripts (obsolete)
  'test-vendor-stats-update.ts',
  'test-vendor-service.ts',
  'test-vendors-api.ts',
  'test-vendor-routes.ts',
  'test-zone-routes.ts',
  'test-vendor-registration.ts',
  'test-vendor-zone-issue.ts',
  'test-vendor-zone-fix.ts',
  'test-frontend-voting.ts',
  'test-ui-fixes.ts',
  'test-all-fixes.ts',
  'test-streak-first-vote-only.ts',
  'test-streak-logic-direct.ts',
  'test-streak-simple.ts',
  'test-streak-via-api.ts',
  'test-streak-increment.ts',
  'test-streak-login.ts',
  'test-no-mock-data.ts',
  'test-unlimited-voting.ts',
  'verify-vote-counting.ts',
  'check-all-vendors.ts',
  'check-vendor-zone-issue.ts',
  'check-voting-tables.ts',
  'check-farcaster-setup.ts',
  'test-supabase-connection.ts',
  'test-supabase.ts',
  
  // Old migration scripts (obsolete)
  'modify-votes-table.ts',
  'create-verification-table.ts',
  'migrate-to-supabase.ts',
  'fix-vendors-migration.ts',
  'update-vendor-stats.ts',
  'update-vendors-zones.ts',
  'add-new-zone.ts',
  'add-more-users.ts',
  
  // Old seed scripts (need updates)
  'seed-database.ts',
  'seed-vendors.ts',
  
  // Old cleanup scripts
  'cleanup-obsolete-scripts.ts'
]

async function cleanupAndSimplify() {
  console.log('🧹 Starting comprehensive script cleanup and simplification...\n')
  
  const scriptsDir = path.join(process.cwd(), 'scripts')
  
  // 1. Delete obsolete scripts
  console.log('🗑️  Deleting obsolete scripts...')
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
  console.log('   📊 Deleted ' + deletedCount + ' obsolete scripts\n')
  
  // 2. Create simplified seed script
  console.log('🌱 Creating simplified seed script...')
  const simplifiedSeedContent = `import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('🌱 Seeding database with simplified schema...')
  
  try {
    // Create zones
    console.log('\\n1️⃣ Creating zones...')
    const zones = [
      { id: '1', name: 'Centro', description: 'Centro histórico', color: '#FF6B6B' },
      { id: '2', name: 'Roma', description: 'Colonia Roma', color: '#4ECDC4' },
      { id: '3', name: 'Condesa', description: 'Colonia Condesa', color: '#45B7D1' }
    ]
    
    for (const zone of zones) {
      const { error } = await supabase
        .from('zones')
        .upsert(zone, { onConflict: 'id' })
      
      if (error) {
        console.log('   ⚠️ Zone ' + zone.name + ': ' + error.message)
      } else {
        console.log('   ✅ Zone ' + zone.name + ' created/updated')
      }
    }
    
    // Create users
    console.log('\\n2️⃣ Creating users...')
    const users = [
      {
        fid: 123456,
        username: 'maria_vendor',
        display_name: 'María González',
        avatar_url: { url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop&crop=face' },
        battle_tokens: 100,
        vote_streak: 5
      },
      {
        fid: 789012,
        username: 'juan_vendor',
        display_name: 'Juan Pérez',
        avatar_url: { url: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=100&h=100&fit=crop&crop=face' },
        battle_tokens: 75,
        vote_streak: 3
      }
    ]
    
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'fid' })
      
      if (error) {
        console.log('   ⚠️ User ' + user.username + ': ' + error.message)
      } else {
        console.log('   ✅ User ' + user.username + ' created/updated')
      }
    }
    
    // Create vendors
    console.log('\\n3️⃣ Creating vendors...')
    const vendors = [
      {
        id: '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
        name: 'Pupusas María',
        description: 'Las mejores pupusas de la ciudad',
        category: 'pupusas',
        zone_id: '1',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        total_votes: 0,
        verified_votes: 0
      },
      {
        id: '222f3776-b7c4-4ee0-80e1-5ca89e8ea9d1',
        name: 'Tacos El Güero',
        description: 'Tacos auténticos mexicanos',
        category: 'tacos',
        zone_id: '2',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        total_votes: 0,
        verified_votes: 0
      }
    ]
    
    for (const vendor of vendors) {
      const { error } = await supabase
        .from('vendors')
        .upsert(vendor, { onConflict: 'id' })
      
      if (error) {
        console.log('   ⚠️ Vendor ' + vendor.name + ': ' + error.message)
      } else {
        console.log('   ✅ Vendor ' + vendor.name + ' created/updated')
      }
    }
    
    console.log('\\n🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

seedDatabase()
`
  
  fs.writeFileSync(path.join(scriptsDir, 'seed-simplified.ts'), simplifiedSeedContent)
  console.log('   ✅ Created: seed-simplified.ts\n')
  
  // 3. Create comprehensive test script
  console.log('🧪 Creating comprehensive test script...')
  const comprehensiveTestContent = `import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function comprehensiveTest() {
  console.log('🧪 Running comprehensive system test...')
  
  try {
    // Test database connection
    console.log('\\n1️⃣ Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('   ❌ Database connection failed: ' + testError.message)
      return
    }
    console.log('   ✅ Database connection successful')
    
    // Test table structure
    console.log('\\n2️⃣ Testing table structure...')
    const tables = ['users', 'vendors', 'votes', 'zones']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log('   ❌ Table ' + table + ': ' + error.message)
      } else {
        console.log('   ✅ Table ' + table + ': accessible')
      }
    }
    
    // Test voting system
    console.log('\\n3️⃣ Testing voting system...')
    const testUserFid = Math.floor(Math.random() * 1000000) + 100000
    const testVendorId = '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0'
    
    // Create test user
    const { error: createUserError } = await supabase
      .from('users')
      .insert({
        fid: testUserFid,
        username: 'test_user',
        display_name: 'Test User',
        avatar_url: { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test' },
        battle_tokens: 0,
        vote_streak: 0
      })
    
    if (createUserError) {
      console.log('   ⚠️ Test user creation: ' + createUserError.message)
    } else {
      console.log('   ✅ Test user created')
    }
    
    // Test vote insertion
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .insert({
        voter_fid: testUserFid,
        vendor_id: testVendorId,
        vote_date: new Date().toISOString().split('T')[0],
        is_verified: true,
        token_reward: 10,
        multiplier: 1,
        reason: 'Test vote'
      })
      .select('*')
      .single()
    
    if (voteError) {
      console.log('   ❌ Vote insertion failed: ' + voteError.message)
    } else {
      console.log('   ✅ Vote inserted successfully: ' + voteData.id)
    }
    
    // Cleanup test data
    console.log('\\n4️⃣ Cleaning up test data...')
    await supabase.from('votes').delete().eq('voter_fid', testUserFid)
    await supabase.from('users').delete().eq('fid', testUserFid)
    console.log('   ✅ Test data cleaned up')
    
    console.log('\\n🎉 Comprehensive test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in comprehensive test:', error)
  }
}

comprehensiveTest()
`
  
  fs.writeFileSync(path.join(scriptsDir, 'test-comprehensive.ts'), comprehensiveTestContent)
  console.log('   ✅ Created: test-comprehensive.ts\n')
  
  console.log('📊 Summary:')
  console.log('   🗑️  Deleted: ' + deletedCount + ' obsolete scripts')
  console.log('   🌱 Created: 2 new simplified scripts')
  
  console.log('\\n🎉 Script cleanup and simplification completed!')
  console.log('\\n📋 Next steps:')
  console.log('   1. Run: npm run seed:simplified')
  console.log('   2. Run: npm run test:comprehensive')
  console.log('   3. Test the voting system in Farcaster')
}

cleanupAndSimplify() 