-- =====================================================
-- CLEAR DATABASE - FRESH START WITH ARENA TERMINOLOGY
-- =====================================================
-- Run this script in your Supabase SQL editor to clear all data
-- This will give you a clean slate to start inputting real data

-- WARNING: This will delete ALL data from these tables!
-- Make sure you want to clear everything before running this script.

-- =====================================================
-- CLEAR ALL DATA (in correct order due to foreign key constraints)
-- =====================================================

-- 1. Clear arena game players first (has foreign keys to other tables)
DELETE FROM arena_game_players;
-- If the table is still named beacon_game_players, use this instead:
-- DELETE FROM beacon_game_players;

-- 2. Clear arena games
DELETE FROM arena_games;
-- If the table is still named beacon_games, use this instead:
-- DELETE FROM beacon_games;

-- 3. Clear arenas
DELETE FROM arenas;
-- If the table is still named beacons, use this instead:
-- DELETE FROM beacons;

-- 4. Clear game templates
DELETE FROM game_templates;

-- 5. Clear players
DELETE FROM players;

-- 6. Clear clips (if the table exists)
-- DELETE FROM clips; -- Uncomment this line if you have a clips table

-- =====================================================
-- RESET AUTO-INCREMENT SEQUENCES (if any exist)
-- =====================================================
-- Reset any sequences to start from 1 again
-- (Uncomment these if you have sequences)

-- ALTER SEQUENCE IF EXISTS players_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS game_templates_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS arenas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS arena_games_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS arena_game_players_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS clips_id_seq RESTART WITH 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify all data has been cleared:

SELECT 'Players' as table_name, COUNT(*) as remaining_records FROM players;
SELECT 'Game Templates' as table_name, COUNT(*) as remaining_records FROM game_templates;
SELECT 'Arenas' as table_name, COUNT(*) as remaining_records FROM arenas;
SELECT 'Arena Games' as table_name, COUNT(*) as remaining_records FROM arena_games;
SELECT 'Arena Game Players' as table_name, COUNT(*) as remaining_records FROM arena_game_players;
-- SELECT 'Clips' as table_name, COUNT(*) as remaining_records FROM clips; -- Uncomment if you have a clips table

-- If you still have the old table names, also check these:
-- SELECT 'Beacons' as table_name, COUNT(*) as remaining_records FROM beacons;
-- SELECT 'Beacon Games' as table_name, COUNT(*) as remaining_records FROM beacon_games;
-- SELECT 'Beacon Game Players' as table_name, COUNT(*) as remaining_records FROM beacon_game_players;

-- =====================================================
-- READY FOR FRESH DATA!
-- =====================================================
-- All tables should now show 0 records
-- You can now start adding your real data with the new Arena terminology:
-- - Arena IDs will start with A-000001
-- - Arena Game IDs will start with AG-12345678-ABCD
-- - All UI will show "Arena" instead of "Beacon"
