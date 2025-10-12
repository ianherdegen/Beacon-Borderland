# Simple Email Test Setup

This is a basic "Hello World" email test setup for your Borderland app.

## 🚀 Quick Setup

### 1. Deploy the Supabase Edge Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy send-email
```

### 2. Test the Email Function

1. **Login as Admin** in your app
2. **Click the "Test Email" button** in the header (next to your admin profile)
3. **Check the console** - you should see the email details logged
4. **Check Supabase Function logs** for the actual email data

### 3. What Happens

- The button sends a test email to `admin@example.com`
- The email is logged to the console (not actually sent)
- You'll see a success toast notification
- Check browser console and Supabase function logs for details

## 🔧 Next Steps - Add Real Email Service

### **Option 1: Use Resend (Recommended - Free & Easy)**

1. **Sign up for Resend**:
   - Go to [resend.com](https://resend.com)
   - Sign up (no credit card required)
   - Get your API key from the dashboard

2. **Add API Key to Supabase**:
   - Go to your Supabase dashboard
   - Navigate to **Settings** > **Edge Functions**
   - Add environment variable: `RESEND_API_KEY` = your API key

3. **Update the "from" address**:
   - In the Edge Function code, replace `noreply@yourdomain.com` with your actual domain
   - Or use Resend's default domain for testing

4. **Redeploy the function** with the updated code

### **Option 2: Keep Console Logging**
- The function will work without an API key (just logs to console)
- Good for development and testing

## 📝 Current Implementation

- **Simple Edge Function**: Logs emails to console
- **Test Button**: Only visible to authenticated admins
- **Basic Error Handling**: Shows success/error toasts
- **No Database Changes**: Just a simple function call

## 🐛 Troubleshooting

- **Button not visible**: Make sure you're logged in as admin
- **Function not found**: Check that the Edge Function is deployed
- **Console errors**: Check browser console and Supabase function logs

This is a minimal setup to test the basic email functionality before adding more complex features.
