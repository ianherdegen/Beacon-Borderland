-- Clear ALL data from all tables (keep table structures)
-- Run this in your Supabase SQL Editor

-- Clear all data in correct order (respecting foreign key constraints)
DELETE FROM beacon_game_players;
DELETE FROM beacon_games;
DELETE FROM beacons;
DELETE FROM players;
DELETE FROM game_templates;

-- Reset auto-increment sequences to start from 1
ALTER SEQUENCE IF EXISTS beacon_games_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS beacon_game_players_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS beacons_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS players_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS game_templates_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'beacon_game_players' as table_name, COUNT(*) as count FROM beacon_game_players
UNION ALL
SELECT 'beacon_games' as table_name, COUNT(*) as count FROM beacon_games
UNION ALL
SELECT 'beacons' as table_name, COUNT(*) as count FROM beacons
UNION ALL
SELECT 'players' as table_name, COUNT(*) as count FROM players
UNION ALL
SELECT 'game_templates' as table_name, COUNT(*) as count FROM game_templates;
