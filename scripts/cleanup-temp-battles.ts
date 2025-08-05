#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Script to cleanup old temporary battle IDs
async function cleanupTempBattles() {
  console.log('🧹 Cleaning up old temporary battle IDs...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Get count of temporary battles before cleanup
    const { data: tempBattles, error: countError } = await supabase
      .from('battles')
      .select('id')
      .like('id', 'temp-battle-%')

    if (countError) {
      console.error('❌ Error counting temporary battles:', countError)
      return
    }

    console.log(`📊 Found ${tempBattles.length} temporary battles to clean up`)

    if (tempBattles.length === 0) {
      console.log('✅ No temporary battles to clean up')
      return
    }

    // Delete temporary battles
    const { error: deleteError } = await supabase
      .from('battles')
      .delete()
      .like('id', 'temp-battle-%')

    if (deleteError) {
      console.error('❌ Error deleting temporary battles:', deleteError)
      return
    }

    console.log(`✅ Successfully deleted ${tempBattles.length} temporary battles`)

    // Also clean up the old generic battle ID if it exists
    const { error: deleteGenericError } = await supabase
      .from('battles')
      .delete()
      .eq('id', '99999999-9999-9999-9999-999999999999')

    if (deleteGenericError) {
      console.error('❌ Error deleting generic battle ID:', deleteGenericError)
    } else {
      console.log('✅ Cleaned up old generic battle ID')
    }

    console.log('\n🎉 Temporary battles cleanup completed!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

// Run the cleanup
cleanupTempBattles() 