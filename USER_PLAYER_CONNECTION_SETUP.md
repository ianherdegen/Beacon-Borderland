# User-Player Connection Setup Guide

## 🎯 **Overview**

This guide shows you how to connect Supabase authenticated users to your existing players table, allowing users to create player profiles and participate in games.

## 🗄️ **Database Setup**

### **Step 1: Run the SQL Migration**

Execute the SQL file to add user connection to your players table:

```bash
# In your Supabase SQL Editor, run:
# connect-users-to-players.sql
```

This will:
- Add `user_id` column to players table
- Create helper functions for user-player operations
- Set up Row Level Security (RLS) policies
- Add proper indexes for performance

### **Step 2: Verify the Setup**

Check that the migration worked:

```sql
-- Check if user_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'players' AND column_name = 'user_id';

-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('create_player_for_user', 'get_player_by_user_id');
```

## 🔧 **How It Works**

### **User Flow**

1. **User signs up** with email/password via Supabase Auth
2. **User visits "You" page** and sees option to create player profile
3. **User creates player profile** with a username
4. **User can now participate** in games as a player

### **Database Structure**

```
auth.users (Supabase Auth)
    ↓ (user_id UUID)
players table
    ↓ (player_id BIGINT)
beacon_game_players (game participation)
```

### **Security Features**

- **Row Level Security**: Users can only see/edit their own player profile
- **Unique constraint**: One player profile per user
- **Cascade delete**: If user is deleted, player profile is removed

## 🎮 **User Experience**

### **For New Users**
1. Sign up with email/password
2. Visit "You" page
3. See "Create Player Profile" section
4. Enter username and create profile
5. Now can participate in games

### **For Existing Users**
1. Sign in to their account
2. Visit "You" page
3. See their existing player profile
4. Can view their game status and stats

### **For Admins**
- Can see all players (including those with user accounts)
- Can manage both user accounts and player profiles
- Admin features remain unchanged

## 🔄 **API Functions**

### **Available Functions**

```typescript
// Create player profile for current user
UserPlayerConnectionService.createPlayerForUser(username: string)

// Get current user's player profile
UserPlayerConnectionService.getCurrentUserPlayer()

// Check if user has player profile
UserPlayerConnectionService.hasPlayerProfile()

// Update current user's player profile
UserPlayerConnectionService.updateCurrentUserPlayer(updates)

// Get player by user ID (admin)
UserPlayerConnectionService.getPlayerByUserId(userId: string)
```

### **Database Functions**

```sql
-- Create player for user
SELECT create_player_for_user(auth.uid(), 'username');

-- Get player by user ID
SELECT * FROM get_player_by_user_id(auth.uid());
```

## 🚀 **Next Steps**

### **Immediate**
1. Run the SQL migration
2. Test user signup and player profile creation
3. Verify the "You" page shows player information

### **Future Enhancements**
1. **Player stats**: Show game history, wins, losses
2. **Profile customization**: Avatar, bio, preferences
3. **Game notifications**: Email alerts for game events
4. **Social features**: Friends, leaderboards
5. **Achievements**: Badges, rewards system

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"User not authenticated" error**
   - Check if user is signed in
   - Verify Supabase auth is working

2. **"Failed to create player profile"**
   - Check if username is already taken
   - Verify database functions are created
   - Check RLS policies

3. **Player profile not showing**
   - Check if user_id is properly set
   - Verify RLS policies allow access
   - Check browser console for errors

### **Debug Steps**

1. Check Supabase logs for errors
2. Verify user authentication status
3. Test database functions directly
4. Check RLS policy permissions

## ✅ **Benefits**

- **Seamless integration**: Users can easily become players
- **Secure**: RLS ensures users only see their own data
- **Scalable**: Can handle many users and players
- **Flexible**: Easy to extend with more features
- **Admin-friendly**: Admins can manage both users and players

The system now allows authenticated users to create player profiles and participate in your Borderland games!
