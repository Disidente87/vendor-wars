-- Fix for zone_heat_level function to resolve ambiguous column reference
-- =====================================================================

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS trigger_update_zone_heat_level ON votes;

-- Drop the existing function
DROP FUNCTION IF EXISTS update_zone_heat_level();

-- Recreate the function with corrected variable naming
CREATE OR REPLACE FUNCTION update_zone_heat_level()
RETURNS TRIGGER AS $$
DECLARE
  target_zone_id UUID;
  recent_votes INTEGER;
BEGIN
  -- Get the zone_id from the vote
  target_zone_id := (
    SELECT zone_id FROM vendors WHERE id = NEW.vendor_id
  );
  
  -- Count recent votes (last 24 hours) for this vendor's zone
  SELECT COUNT(*) INTO recent_votes
  FROM votes v
  JOIN vendors ven ON v.vendor_id = ven.id
  WHERE ven.zone_id = target_zone_id
  AND v.created_at >= NOW() - INTERVAL '24 hours';
  
  -- Update zone heat_level (0-100 scale)
  UPDATE zones 
  SET 
    heat_level = LEAST(100, GREATEST(0, recent_votes * 10)),
    updated_at = NOW()
  WHERE id = target_zone_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_zone_heat_level
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_heat_level();
