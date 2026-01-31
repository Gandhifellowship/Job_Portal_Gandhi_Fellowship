# Migration to a New Git Repository

We are migrating this project to a **new, plain Git repository** (no history copied over).

**Reason:** To avoid exposing environment variables, API keys, or any sensitive data that may have been committed or referenced in the old repository’s history. Starting with a single initial commit in a fresh repo keeps the new repository clean and safe for the Gandhi Fellowship deployment.

**What we did:**
- Removed all VigyanShaala–specific references, keys, and branding from the codebase.
- Replaced secrets with environment variables (e.g. `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_EMAIL`, etc.).
- Rebranded for Gandhi Fellowship; single setup migration at `supabase/migrations/000_SETUP_NEW_DATABASE.sql`.

**Next steps:**
1. Copy this folder to the new location **without** the `.git` directory (and without `node_modules`, `.env`, `dist`).
2. In the new folder: `git init`, then create an initial commit and push to the new remote.
3. Configure env vars in the new deployment (Vercel, Supabase, etc.) — never commit real values.

This file can be kept in the new repo as a short record of why the migration was done.
