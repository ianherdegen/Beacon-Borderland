-- =====================================================
-- AUTO-FORFEIT FUNCTION - PLAYERS INACTIVE 3+ DAYS
-- =====================================================
-- This function automatically sets players to "Forfeit" status
-- if they haven't played a game in 3+ days (and have played at least once)

-- Function to check and update player forfeit status
CREATE OR REPLACE FUNCTION check_and_update_player_forfeit_status()
RETURNS TABLE(
  player_id BIGINT,
  player_name TEXT,
  last_game_date TIMESTAMPTZ,
  days_since_last_game INTEGER,
  status_updated BOOLEAN
) AS $$
DECLARE
  player_record RECORD;
  days_since_game INTEGER;
  updated_count INTEGER := 0;
BEGIN
  -- Loop through all active players who have played at least one game
  FOR player_record IN
    SELECT 
      p.id,
      p.username,
      p.status,
      p.last_game_at as last_game_time
    FROM players p
    WHERE p.status = 'Active'
      AND p.last_game_at IS NOT NULL  -- Only players who have completed games
  LOOP
    -- Calculate days since last game
    days_since_game := EXTRACT(DAY FROM (NOW() - player_record.last_game_time));
    
    -- If more than 3 days since last game, set to Forfeit
    IF days_since_game > 3 THEN
      UPDATE players 
      SET 
        status = 'Forfeit',
        updated_at = NOW()
      WHERE id = player_record.id;
      
      updated_count := updated_count + 1;
      
      -- Return information about this player
      player_id := player_record.id;
      player_name := player_record.username;
      last_game_date := player_record.last_game_time;
      days_since_last_game := days_since_game;
      status_updated := TRUE;
      RETURN NEXT;
    END IF;
  END LOOP;
  
  -- If no players were updated, return a record indicating this
  IF updated_count = 0 THEN
    player_id := NULL;
    player_name := 'No players updated';
    last_game_date := NULL;
    days_since_last_game := 0;
    status_updated := FALSE;
    RETURN NEXT;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to get players who are close to forfeit (2+ days inactive)
CREATE OR REPLACE FUNCTION get_players_near_forfeit()
RETURNS TABLE(
  player_id BIGINT,
  player_name TEXT,
  last_game_date TIMESTAMPTZ,
  days_since_last_game INTEGER,
  hours_until_forfeit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.last_game_at as last_game_time,
    EXTRACT(DAY FROM (NOW() - p.last_game_at))::INTEGER as days_since,
    (72 - EXTRACT(HOUR FROM (NOW() - p.last_game_at)))::INTEGER as hours_until_forfeit
  FROM players p
  WHERE p.status = 'Active'
    AND p.last_game_at IS NOT NULL
    AND EXTRACT(DAY FROM (NOW() - p.last_game_at)) >= 2
    AND EXTRACT(DAY FROM (NOW() - p.last_game_at)) <= 3
  ORDER BY p.last_game_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Run the auto-forfeit check manually:
-- SELECT * FROM check_and_update_player_forfeit_status();

-- Check which players are close to forfeit (2+ days inactive):
-- SELECT * FROM get_players_near_forfeit();

-- =====================================================
-- AUTOMATIC EXECUTION (Optional)
-- =====================================================
-- If you want this to run automatically, you can set up a cron job
-- or use Supabase's pg_cron extension (if available)

-- Example: Run every hour to check for forfeits
-- SELECT cron.schedule('auto-forfeit-check', '0 * * * *', 'SELECT check_and_update_player_forfeit_status();');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check current player statuses:
-- SELECT 
--   p.username,
--   p.status,
--   p.last_game_at as last_game,
--   EXTRACT(DAY FROM (NOW() - p.last_game_at)) as days_since_last_game
-- FROM players p
-- ORDER BY p.last_game_at DESC NULLS LAST;
