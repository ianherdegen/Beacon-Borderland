-- =====================================================
-- CONNECT SUPABASE USERS TO PLAYERS
-- =====================================================

-- Add user_id column to players table
ALTER TABLE players 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_players_user_id ON players(user_id);

-- Add unique constraint to prevent multiple players per user
ALTER TABLE players 
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to connect an existing player to a user (admin only)
CREATE OR REPLACE FUNCTION connect_player_to_user(
  p_player_id BIGINT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update existing player with user_id
  UPDATE players 
  SET user_id = p_user_id, updated_at = NOW()
  WHERE id = p_player_id AND user_id IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get player by user_id
CREATE OR REPLACE FUNCTION get_player_by_user_id(p_user_id UUID)
RETURNS TABLE (
  id BIGINT,
  username VARCHAR(100),
  status VARCHAR(20),
  last_game_at TIMESTAMP WITH TIME ZONE,
  join_date DATE,
  avatar VARCHAR(10),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.status, p.last_game_at, p.join_date, 
         p.avatar, p.bio, p.created_at, p.updated_at
  FROM players p
  WHERE p.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own player profile
CREATE POLICY "Users can view own player profile" ON players
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own player profile
CREATE POLICY "Users can update own player profile" ON players
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can insert their own player profile
CREATE POLICY "Users can insert own player profile" ON players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- EXAMPLE USAGE
-- =====================================================

-- To connect an existing player to a user (admin only):
-- SELECT connect_player_to_user(123, 'user-uuid-here');

-- To get current user's player profile:
-- SELECT * FROM get_player_by_user_id(auth.uid());
