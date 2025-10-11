-- =====================================================
-- RENAME BEACON TO ARENA - SUPABASE SCHEMA CHANGES
-- =====================================================
-- Run these commands in your Supabase SQL editor to rename all beacon-related tables and columns to arena
-- This also updates ID formats: B-000001 → A-000001, BG-12345678-ABCD → AG-12345678-ABCD

-- 1. Rename the main tables
ALTER TABLE beacons RENAME TO arenas;
ALTER TABLE beacon_games RENAME TO arena_games;
ALTER TABLE beacon_game_players RENAME TO arena_game_players;

-- 2. Rename columns in arena_games table
ALTER TABLE arena_games RENAME COLUMN beacon_id TO arena_id;

-- 3. Rename columns in arena_game_players table  
ALTER TABLE arena_game_players RENAME COLUMN beacon_game_id TO arena_game_id;

-- 4. Update foreign key constraints
-- Drop existing foreign key constraints
ALTER TABLE arena_games DROP CONSTRAINT IF EXISTS beacon_games_beacon_id_fkey;
ALTER TABLE arena_game_players DROP CONSTRAINT IF EXISTS beacon_game_players_beacon_game_id_fkey;

-- Add new foreign key constraints with arena naming
ALTER TABLE arena_games ADD CONSTRAINT arena_games_arena_id_fkey 
  FOREIGN KEY (arena_id) REFERENCES arenas(id) ON DELETE CASCADE;

ALTER TABLE arena_game_players ADD CONSTRAINT arena_game_players_arena_game_id_fkey 
  FOREIGN KEY (arena_game_id) REFERENCES arena_games(id) ON DELETE CASCADE;

-- 5. Update indexes
-- Drop old indexes
DROP INDEX IF EXISTS idx_beacon_games_beacon_id;
DROP INDEX IF EXISTS idx_beacon_games_status;
DROP INDEX IF EXISTS idx_beacon_game_players_beacon_game_id;
DROP INDEX IF EXISTS idx_beacon_game_players_player_id;

-- Create new indexes with arena naming
CREATE INDEX idx_arena_games_arena_id ON arena_games(arena_id);
CREATE INDEX idx_arena_games_status ON arena_games(status);
CREATE INDEX idx_arena_game_players_arena_game_id ON arena_game_players(arena_game_id);
CREATE INDEX idx_arena_game_players_player_id ON arena_game_players(player_id);

-- 6. Update RLS policies (if you have any)
-- You may need to update your Row Level Security policies to reference the new table names
-- Example:
-- DROP POLICY IF EXISTS "Users can view beacons" ON beacons;
-- CREATE POLICY "Users can view arenas" ON arenas FOR SELECT USING (true);

-- 7. Update functions that reference beacon tables
-- Update the update_player_outcome_direct function
DROP FUNCTION IF EXISTS update_player_outcome_direct(BIGINT, VARCHAR(20));

CREATE OR REPLACE FUNCTION update_player_outcome_direct(
  p_arena_game_player_id BIGINT,
  p_outcome VARCHAR(20)
)
RETURNS TABLE(
  id BIGINT,
  player_id BIGINT,
  player_outcome VARCHAR(20),
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  UPDATE arena_game_players
  SET
    player_outcome = p_outcome,
    updated_at = NOW()
  WHERE arena_game_players.id = p_arena_game_player_id;
  RETURN QUERY
  SELECT
    agp.id,
    agp.player_id,
    agp.player_outcome,
    agp.joined_at
  FROM arena_game_players agp
  WHERE agp.id = p_arena_game_player_id;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger function
CREATE OR REPLACE FUNCTION update_player_status_on_elimination()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.player_outcome = 'eliminated' THEN
    UPDATE players
    SET status = 'Eliminated'
    WHERE id = NEW.player_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger to reference the new table
DROP TRIGGER IF EXISTS update_player_status_trigger ON arena_game_players;
CREATE TRIGGER update_player_status_trigger
  AFTER UPDATE OF player_outcome ON arena_game_players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_status_on_elimination();

-- 8. Update any views that reference beacon tables (if you have any)
-- Example:
-- DROP VIEW IF EXISTS beacon_game_summary;
-- CREATE VIEW arena_game_summary AS 
-- SELECT ag.*, a.name as arena_name 
-- FROM arena_games ag 
-- JOIN arenas a ON ag.arena_id = a.id;

-- 9. Update ID formats in existing data
-- Update arena IDs from B-000001 format to A-000001 format
UPDATE arenas SET id = REPLACE(id, 'B-', 'A-') WHERE id LIKE 'B-%';

-- Update arena game IDs from BG-12345678-ABCD format to AG-12345678-ABCD format  
UPDATE arena_games SET id = REPLACE(id, 'BG-', 'AG-') WHERE id LIKE 'BG-%';

-- 10. Update sequences (if any exist)
-- ALTER SEQUENCE IF EXISTS beacons_id_seq RENAME TO arenas_id_seq;
-- ALTER SEQUENCE IF EXISTS beacon_games_id_seq RENAME TO arena_games_id_seq;
-- ALTER SEQUENCE IF EXISTS beacon_game_players_id_seq RENAME TO arena_game_players_id_seq;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the changes worked:

-- Check that tables were renamed
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%arena%';

-- Check that columns were renamed
SELECT column_name, table_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name LIKE '%arena%' OR table_name LIKE '%arena%')
ORDER BY table_name, column_name;

-- Check foreign key constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name LIKE '%arena%' OR ccu.table_name LIKE '%arena%');

-- Check ID formats were updated correctly
SELECT 'Arena IDs' as table_type, id FROM arenas WHERE id LIKE 'A-%' LIMIT 5;
SELECT 'Arena Game IDs' as table_type, id FROM arena_games WHERE id LIKE 'AG-%' LIMIT 5;

-- Verify no old format IDs remain
SELECT 'Old Arena IDs Found' as warning, COUNT(*) as count FROM arenas WHERE id LIKE 'B-%';
SELECT 'Old Arena Game IDs Found' as warning, COUNT(*) as count FROM arena_games WHERE id LIKE 'BG-%';
