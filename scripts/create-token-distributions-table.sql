-- Create token_distributions table to track BATTLE token distributions
CREATE TABLE IF NOT EXISTS token_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
  wallet_address TEXT,
  tokens INTEGER NOT NULL CHECK (tokens > 0),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'failed')),
  transaction_hash TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  distributed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_distributions_user_fid ON token_distributions(user_fid);
CREATE INDEX IF NOT EXISTS idx_token_distributions_status ON token_distributions(status);
CREATE INDEX IF NOT EXISTS idx_token_distributions_created_at ON token_distributions(created_at);
CREATE INDEX IF NOT EXISTS idx_token_distributions_vote_id ON token_distributions(vote_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_token_distributions_updated_at 
  BEFORE UPDATE ON token_distributions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE token_distributions IS 'Tracks BATTLE token distributions for voting rewards';
COMMENT ON COLUMN token_distributions.user_fid IS 'Farcaster ID of the user receiving tokens';
COMMENT ON COLUMN token_distributions.wallet_address IS 'Ethereum wallet address (NULL if not connected)';
COMMENT ON COLUMN token_distributions.tokens IS 'Number of BATTLE tokens to distribute';
COMMENT ON COLUMN token_distributions.vote_id IS 'Reference to the vote that earned these tokens';
COMMENT ON COLUMN token_distributions.vendor_id IS 'Reference to the vendor that was voted for';
COMMENT ON COLUMN token_distributions.status IS 'Distribution status: pending, distributed, or failed';
COMMENT ON COLUMN token_distributions.transaction_hash IS 'Blockchain transaction hash when distributed';
COMMENT ON COLUMN token_distributions.error_message IS 'Error message if distribution failed';
COMMENT ON COLUMN token_distributions.created_at IS 'When the distribution was created';
COMMENT ON COLUMN token_distributions.distributed_at IS 'When the tokens were actually distributed';
COMMENT ON COLUMN token_distributions.updated_at IS 'When the record was last updated';
