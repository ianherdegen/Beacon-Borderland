-- Add 'Champion' status to players table
-- This allows marking a player as the tournament winner

-- Drop the existing CHECK constraint
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_status_check;

-- Add the new CHECK constraint with 'Champion' status
ALTER TABLE players 
ADD CONSTRAINT players_status_check 
CHECK (status IN ('Active', 'Eliminated', 'Forfeit', 'Champion'));

-- Add a comment to document the new status
COMMENT ON COLUMN players.status IS 'Player status: Active, Eliminated, Forfeit, or Champion (tournament winner)';
