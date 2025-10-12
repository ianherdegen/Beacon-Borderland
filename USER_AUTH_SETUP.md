# User Authentication Setup Guide

## 🚀 **Supabase Configuration**

### **Step 1: Enable Email Authentication**
1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** > **Settings**
3. Under **Auth Providers**, ensure **Email** is enabled
4. Configure these settings:
   - ✅ **Enable email confirmations** (recommended)
   - ✅ **Enable email change confirmations**
   - ❌ **Enable phone confirmations** (not needed)

### **Step 2: Configure Email Templates (Optional)**
1. Go to **Authentication** > **Email Templates**
2. Customize the **Confirm signup** template to match your app's branding
3. Your existing Resend setup will handle these emails automatically

### **Step 3: Set Up URL Configuration**
1. In **Authentication** > **URL Configuration**
2. Set **Site URL**: Your app's URL
   - Development: `http://localhost:5173`
   - Production: Your actual domain
3. Set **Redirect URLs**: Add your app's URL

### **Step 4: Test the Setup**
1. **Start your app** locally
2. **Click "Sign Up"** in the header
3. **Enter an email and password**
4. **Check your email** for verification link
5. **Click the verification link**
6. **Sign in** with your credentials

## 🔒 **Security Features**

### **What's Protected**
- **"You" page**: Only visible when logged in
- **User data**: Only accessible to authenticated users
- **Email verification**: Required for new accounts

### **What's Public**
- **Overview, Players, Arenas, etc.**: All public pages remain accessible
- **Chat**: Public chat functionality
- **Admin features**: Separate from user authentication

## 🎯 **User Experience**

### **For Non-Authenticated Users**
- See "Sign In" and "Sign Up" buttons in header
- Can access all public pages
- "You" page is hidden from sidebar

### **For Authenticated Users**
- See their email in header
- "You" page appears in sidebar
- Can sign out from "You" page

### **For Admins**
- Separate admin login system
- Admin features remain unchanged
- Can be both admin and regular user

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Email not received**: Check spam folder, verify Resend setup
2. **Verification link not working**: Check URL configuration in Supabase
3. **"You" page not showing**: Make sure user is logged in
4. **Sign up fails**: Check Supabase logs for errors

### **Debug Steps**
1. Check browser console for errors
2. Check Supabase Authentication logs
3. Verify email configuration
4. Test with a different email address

## 📧 **Email Integration**

Your existing Resend setup will automatically handle:
- **Sign-up verification emails**
- **Password reset emails** (if enabled)
- **Email change confirmations**

All emails will come from `noreply@thebeaconhq.com` with your app's branding.

## ✅ **Ready to Use**

Once configured, users can:
1. **Sign up** with email/password
2. **Verify their email** via Resend
3. **Sign in** to access their account
4. **View their profile** on the "You" page
5. **Sign out** when done

The system is now ready for user authentication!
