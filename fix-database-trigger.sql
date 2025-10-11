-- Simple fix: Remove the problematic player stats trigger
-- Run this in your Supabase SQL Editor

-- Drop the problematic trigger that's causing the ambiguous column reference
DROP TRIGGER IF EXISTS update_player_stats_trigger ON beacon_game_players;

-- Drop the trigger function (optional, since it's no longer used)
DROP FUNCTION IF EXISTS trigger_update_player_stats();

-- Drop the update_player_stats function (optional, since it's no longer used)
DROP FUNCTION IF EXISTS update_player_stats(BIGINT);

-- Create a simple function to update player outcome directly
CREATE OR REPLACE FUNCTION update_player_outcome_direct(
  p_beacon_game_player_id BIGINT,
  p_outcome VARCHAR(20),
  p_favor INTEGER DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  player_id BIGINT,
  player_outcome VARCHAR(20),
  favor_earned INTEGER
) AS $$
BEGIN
  -- Update the beacon_game_players record
  UPDATE beacon_game_players 
  SET 
    player_outcome = p_outcome,
    favor_earned = p_favor
  WHERE beacon_game_players.id = p_beacon_game_player_id;
  
  -- Return the updated record
  RETURN QUERY
  SELECT 
    bgp.id,
    bgp.player_id,
    bgp.player_outcome,
    bgp.favor_earned
  FROM beacon_game_players bgp
  WHERE bgp.id = p_beacon_game_player_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update player status when eliminated
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

-- Create trigger to automatically update player status when eliminated
CREATE TRIGGER update_player_status_trigger
  AFTER UPDATE OF player_outcome ON beacon_game_players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_status_on_elimination();
