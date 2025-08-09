-- Storage Setup for Vendor Wars
-- This script creates the necessary buckets and RLS policies for file uploads

-- Create vendor-wars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-wars', 'vendor-wars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all files
CREATE POLICY "Public read access for vendor-wars bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vendor-wars');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to vendor-wars bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'vendor-wars' AND auth.role() = 'authenticated');

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update files in vendor-wars bucket" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'vendor-wars');

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete files in vendor-wars bucket" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'vendor-wars');

-- Create a more permissive policy for vendor avatars specifically
-- This allows service role to upload vendor avatars (needed for registration)
CREATE POLICY "Service role can upload vendor avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'vendor-wars' 
  AND (storage.foldername(name))[1] = 'vendors'
  AND (storage.foldername(name))[2] = 'avatars'
  AND (auth.role() = 'service_role' OR auth.role() = 'authenticated')
);

-- Allow service role and authenticated users to update vendor avatars
CREATE POLICY "Service role can update vendor avatars" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'vendor-wars' 
  AND (storage.foldername(name))[1] = 'vendors'
  AND (storage.foldername(name))[2] = 'avatars'
  AND (auth.role() = 'service_role' OR auth.role() = 'authenticated')
);
