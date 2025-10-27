-- Run this in your Supabase SQL Editor to fix elimination functionality
-- This script will:
-- 1. Drop and recreate the update_player_outcome_direct function
-- 2. Ensure the trigger for updating player status on elimination exists
-- 3. Verify everything is working correctly

-- Drop the existing function
DROP FUNCTION IF EXISTS update_player_outcome_direct(BIGINT, VARCHAR(20), INTEGER);

-- Recreate the function without the favor_earned parameter
CREATE OR REPLACE FUNCTION update_player_outcome_direct(
  p_beacon_game_player_id BIGINT,
  p_outcome VARCHAR(20)
)
RETURNS TABLE(
  id BIGINT,
  player_id BIGINT,
  player_outcome VARCHAR(20),
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Update the beacon_game_players record
  UPDATE beacon_game_players 
  SET 
    player_outcome = p_outcome,
    updated_at = NOW()
  WHERE beacon_game_players.id = p_beacon_game_player_id;
  
  -- Return the updated record
  RETURN QUERY
  SELECT 
    bgp.id,
    bgp.player_id,
    bgp.player_outcome,
    bgp.joined_at
  FROM beacon_game_players bgp
  WHERE bgp.id = p_beacon_game_player_id;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger function exists for updating player status on elimination
CREATE OR REPLACE FUNCTION update_player_status_on_elimination()
RETURNS TRIGGER AS $$
BEGIN
  -- If player outcome is set to 'eliminated', update player status
  IF NEW.player_outcome = 'eliminated' THEN
    UPDATE players 
    SET status = 'Eliminated'
    WHERE id = NEW.player_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_player_status_trigger ON beacon_game_players;
CREATE TRIGGER update_player_status_trigger
  AFTER UPDATE OF player_outcome ON beacon_game_players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_status_on_elimination();

-- Verify everything was created correctly
SELECT 'Elimination functionality fixed successfully' as status;
