# Admin-Controlled User Assignment Setup Guide

## 🎯 **Overview**

This system allows administrators to connect existing Supabase user accounts to existing players in your database. Users cannot create their own player profiles - only admins can assign them.

## 🔧 **How It Works**

### **User Flow**
1. **Admin creates user accounts** in Supabase (or users sign up)
2. **Admin creates player profiles** in the existing players table
3. **Admin connects users to players** via the "User Connections" page
4. **Users can then sign in** and see their assigned player profile

### **Admin Flow**
1. **Sign in as admin** to access admin features
2. **Go to "User Connections"** page in the sidebar
3. **Select a player** from the dropdown (unconnected players only)
4. **Select a user** from the dropdown (unconnected users only)
5. **Click "Connect"** to link them together

## 🗄️ **Database Setup**

### **Step 1: Run the SQL Migration**

Execute the SQL file in your Supabase SQL Editor:

```sql
-- Execute: connect-users-to-players.sql
```

This will:
- Add `user_id` column to players table
- Create admin-only connection functions
- Set up Row Level Security (RLS) policies
- Add proper indexes for performance

### **Step 2: Verify the Setup**

```sql
-- Check if user_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'players' AND column_name = 'user_id';

-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('connect_player_to_user', 'get_player_by_user_id');
```

## 🎮 **Admin Interface**

### **User Connections Page**

The admin interface provides:

1. **Connection Form**:
   - Dropdown to select unconnected players
   - Dropdown to select unconnected users
   - Connect button to link them

2. **Players List**:
   - Shows all players with their connection status
   - Connected players show the linked user email
   - Disconnect button to remove connections
   - Search functionality to find specific players/users

3. **Visual Indicators**:
   - Green "Connected" status for linked players
   - Gray "Not connected" status for unlinked players
   - Clear separation between connected and unconnected

## 🔒 **Security Features**

### **Row Level Security (RLS)**
- **Users can only see their own player profile**
- **Admins can see all players and connections**
- **Users cannot modify player data directly**

### **Admin-Only Functions**
- **Connection management**: Only admins can connect/disconnect users
- **User listing**: Only admins can see all Supabase users
- **Player management**: Admins retain full control over players

## 🚀 **Usage Instructions**

### **For Administrators**

1. **Access the Interface**:
   - Sign in with admin credentials
   - Navigate to "User Connections" in the sidebar

2. **Connect Users to Players**:
   - Select an unconnected player from the dropdown
   - Select an unconnected user from the dropdown
   - Click "Connect User to Player"

3. **Manage Connections**:
   - View all players and their connection status
   - Use search to find specific players or users
   - Disconnect users from players if needed

### **For Users**

1. **Sign In**:
   - Use their assigned email/password
   - Navigate to "You" page

2. **View Player Profile**:
   - If connected: See their player information
   - If not connected: See message to contact admin

## 📋 **Admin Workflow Example**

### **Scenario: New Player Joins**

1. **Create Player Profile** (in existing Players page):
   - Username: "NewPlayer123"
   - Status: "Active"
   - Other player details

2. **User Signs Up** (or admin creates account):
   - Email: "newplayer@example.com"
   - Password: (user sets or admin provides)

3. **Connect in Admin Interface**:
   - Go to "User Connections"
   - Select "NewPlayer123" from player dropdown
   - Select "newplayer@example.com" from user dropdown
   - Click "Connect"

4. **User Can Now**:
   - Sign in with their email/password
   - See their player profile on "You" page
   - Participate in games as "NewPlayer123"

## 🔄 **API Functions**

### **Available Functions**

```typescript
// Connect player to user (admin only)
UserPlayerConnectionService.connectPlayerToUser(playerId: number, userId: string)

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
-- Connect existing player to user (admin only)
SELECT connect_player_to_user(123, 'user-uuid-here');

-- Get player by user ID
SELECT * FROM get_player_by_user_id(auth.uid());
```

## 🎯 **Benefits**

### **Admin Control**
- **Full control** over who gets player profiles
- **Prevents spam** and unauthorized account creation
- **Centralized management** of user-player relationships

### **User Experience**
- **Simple sign-in** process for assigned users
- **Clear status** showing if they have a player profile
- **Seamless integration** once connected

### **Security**
- **No self-registration** of player profiles
- **Admin-only assignment** prevents abuse
- **RLS policies** protect user data

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"User Connections" page not showing**:
   - Check if you're signed in as admin
   - Verify admin authentication is working

2. **Cannot connect users to players**:
   - Check if player is already connected
   - Check if user is already connected
   - Verify database functions are created

3. **Users can't see their player profile**:
   - Check if connection was successful
   - Verify user is signed in with correct account
   - Check RLS policies

### **Debug Steps**

1. Check Supabase logs for errors
2. Verify admin authentication status
3. Test database functions directly
4. Check browser console for errors

## ✅ **Ready to Use**

The system is now configured for admin-controlled user assignment:

1. **Run the SQL migration**
2. **Sign in as admin**
3. **Go to "User Connections"**
4. **Start connecting users to players**

Users can sign up, but only admins can assign them player profiles. This gives you complete control over who participates in your Borderland games!
