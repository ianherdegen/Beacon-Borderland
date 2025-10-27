-- Remove favor_earned functionality from the database
-- Run this in your Supabase SQL Editor

-- Remove favor_earned column from beacon_game_players table
ALTER TABLE beacon_game_players DROP COLUMN IF EXISTS favor_earned;

-- Remove any functions that reference favor_earned
DROP FUNCTION IF EXISTS update_player_outcome_direct(BIGINT, TEXT, INTEGER);

-- Recreate the function without favor_earned parameter
CREATE OR REPLACE FUNCTION update_player_outcome_direct(
  player_record_id BIGINT,
  outcome TEXT
)
RETURNS TABLE(
  id BIGINT,
  beacon_game_id BIGINT,
  player_id BIGINT,
  player_outcome TEXT,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  UPDATE beacon_game_players 
  SET 
    player_outcome = outcome,
    updated_at = NOW()
  WHERE id = player_record_id;
  
  RETURN QUERY
  SELECT 
    bgp.id,
    bgp.beacon_game_id,
    bgp.player_id,
    bgp.player_outcome,
    bgp.joined_at
  FROM beacon_game_players bgp
  WHERE bgp.id = player_record_id;
END;
$$ LANGUAGE plpgsql;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'beacon_game_players' 
AND column_name = 'favor_earned';
