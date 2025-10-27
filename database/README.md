# Database Configuration Files

This folder contains SQL scripts and configuration files for setting up and maintaining the Beacon Borderland Supabase database.

## 📋 File Descriptions

### Core Schema
- **`supabase-complete-schema.sql`** - Complete database schema with all tables, functions, triggers, and RLS policies

### Setup & Configuration
- **`connect-users-to-players.sql`** - Script to link Supabase users to player profiles
- **`add-fate-template.sql`** - Adds fate-based game template to the system

### Maintenance & Utilities
- **`clear-database.sql`** - Clears all data from the database (use with caution)
- **`clear-test-data.sql`** - Removes only test data while preserving production data
- **`debug-forfeit.sql`** - Debug script for forfeit detection and player status

### Bug Fixes & Updates
- **`fix-database-trigger.sql`** - Fixes database triggers for player status updates
- **`fix-elimination-function.sql`** - Updates elimination logic and functions
- **`fix-outcome-player-ids.sql`** - Fixes player ID references in game outcomes
- **`run-elimination-fix.sql`** - Applies elimination-related fixes

### Feature Updates
- **`auto-forfeit-function.sql`** - Implements automatic forfeit detection (3-day rule)
- **`remove-favor-earned.sql`** - Removes favor/earned system from database
- **`rename-beacon-to-arena.sql`** - Renames beacon references to arena throughout the system

## 🚀 Usage Instructions

### Initial Setup
1. Run `supabase-complete-schema.sql` first to create the complete database structure
2. Run `connect-users-to-players.sql` to set up user-player relationships
3. Run `add-fate-template.sql` to add game templates

### Maintenance
- Use `clear-test-data.sql` to clean up test data
- Use `debug-forfeit.sql` to troubleshoot forfeit detection issues
- Use `auto-forfeit-function.sql` to implement automatic forfeit detection

### Applying Fixes
- Run fix scripts in order if multiple fixes are needed
- Always backup your database before running maintenance scripts
- Test fixes in a development environment first

## ⚠️ Important Notes

- **Always backup your database** before running any SQL scripts
- **Test scripts in development** before applying to production
- **Review scripts** before execution to understand their impact
- **Some scripts are destructive** (like `clear-database.sql`) - use with extreme caution

## 🔧 Supabase Integration

These scripts are designed to work with Supabase PostgreSQL database and include:
- Row Level Security (RLS) policies
- Database triggers and functions
- Proper foreign key relationships
- Indexes for performance optimization

## 📝 Script Execution Order

For a fresh installation:
1. `supabase-complete-schema.sql`
2. `connect-users-to-players.sql`
3. `add-fate-template.sql`
4. `auto-forfeit-function.sql`

For maintenance:
- Run specific fix scripts as needed
- Use debug scripts for troubleshooting
- Use clear scripts for data cleanup
