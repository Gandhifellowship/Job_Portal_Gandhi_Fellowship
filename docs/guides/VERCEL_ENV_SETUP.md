# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in your Vercel Dashboard:

### 1. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Email Configuration
```
RESEND_API_KEY=your_resend_api_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_EMAILS=admin@example.com,hr@example.com
FROM_EMAIL=noreply@example.com
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with your actual values:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Production, Preview, Development
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - **Environment**: Production, Preview, Development
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Production, Preview, Development
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - **Environment**: Production, Preview, Development
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your Supabase service role key
   - **Environment**: Production, Preview, Development
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
   - **Environment**: Production, Preview, Development
   - **Name**: `ADMIN_EMAIL`
   - **Value**: Your admin email address
   - **Environment**: Production, Preview, Development
   - **Name**: `ADMIN_EMAILS`
   - **Value**: Comma-separated list of admin emails
   - **Environment**: Production, Preview, Development
   - **Name**: `FROM_EMAIL`
   - **Value**: Your email sender address
   - **Environment**: Production, Preview, Development
5. Repeat for all variables above

## Important Notes

- **SUPABASE_ANON_KEY**: This is the anon key from your Supabase Dashboard → Settings → API
- **Never commit service role keys to Git** - they should only be in Vercel environment variables
- **RESEND_API_KEY**: Already provided by user
- **SUPABASE_ANON_KEY**: Used in both API route and frontend client.ts

## Verification

After adding environment variables:
1. Redeploy your Vercel app
2. Test the application form submission
3. Check Vercel Function Logs for any errors
4. Verify emails are being sent to your configured admin email addresses
