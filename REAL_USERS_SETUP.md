# Setting Up Real User Access

## 🎯 **Current Status**

Right now, the User Connections page shows test accounts because the Supabase admin API isn't properly configured. Here's how to get real users:

## 🔧 **Option 1: Use Service Role Key (Recommended)**

### **Step 1: Get Your Service Role Key**
1. Go to your **Supabase Dashboard**
2. Navigate to **Settings > API**
3. Copy your **Service Role Key** (not the anon key)
4. It should start with `eyJ...` and be much longer than your anon key

### **Step 2: Add to Environment Variables**
Add this to your `.env.local` file:

```bash
# Add this line to your .env.local
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Step 3: Update Supabase Client**
The current setup uses the anon key. To use the service role key for admin operations, you'd need to create a separate admin client.

## 🔧 **Option 2: Create a Users Table (Alternative)**

If the admin API doesn't work, create a users table that syncs with auth:

### **Step 1: Create Users Table**
```sql
-- Create a users table that mirrors auth.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow admins to see all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (true); -- You might want to add admin check here

-- Function to sync users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### **Step 2: Update the Code**
Then update the UserPlayerConnectionManager to use this table instead of the admin API.

## 🔧 **Option 3: Manual User Management**

### **Create Users Manually**
1. **Sign up users** through your app's sign-up process
2. **Note their email addresses**
3. **Manually add them** to a users table or list

### **Simple Approach**
Create a simple users table with just the emails you want to manage:

```sql
CREATE TABLE public.managed_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your users
INSERT INTO public.managed_users (email) VALUES 
  ('user1@example.com'),
  ('user2@example.com'),
  ('user3@example.com');
```

## 🚀 **Quick Fix for Now**

### **Immediate Solution**
1. **Sign up some test users** through your app's sign-up process
2. **Note their email addresses**
3. **Replace the mock users** in the code with real emails

### **Update Mock Users**
In `UserPlayerConnectionManager.tsx`, replace the mock users with real ones:

```typescript
const mockUsers = [
  { id: 'real-user-id-1', email: 'realuser1@example.com', created_at: new Date().toISOString() },
  { id: 'real-user-id-2', email: 'realuser2@example.com', created_at: new Date().toISOString() },
  // Add more real users here
];
```

## 🔍 **Check Current Users**

### **See Who's Signed Up**
1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication > Users**
3. You should see all users who have signed up
4. Copy their email addresses and IDs

### **Test the Connection**
1. **Sign up a test user** through your app
2. **Note their email** from the Supabase dashboard
3. **Update the mock users** with real data
4. **Test the connection** functionality

## 🎯 **Recommended Next Steps**

1. **Sign up a few test users** through your app
2. **Check the Supabase dashboard** to see their details
3. **Replace mock users** with real user data
4. **Test the connection** functionality
5. **Set up proper admin API** access for production

## 🐛 **Troubleshooting**

### **If Admin API Still Doesn't Work**
- Check if you're using the correct service role key
- Verify the key has admin permissions
- Check Supabase logs for errors
- Consider using the users table approach instead

### **If Users Don't Show Up**
- Make sure users have actually signed up
- Check the Supabase dashboard for user list
- Verify the email addresses are correct
- Check browser console for errors

The system will work with real users once you replace the mock data with actual user information from your Supabase dashboard!
