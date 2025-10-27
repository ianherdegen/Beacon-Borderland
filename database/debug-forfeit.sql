-- =====================================================
-- DEBUG FORFEIT FUNCTION - TEST QUERIES
-- =====================================================
-- Run these queries in Supabase to debug why the forfeit function isn't working

-- 1. Check all players and their last_game_at dates
SELECT 
  id,
  username,
  status,
  last_game_at,
  CASE 
    WHEN last_game_at IS NULL THEN 'No games played'
    ELSE EXTRACT(DAY FROM (NOW() - last_game_at))::TEXT || ' days ago'
  END as days_since_last_game
FROM players
ORDER BY last_game_at DESC NULLS LAST;

-- 2. Check only active players with last_game_at
SELECT 
  id,
  username,
  status,
  last_game_at,
  EXTRACT(DAY FROM (NOW() - last_game_at)) as days_since_last_game
FROM players
WHERE status = 'Active'
  AND last_game_at IS NOT NULL
ORDER BY last_game_at ASC;

-- 3. Check players who should be forfeited (3+ days inactive)
SELECT 
  id,
  username,
  status,
  last_game_at,
  EXTRACT(DAY FROM (NOW() - last_game_at)) as days_since_last_game
FROM players
WHERE status = 'Active'
  AND last_game_at IS NOT NULL
  AND EXTRACT(DAY FROM (NOW() - last_game_at)) > 3
ORDER BY last_game_at ASC;

-- 4. Test the actual forfeit function
SELECT * FROM check_and_update_player_forfeit_status();

-- 5. Check if the function exists
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%forfeit%' 
  AND routine_schema = 'public';
