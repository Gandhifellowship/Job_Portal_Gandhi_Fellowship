# Vercel Deployment Setup Guide

## Quick Setup Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Configure for Gandhi Fellowship"
git push origin main
```

### 2. Import Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project

### 3. Configure Build Settings

Vercel should auto-detect, but verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### Required Variables (for all environments):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com
ADMIN_EMAILS=admin@example.com,hr@example.com
FROM_EMAIL=noreply@example.com
```

#### Optional Variables:

```
VITE_APP_NAME=Gandhi Fellowship Job Portal
VITE_APP_URL=https://your-vercel-app.vercel.app
```

**Important Notes:**
- For each variable, select **Production**, **Preview**, and **Development** environments
- `VITE_*` variables are exposed to the frontend
- `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only (not exposed to frontend)

### 5. API Routes Configuration

The `api/` folder contains serverless functions that work on Vercel:

- `api/send-application-notification.ts` - Handles job applications

These use `process.env` (not `import.meta.env`) because they run on the server.

**Note:** The API route checks for both:
- `NEXT_PUBLIC_SUPABASE_URL` OR `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

So you can use either naming convention.

### 6. Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

## Testing After Deployment

### 1. Test Frontend
- Visit your Vercel URL
- Check browser console for any errors
- Verify Supabase connection works

### 2. Test API Route
- Submit a job application
- Check Vercel Function Logs: **Deployments** → **Functions** → View logs
- Verify email is sent

### 3. Check Environment Variables
If you see errors about missing env vars:
- Go to **Settings** → **Environment Variables**
- Verify all variables are set
- Redeploy after adding new variables

## Vercel-Specific Configuration

The `vercel.json` file is already configured:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/send-application-notification.ts": {
      "maxDuration": 10
    }
  }
}
```

This ensures:
- API routes work correctly
- SPA routing works (all routes serve index.html)
- API function has 10s timeout (for file uploads)

## Troubleshooting

### Issue: "Missing Supabase configuration"
**Solution:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars

### Issue: API route returns 500 error
**Solution:** 
1. Check Vercel Function Logs
2. Verify `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are set
3. Check that `NEXT_PUBLIC_SUPABASE_URL` or `VITE_SUPABASE_URL` is set

### Issue: Build fails
**Solution:**
1. Check build logs in Vercel
2. Ensure `package.json` has correct scripts
3. Verify Node.js version (Vercel uses 18.x by default)

### Issue: Environment variables not working
**Solution:**
1. Variables must be added in Vercel Dashboard
2. Redeploy after adding variables
3. `VITE_*` vars are only available at build time for frontend
4. Server-side vars (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) work at runtime

## Environment Variable Reference

| Variable | Type | Used In | Required |
|----------|------|---------|----------|
| `VITE_SUPABASE_URL` | Frontend | Client-side Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Client-side Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | API routes | ✅ |
| `RESEND_API_KEY` | Server | Email sending | ✅ |
| `ADMIN_EMAIL` | Server | Email recipient | ✅ |
| `ADMIN_EMAILS` | Server | Email recipients (comma-separated) | ✅ |
| `FROM_EMAIL` | Server | Email sender | ✅ |
| `VITE_APP_NAME` | Frontend | App name | ❌ |
| `VITE_APP_URL` | Frontend | App URL | ❌ |

## Next Steps After Deployment

1. **Add Logo**: Upload `gandhi-fellowship-logo.png` to `public/` folder and commit
2. **Set Up Database**: Run SQL migrations in Supabase
3. **Test Complete Flow**: 
   - Create admin user
   - Post a job
   - Submit application
   - Verify email notification
4. **Configure Custom Domain** (optional): Settings → Domains

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations run in Supabase
- [ ] Logo file added to `public/` folder
- [ ] Admin user created in Supabase Auth
- [ ] Test job application flow end-to-end
- [ ] Email notifications working
- [ ] Custom domain configured (if needed)
