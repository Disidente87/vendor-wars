-- Create vendor_reviews table (normalized approach)
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 500),
  tokens_paid INTEGER NOT NULL DEFAULT 15,
  payment_transaction_hash TEXT,
  review_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_user_fid ON vendor_reviews(user_fid);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_created_at ON vendor_reviews(created_at DESC);

-- Create unique constraint to prevent duplicate reviews from same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_reviews_unique_user_vendor 
ON vendor_reviews(vendor_id, user_fid);

-- Add foreign key constraint to vendors table (if it exists)
-- Note: This will only work if the vendors table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
    ALTER TABLE vendor_reviews 
    ADD CONSTRAINT fk_vendor_reviews_vendor_id 
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add RLS (Row Level Security) policies
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all reviews
CREATE POLICY "Allow read access to all reviews" ON vendor_reviews
  FOR SELECT USING (true);

-- Policy to allow users to insert their own reviews
CREATE POLICY "Allow users to insert their own reviews" ON vendor_reviews
  FOR INSERT WITH CHECK (
    user_fid = (auth.jwt() ->> 'fid')::bigint
  );

-- Policy to allow users to update their own reviews (if needed)
CREATE POLICY "Allow users to update their own reviews" ON vendor_reviews
  FOR UPDATE USING (
    user_fid = (auth.jwt() ->> 'fid')::bigint
  );

-- Policy to allow users to delete their own reviews (if needed)
CREATE POLICY "Allow users to delete their own reviews" ON vendor_reviews
  FOR DELETE USING (
    user_fid = (auth.jwt() ->> 'fid')::bigint
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vendor_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_vendor_reviews_updated_at
  BEFORE UPDATE ON vendor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_reviews_updated_at();

-- Add comments for documentation
COMMENT ON TABLE vendor_reviews IS 'Stores user reviews for vendors with payment verification';
COMMENT ON COLUMN vendor_reviews.vendor_id IS 'ID of the vendor being reviewed';
COMMENT ON COLUMN vendor_reviews.user_fid IS 'Farcaster ID of the user who wrote the review';
COMMENT ON COLUMN vendor_reviews.content IS 'Review content (10-500 characters)';
COMMENT ON COLUMN vendor_reviews.tokens_paid IS 'Number of BATTLE tokens paid for the review';
COMMENT ON COLUMN vendor_reviews.payment_transaction_hash IS 'Blockchain transaction hash for payment verification';
COMMENT ON COLUMN vendor_reviews.review_data IS 'Additional review metadata in JSON format';
