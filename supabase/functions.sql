-- Functions to automatically update zone statistics
-- This file contains database functions that will be executed in Supabase

-- Function to update zone total_votes when vendor votes change
CREATE OR REPLACE FUNCTION update_zone_total_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update zone total_votes based on all vendors in the zone
  UPDATE zones 
  SET 
    total_votes = (
      SELECT COALESCE(SUM(total_votes), 0) 
      FROM vendors 
      WHERE zone_id = COALESCE(NEW.zone_id, OLD.zone_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.zone_id, OLD.zone_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update zone active_vendors count
CREATE OR REPLACE FUNCTION update_zone_vendor_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update zone active_vendors count
  UPDATE zones 
  SET 
    active_vendors = (
      SELECT COUNT(*) 
      FROM vendors 
      WHERE zone_id = COALESCE(NEW.zone_id, OLD.zone_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.zone_id, OLD.zone_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update zone heat_level based on recent activity
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

-- Create triggers to automatically call these functions

-- Trigger for vendor votes changes
DROP TRIGGER IF EXISTS trigger_update_zone_total_votes ON vendors;
CREATE TRIGGER trigger_update_zone_total_votes
  AFTER INSERT OR UPDATE OR DELETE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_total_votes();

-- Trigger for vendor count changes
DROP TRIGGER IF EXISTS trigger_update_zone_vendor_count ON vendors;
CREATE TRIGGER trigger_update_zone_vendor_count
  AFTER INSERT OR DELETE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_vendor_count();

-- Trigger for vote activity (heat level)
DROP TRIGGER IF EXISTS trigger_update_zone_heat_level ON votes;
CREATE TRIGGER trigger_update_zone_heat_level
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_heat_level();

-- Function to recalculate all zone statistics (useful for data migration)
CREATE OR REPLACE FUNCTION recalculate_all_zone_stats()
RETURNS void AS $$
DECLARE
  zone_record RECORD;
BEGIN
  FOR zone_record IN SELECT id FROM zones LOOP
    -- Update total_votes
    UPDATE zones 
    SET total_votes = (
      SELECT COALESCE(SUM(total_votes), 0) 
      FROM vendors 
      WHERE zone_id = zone_record.id
    )
    WHERE id = zone_record.id;
    
    -- Update active_vendors
    UPDATE zones 
    SET active_vendors = (
      SELECT COUNT(*) 
      FROM vendors 
      WHERE zone_id = zone_record.id
    )
    WHERE id = zone_record.id;
    
    -- Update heat_level (votes in last 24 hours)
    UPDATE zones 
    SET heat_level = (
      SELECT LEAST(100, GREATEST(0, COUNT(*) * 10))
      FROM votes v
      JOIN vendors ven ON v.vendor_id = ven.id
      WHERE ven.zone_id = zone_record.id
      AND v.created_at >= NOW() - INTERVAL '24 hours'
    )
    WHERE id = zone_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get zone statistics summary
CREATE OR REPLACE FUNCTION get_zone_stats_summary()
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  total_votes BIGINT,
  active_vendors BIGINT,
  heat_level INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    z.id,
    z.name,
    z.total_votes,
    z.active_vendors,
    z.heat_level,
    z.updated_at
  FROM zones z
  ORDER BY z.total_votes DESC;
END;
$$ LANGUAGE plpgsql;
