-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE credibility_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE vendor_category AS ENUM ('pupusas', 'tacos', 'tamales', 'quesadillas', 'tortas', 'bebidas', 'postres', 'otros');
CREATE TYPE battle_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE attestation_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (Farcaster users) - FIRST
CREATE TABLE users (
  fid BIGINT PRIMARY KEY, -- Use FID as primary key for Farcaster
  username VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  pfp_url TEXT NOT NULL,
  bio TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  verified_addresses TEXT[] DEFAULT '{}',
  battle_tokens INTEGER DEFAULT 0,
  credibility_score INTEGER DEFAULT 0,
  verified_purchases INTEGER DEFAULT 0,
  credibility_tier credibility_tier DEFAULT 'bronze',
  vote_streak INTEGER DEFAULT 0,
  weekly_vote_count INTEGER DEFAULT 0,
  weekly_territory_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones table (Battle zones) - SECOND
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL,
  coordinates POINT NOT NULL,
  current_owner_id BIGINT REFERENCES users(fid) ON DELETE SET NULL,
  heat_level INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  active_vendors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table - THIRD
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category vendor_category NOT NULL,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  coordinates POINT NOT NULL,
  owner_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  total_battles INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  territory_defenses INTEGER DEFAULT 0,
  territory_conquests INTEGER DEFAULT 0,
  current_zone_rank INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  verified_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battles table - FOURTH
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  category vendor_category NOT NULL,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  status battle_status DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  total_votes INTEGER DEFAULT 0,
  verified_votes INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  territory_impact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table - FIFTH
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  token_reward INTEGER DEFAULT 0,
  multiplier DECIMAL(3,2) DEFAULT 1.00,
  reason TEXT,
  attestation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voter_fid, battle_id)
);

-- Attestations table (for verified votes) - SIXTH
CREATE TABLE attestations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  photo_hash VARCHAR(255) NOT NULL,
  photo_url TEXT NOT NULL,
  gps_location POINT NOT NULL,
  verification_confidence DECIMAL(3,2) DEFAULT 0.00,
  status attestation_status DEFAULT 'pending',
  processing_time INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification proofs table - SEVENTH
CREATE TABLE verification_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('business_license', 'location_photo', 'social_media', 'receipt', 'community_vouch')),
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_vendors_zone ON vendors(zone_id);
CREATE INDEX idx_vendors_owner ON vendors(owner_fid);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_battles_zone ON battles(zone_id);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_votes_battle ON votes(battle_id);
CREATE INDEX idx_votes_voter ON votes(voter_fid);
CREATE INDEX idx_attestations_vendor ON attestations(vendor_id);
CREATE INDEX idx_attestations_user ON attestations(user_fid);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_battles_updated_at BEFORE UPDATE ON battles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_proofs ENABLE ROW LEVEL SECURITY;

-- Users policies - Allow public read, authenticated write
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can be created by anyone" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);

-- Vendors policies - Allow public read, authenticated write
CREATE POLICY "Vendors are viewable by everyone" ON vendors FOR SELECT USING (true);
CREATE POLICY "Vendors can be created by anyone" ON vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors can be updated by anyone" ON vendors FOR UPDATE USING (true);

-- Zones policies - Allow public read, authenticated write
CREATE POLICY "Zones are viewable by everyone" ON zones FOR SELECT USING (true);
CREATE POLICY "Zones can be created by anyone" ON zones FOR INSERT WITH CHECK (true);
CREATE POLICY "Zones can be updated by anyone" ON zones FOR UPDATE USING (true);

-- Battles policies - Allow public read, authenticated write
CREATE POLICY "Battles are viewable by everyone" ON battles FOR SELECT USING (true);
CREATE POLICY "Battles can be created by anyone" ON battles FOR INSERT WITH CHECK (true);
CREATE POLICY "Battles can be updated by anyone" ON battles FOR UPDATE USING (true);

-- Votes policies - Allow public read, authenticated write
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Votes can be created by anyone" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Votes can be updated by anyone" ON votes FOR UPDATE USING (true);

-- Attestations policies - Allow public read, authenticated write
CREATE POLICY "Attestations are viewable by everyone" ON attestations FOR SELECT USING (true);
CREATE POLICY "Attestations can be created by anyone" ON attestations FOR INSERT WITH CHECK (true);
CREATE POLICY "Attestations can be updated by anyone" ON attestations FOR UPDATE USING (true);

-- Verification proofs policies - Allow public read, authenticated write
CREATE POLICY "Verification proofs are viewable by everyone" ON verification_proofs FOR SELECT USING (true);
CREATE POLICY "Verification proofs can be created by anyone" ON verification_proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "Verification proofs can be updated by anyone" ON verification_proofs FOR UPDATE USING (true); 