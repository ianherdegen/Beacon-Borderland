-- Fix outcome field to store player IDs instead of usernames
-- This migration updates existing arena_games records to use player IDs in outcome data

-- First, let's see what the current outcome data looks like
-- SELECT id, outcome FROM arena_games WHERE outcome IS NOT NULL AND outcome::text LIKE '%winners%';

-- Update arena_games to replace usernames with player IDs in outcome field
UPDATE arena_games 
SET outcome = (
  SELECT jsonb_build_object(
    'winners', COALESCE(
      (
        SELECT jsonb_agg(p.id::text)
        FROM arena_game_players agp
        JOIN players p ON agp.player_id = p.id
        WHERE agp.arena_game_id = arena_games.id 
        AND agp.player_outcome = 'win'
      ),
      '[]'::jsonb
    ),
    'eliminated', COALESCE(
      (
        SELECT jsonb_agg(p.id::text)
        FROM arena_game_players agp
        JOIN players p ON agp.player_id = p.id
        WHERE agp.arena_game_id = arena_games.id 
        AND agp.player_outcome = 'eliminated'
      ),
      '[]'::jsonb
    )
  )
)
WHERE outcome IS NOT NULL 
AND outcome::text LIKE '%winners%'
AND outcome::text LIKE '%eliminated%';

-- Also update any solo games that might have stored usernames
-- For solo games, we'll keep the result field but ensure it's properly formatted
UPDATE arena_games 
SET outcome = jsonb_build_object('result', outcome->>'result')
WHERE outcome IS NOT NULL 
AND outcome ? 'result'
AND NOT (outcome ? 'winners' OR outcome ? 'eliminated');

-- Verify the changes
-- SELECT id, outcome FROM arena_games WHERE outcome IS NOT NULL;
