import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createVerificationTable() {
  console.log('Creating vendor_verifications table...')

  try {
    // Create the vendor_verifications table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vendor_verifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
          owner_fid TEXT NOT NULL,
          business_license TEXT,
          location_photo TEXT,
          social_media TEXT,
          receipt TEXT,
          community_vouch TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          reviewer_fid TEXT,
          reviewer_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_vendor_verifications_vendor_id ON vendor_verifications(vendor_id);
        CREATE INDEX IF NOT EXISTS idx_vendor_verifications_status ON vendor_verifications(status);
        CREATE INDEX IF NOT EXISTS idx_vendor_verifications_owner_fid ON vendor_verifications(owner_fid);

        -- Add RLS policies
        ALTER TABLE vendor_verifications ENABLE ROW LEVEL SECURITY;

        -- Policy: Users can view their own verifications
        CREATE POLICY "Users can view own verifications" ON vendor_verifications
          FOR SELECT USING (owner_fid = auth.jwt() ->> 'sub');

        -- Policy: Users can insert their own verifications
        CREATE POLICY "Users can insert own verifications" ON vendor_verifications
          FOR INSERT WITH CHECK (owner_fid = auth.jwt() ->> 'sub');

        -- Policy: Users can update their own pending verifications
        CREATE POLICY "Users can update own pending verifications" ON vendor_verifications
          FOR UPDATE USING (owner_fid = auth.jwt() ->> 'sub' AND status = 'pending');

        -- Policy: Admins can view all verifications (you'll need to implement admin check)
        CREATE POLICY "Admins can view all verifications" ON vendor_verifications
          FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

        -- Add updated_at trigger
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_vendor_verifications_updated_at 
          BEFORE UPDATE ON vendor_verifications 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (error) {
      console.error('Error creating vendor_verifications table:', error)
      return
    }

    console.log('✅ vendor_verifications table created successfully!')
    console.log('✅ Indexes created successfully!')
    console.log('✅ RLS policies created successfully!')
    console.log('✅ Triggers created successfully!')

  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the script
createVerificationTable()
  .then(() => {
    console.log('Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 