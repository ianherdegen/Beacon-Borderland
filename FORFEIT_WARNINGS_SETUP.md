# Automated Forfeit Warning Emails Setup

This guide will help you set up automated email warnings for players approaching their forfeit deadline.

## 🎯 **How It Works**

The system sends a single warning email:
- **1 Day Before Forfeit** (48-72 hours after last game)

Players forfeit after **72 hours** of inactivity.

## 🚀 **Setup Steps**

### 1. Deploy the Forfeit Warnings Function

```bash
# Deploy the new Edge Function
supabase functions deploy forfeit-warnings
```

### 2. Set Up Cron Job (Recommended: GitHub Actions)

Create `.github/workflows/forfeit-warnings.yml`:

```yaml
name: Forfeit Warning Emails

on:
  schedule:
    # Run daily at 9 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  send-warnings:
    runs-on: ubuntu-latest
    steps:
      - name: Send Forfeit Warnings
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://your-project-ref.supabase.co/functions/v1/forfeit-warnings
        env:
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### 3. Alternative: Supabase Cron (Database Level)

Run this SQL in your Supabase SQL editor:

```sql
-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION send_forfeit_warnings()
RETURNS void AS $$
BEGIN
  -- This would need to be implemented as a webhook call
  -- For now, use GitHub Actions or external cron service
  RAISE NOTICE 'Forfeit warnings should be sent via external cron job';
END;
$$ LANGUAGE plpgsql;

-- Schedule it to run every hour
SELECT cron.schedule(
  'forfeit-warnings',
  '0 * * * *', -- Every hour
  'SELECT send_forfeit_warnings();'
);
```

### 4. Test the Function

```bash
# Test manually
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://your-project-ref.supabase.co/functions/v1/forfeit-warnings
```

## 📧 **Email Content**

The emails include:
- **Player's username**
- **Time remaining** before forfeit
- **Hours since last game**
- **Call-to-action button** to join a game
- **Branded styling** matching your app

## ⚙️ **Configuration**

### Environment Variables Required:
- `RESEND_API_KEY` (already set up)
- `SUPABASE_URL` (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically available)

### Customization Options:

1. **Change warning interval** in `forfeit-warnings/index.ts`:
   ```typescript
   const oneDayBefore = 48 // 48 hours (72 - 24)
   const oneDayAfter = 72 // 72 hours (forfeit deadline)
   ```

2. **Update email template** in the `sendForfeitWarning` function

3. **Change forfeit deadline** (currently 72 hours)

## 🔍 **Monitoring**

The function returns:
- Number of players processed
- Number of emails sent
- Details of each email sent

Check the Supabase Edge Functions logs to monitor:
- Successful email sends
- Any errors or failures
- Player processing statistics

## 🚨 **Important Notes**

1. **Only sends to connected users**: Players must have a `user_id` to receive emails
2. **Active players only**: Eliminated players are not checked
3. **One email per interval**: Players won't get duplicate warnings
4. **Automatic cleanup**: No manual intervention needed

## 🛠️ **Troubleshooting**

### Common Issues:

1. **No emails sent**: Check if players have `user_id` connected
2. **Function errors**: Check Supabase Edge Functions logs
3. **Resend API errors**: Verify `RESEND_API_KEY` is correct
4. **Cron not running**: Check GitHub Actions or cron service status

### Testing:

```bash
# Check function logs
supabase functions logs forfeit-warnings

# Test with specific player data
# (You can modify the function temporarily to test with specific players)
```

## 📊 **Expected Results**

- **Daily checks**: Function runs once per day at 9 AM UTC
- **Targeted emails**: Only players in the 48-72 hour window get warnings
- **Professional emails**: Branded, informative warning messages
- **Automatic processing**: No manual intervention required

This system will help keep players engaged and reduce unexpected forfeits!
