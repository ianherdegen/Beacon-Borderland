-- =====================================================
-- BORDERLAND - COMPLETE SUPABASE SCHEMA
-- =====================================================

-- =====================================================
-- DROP EVERYTHING (DEVELOPMENT MODE)
-- =====================================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS beacon_details CASCADE;
DROP VIEW IF EXISTS player_stats CASCADE;

-- Drop all tables (CASCADE will handle foreign key constraints)
DROP TABLE IF EXISTS beacon_game_players CASCADE;
DROP TABLE IF EXISTS beacon_games CASCADE;
DROP TABLE IF EXISTS beacons CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS game_templates CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_template_usage(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS update_player_stats(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS trigger_update_player_stats() CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. GAME TEMPLATES TABLE
-- =====================================================
CREATE TABLE game_templates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Solo', 'Versus', 'Group')),
  thumbnail TEXT,
  explainer_clip TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. PLAYERS TABLE
-- =====================================================
CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Eliminated', 'Forfeit')),
  last_game_at TIMESTAMP WITH TIME ZONE,
  join_date DATE DEFAULT CURRENT_DATE,
  avatar VARCHAR(10),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. BEACONS TABLE
-- =====================================================
CREATE TABLE beacons (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT, -- Human-readable address
  active BOOLEAN NOT NULL DEFAULT false, -- Indicates if the beacon is active (manually controlled, independent of games/templates)
  game_template_id BIGINT REFERENCES game_templates(id) ON DELETE SET NULL, -- Selected game template for this beacon
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. BEACON GAMES TABLE
-- =====================================================
CREATE TABLE beacon_games (
  id VARCHAR(20) PRIMARY KEY,
  beacon_id VARCHAR(20) NOT NULL REFERENCES beacons(id),
  game_template_id BIGINT NOT NULL REFERENCES game_templates(id),
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Cancelled')),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  outcome JSONB, -- Stores game results (winners, eliminated, etc.)
  actual_clip TEXT, -- URL to match footage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. BEACON GAME PLAYERS TABLE (Junction table)
-- =====================================================
CREATE TABLE beacon_game_players (
  id BIGSERIAL PRIMARY KEY,
  beacon_game_id VARCHAR(20) NOT NULL REFERENCES beacon_games(id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES players(id),
  player_outcome VARCHAR(20) CHECK (player_outcome IN ('win', 'eliminated', 'forfeit')),
  favor_earned INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Game Templates indexes
CREATE INDEX idx_game_templates_type ON game_templates(type);
CREATE INDEX idx_game_templates_name ON game_templates USING gin(to_tsvector('english', name));

-- Players indexes
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_status ON players(status);

-- Beacons indexes
CREATE INDEX idx_beacons_name ON beacons(name);

-- Beacon Games indexes
CREATE INDEX idx_beacon_games_beacon ON beacon_games(beacon_id);
CREATE INDEX idx_beacon_games_status ON beacon_games(status);
CREATE INDEX idx_beacon_games_start_time ON beacon_games(start_time DESC);

-- Beacon Game Players indexes
CREATE INDEX idx_beacon_game_players_game ON beacon_game_players(beacon_game_id);
CREATE INDEX idx_beacon_game_players_player ON beacon_game_players(player_id);


-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment game template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE game_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update player statistics
CREATE OR REPLACE FUNCTION update_player_stats(player_id BIGINT)
RETURNS VOID AS $$
DECLARE
  total_games_count INTEGER;
  wins_count INTEGER;
  eliminations_count INTEGER;
  win_rate_calc DECIMAL(3,2);
  elimination_rate_calc DECIMAL(3,2);
BEGIN
  -- Get total games
  SELECT COUNT(*) INTO total_games_count
  FROM beacon_game_players bgp
  JOIN beacon_games bg ON bgp.beacon_game_id = bg.id
  WHERE bgp.player_id = player_id AND bg.status = 'Completed';
  
  -- Get wins
  SELECT COUNT(*) INTO wins_count
  FROM beacon_game_players bgp
  JOIN beacon_games bg ON bgp.beacon_game_id = bg.id
  WHERE bgp.player_id = player_id AND bgp.player_outcome = 'win' AND bg.status = 'Completed';
  
  -- Get eliminations
  SELECT COUNT(*) INTO eliminations_count
  FROM beacon_game_players bgp
  JOIN beacon_games bg ON bgp.beacon_game_id = bg.id
  WHERE bgp.player_id = player_id AND bgp.player_outcome = 'eliminated' AND bg.status = 'Completed';
  
  -- Calculate rates
  IF total_games_count > 0 THEN
    win_rate_calc := (wins_count::DECIMAL / total_games_count::DECIMAL);
    elimination_rate_calc := (eliminations_count::DECIMAL / total_games_count::DECIMAL);
  ELSE
    win_rate_calc := 0.00;
    elimination_rate_calc := 0.00;
  END IF;
  
  -- Update player
  UPDATE players 
  SET 
    total_games = total_games_count,
    wins = wins_count,
    win_rate = win_rate_calc,
    elimination_rate = elimination_rate_calc,
    last_game_at = NOW()
  WHERE id = player_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update triggers for all tables
CREATE TRIGGER update_game_templates_updated_at
  BEFORE UPDATE ON game_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beacons_updated_at
  BEFORE UPDATE ON beacons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beacon_games_updated_at
  BEFORE UPDATE ON beacon_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Create trigger function for player stats update
CREATE OR REPLACE FUNCTION trigger_update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_player_stats(NEW.player_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update player stats when game outcomes change
CREATE TRIGGER update_player_stats_trigger
  AFTER UPDATE OF player_outcome ON beacon_game_players
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_player_stats();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE game_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_game_players ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to game templates" ON game_templates
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to beacons" ON beacons
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to beacon games" ON beacon_games
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to beacon game players" ON beacon_game_players
  FOR SELECT USING (true);


-- Authenticated user policies for modifications
CREATE POLICY "Allow authenticated users to modify game templates" ON game_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify players" ON players
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify beacons" ON beacons
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify beacon games" ON beacon_games
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify beacon game players" ON beacon_game_players
  FOR ALL USING (auth.role() = 'authenticated');


-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample game templates
INSERT INTO game_templates (name, type, thumbnail, explainer_clip, created_date, description) VALUES
('Urban Assault', 'Group', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400', 'https://vimeo.com/123456789', '2024-01-10', 'High-intensity team-based combat in urban environments. Players must capture and hold strategic locations while eliminating opponents.'),
('Shadow Protocol', 'Solo', 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=400', 'https://youtube.com/watch?v=abc123', '2024-01-15', 'Stealth-based solo competition. Players must complete objectives without being detected while avoiding or eliminating other players.'),
('Territory Control', 'Versus', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400', 'https://vimeo.com/789012345', '2024-01-18', 'Teams battle for control of key zones. Hold territories to earn points and secure victory through strategic positioning.'),
('Night Raid', 'Group', 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400', 'https://youtube.com/watch?v=xyz789', '2024-01-22', 'Night-time operations requiring teamwork and coordination. Complete objectives under cover of darkness while managing limited visibility.'),
('Extraction', 'Versus', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', 'https://vimeo.com/456789012', '2024-02-01', 'High-stakes extraction mission. One team must reach the extraction point while the other tries to prevent their escape.'),
('King of the Hill', 'Group', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400', 'https://youtube.com/watch?v=def456', '2024-02-05', 'Classic king of the hill gameplay. Hold the central position for as long as possible while fending off challengers.'),
('Survival Hunt', 'Solo', 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=400', 'https://vimeo.com/234567890', '2024-02-10', 'Last player standing wins. Scavenge for resources and eliminate opponents in an ever-shrinking play area.'),
('Sabotage', 'Versus', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', 'https://youtube.com/watch?v=ghi789', '2024-02-15', 'Asymmetric gameplay where one team defends objectives while the other attempts to sabotage and destroy them.')
;

-- Insert sample players
INSERT INTO players (username, status, last_game_at, join_date, avatar, bio) VALUES
('ShadowRunner', 'Active', NOW() - INTERVAL '2 minutes', '2024-01-15', 'SR', 'Veteran player specializing in urban combat tactics. Known for stealth approaches.'),
('Phoenix', 'Active', NOW() - INTERVAL '18 minutes', '2024-01-20', 'PX', 'Strategic mastermind with exceptional team coordination skills.'),
('Ghost', 'Active', NOW() - INTERVAL '5 minutes', '2024-01-12', 'GH', 'Silent and deadly. Prefers long-range engagements.'),
('NightHawk', 'Eliminated', NOW() - INTERVAL '5 minutes', '2024-02-01', 'NH', 'Aggressive playstyle focused on rapid eliminations.'),
('Vortex', 'Active', NOW() - INTERVAL '32 minutes', '2024-02-10', 'VX', 'Unpredictable tactics and creative strategies.'),
('Titan', 'Forfeit', NOW() - INTERVAL '4 days', '2024-01-25', 'TN', 'Defensive specialist with strong territorial control.'),
('Cipher', 'Active', NOW() - INTERVAL '1 hour', '2024-02-05', 'CP', 'Cryptic movements and calculated risks.'),
('Raven', 'Active', NOW() - INTERVAL '45 minutes', '2024-02-15', 'RV', 'Swift and agile, excels in close-quarters combat.')
;

-- Insert sample beacons
INSERT INTO beacons (id, name, address) VALUES
('B-001', 'Downtown Alpha', '123 Broadway, New York, NY 10001'),
('B-007', 'Harbor Beta', '456 Water St, Brooklyn, NY 11201'),
('B-015', 'Industrial Gamma', '789 Industrial Ave, Queens, NY 11101'),
('B-023', 'Park Delta', '321 Central Park West, New York, NY 10024'),
('B-031', 'Bridge Epsilon', '654 Bridge St, Manhattan, NY 10004'),
('B-047', 'Tower Zeta', '987 Tower Ave, Brooklyn, NY 11202'),
('B-052', 'Mall Theta', '147 Mall Blvd, Queens, NY 11102'),
('B-068', 'Station Omega', '258 Station Rd, Brooklyn, NY 11203')
;

-- Insert sample beacon games
INSERT INTO beacon_games (id, beacon_id, game_template_id, status, start_time, end_time, outcome, actual_clip) VALUES
('BG-1847', 'B-001', 1, 'Active', NOW() - INTERVAL '2 minutes', NULL, NULL, NULL),
('BG-1848', 'B-007', 3, 'Active', NOW() - INTERVAL '1 hour', NULL, NULL, NULL),
('BG-1849', 'B-015', 2, 'Active', NOW() - INTERVAL '23 minutes', NULL, NULL, NULL),
('BG-1846', 'B-031', 4, 'Completed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 17 minutes', '{"winners": ["Phoenix", "Vortex", "Cipher"], "eliminated": ["ShadowRunner", "Ghost", "Raven", "NightHawk", "Titan", "Spectre", "Wraith"]}', 'https://vimeo.com/987654321'),
('BG-1845', 'B-047', 1, 'Completed', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 12 minutes', '{"result": "won"}', 'https://youtube.com/watch?v=completed123'),
('BG-1844', 'B-001', 5, 'Completed', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 25 minutes', '{"winners": ["ShadowRunner", "Phoenix"], "eliminated": ["Vortex", "Cipher", "Raven", "Spectre", "Wraith", "Blade"]}', 'https://vimeo.com/876543210'),
('BG-1843', 'B-023', 6, 'Cancelled', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 45 minutes', NULL, NULL)
;

-- Insert sample beacon game players
INSERT INTO beacon_game_players (beacon_game_id, player_id, player_outcome, favor_earned) VALUES
-- Active games
('BG-1847', 1, NULL, 0),
('BG-1848', 2, NULL, 0),
('BG-1848', 5, NULL, 0),
('BG-1848', 7, NULL, 0),
('BG-1848', 8, NULL, 0),
('BG-1848', 4, NULL, 0),
('BG-1848', 6, NULL, 0),
('BG-1849', 3, NULL, 0),
('BG-1849', 7, NULL, 0),
('BG-1849', 8, NULL, 0),
('BG-1849', 4, NULL, 0),
-- Completed games
('BG-1846', 2, 'win', 312),
('BG-1846', 5, 'win', 312),
('BG-1846', 7, 'win', 312),
('BG-1846', 1, 'eliminated', 85),
('BG-1846', 3, 'eliminated', 85),
('BG-1846', 8, 'eliminated', 85),
('BG-1846', 4, 'eliminated', 85),
('BG-1846', 6, 'eliminated', 85),
('BG-1845', 3, 'win', 278),
('BG-1844', 1, 'win', 245),
('BG-1844', 2, 'win', 245),
('BG-1844', 5, 'eliminated', 92),
('BG-1844', 7, 'eliminated', 92),
('BG-1844', 8, 'eliminated', 92),
('BG-1843', 3, 'forfeit', 0),
('BG-1843', 2, 'forfeit', 0),
('BG-1843', 7, 'forfeit', 0),
('BG-1843', 8, 'forfeit', 0),
('BG-1843', 4, 'forfeit', 0),
('BG-1843', 6, 'forfeit', 0)
;


-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for beacon details with game template info
CREATE OR REPLACE VIEW beacon_details AS
SELECT 
  b.id,
  b.name,
  b.address,
  COUNT(bg.id) as active_games_count
FROM beacons b
LEFT JOIN beacon_games bg ON b.id = bg.beacon_id AND bg.status = 'Active'
GROUP BY b.id, b.name, b.address;

-- View for player statistics
CREATE OR REPLACE VIEW player_stats AS
SELECT 
  p.*,
  COALESCE(recent_games.games_last_7_days, 0) as games_last_7_days
FROM players p
LEFT JOIN (
  SELECT 
    bgp.player_id,
    COUNT(*) as games_last_7_days
  FROM beacon_game_players bgp
  JOIN beacon_games bg ON bgp.beacon_game_id = bg.id
  WHERE bg.start_time >= NOW() - INTERVAL '7 days'
  GROUP BY bgp.player_id
) recent_games ON p.id = recent_games.player_id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Borderland database schema created successfully!';
  RAISE NOTICE 'Tables created: game_templates, players, beacons, beacon_games, beacon_game_players';
  RAISE NOTICE 'Sample data inserted for all tables';
  RAISE NOTICE 'Indexes, triggers, and RLS policies configured';
END $$;
