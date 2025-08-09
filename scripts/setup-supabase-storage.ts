import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for Vendor Wars...')

  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return
    }

    const vendorWarsBucket = buckets.find(bucket => bucket.id === 'vendor-wars')

    if (!vendorWarsBucket) {
      console.log('📦 Creating vendor-wars bucket...')
      
      // Create bucket
      const { data: bucket, error: createError } = await supabase
        .storage
        .createBucket('vendor-wars', {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 2097152 // 2MB
        })

      if (createError) {
        console.error('❌ Error creating bucket:', createError)
        return
      }

      console.log('✅ Bucket created successfully')
    } else {
      console.log('✅ Bucket already exists')
    }

    // Execute SQL to set up RLS policies
    console.log('🔐 Setting up RLS policies...')
    
    const sqlFile = join(process.cwd(), 'supabase', 'storage-setup.sql')
    const sql = readFileSync(sqlFile, 'utf-8')

    // Split SQL statements and execute them one by one
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'))

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error && !error.message.includes('already exists')) {
        console.warn('⚠️ SQL execution warning:', error.message)
      }
    }

    console.log('✅ RLS policies configured')

    // Test upload
    console.log('🧪 Testing file upload...')
    
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    const testPath = 'test/test-file.txt'

    const { error: uploadError } = await supabase
      .storage
      .from('vendor-wars')
      .upload(testPath, testFile)

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError)
    } else {
      console.log('✅ Test upload successful')
      
      // Clean up test file
      await supabase
        .storage
        .from('vendor-wars')
        .remove([testPath])
    }

    console.log('🎉 Supabase Storage setup completed!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run setup
setupStorage()
