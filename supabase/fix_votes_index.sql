-- Fix for votes table index that references non-existent battle_id column
-- =====================================================================

-- Drop the problematic index that references a non-existent column
DROP INDEX IF EXISTS idx_votes_battle;

-- Verify the index was dropped
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'votes' 
AND indexname = 'idx_votes_battle';
