# Documentation

This directory contains all project documentation organized by category.

## Structure

```
docs/
├── README.md                    # This file
├── guides/                      # Setup and usage guides
│   ├── ADMIN_SETUP_GUIDE.md
│   ├── SETUP.md
│   ├── LOCAL_TESTING.md
│   ├── EMAIL_TESTING_GUIDE.md
│   ├── VERCEL_ENV_SETUP.md
│   ├── User_roles_access_learnings.md
│   └── create-users-via-supabase-dashboard.md
└── archive/                     # Archived documentation (moved to root archive)
```

## Quick Links

### Setup & Configuration
- [Setup Guide](guides/SETUP.md) - Development environment setup
- [Admin Setup](guides/ADMIN_SETUP_GUIDE.md) - Admin user configuration
- [Vercel Environment](guides/VERCEL_ENV_SETUP.md) - Production deployment

### Testing & Development
- [Local Testing](guides/LOCAL_TESTING.md) - Local development testing
- [Email Testing](guides/EMAIL_TESTING_GUIDE.md) - Email functionality testing

### User Management
- [Create Users](guides/create-users-via-supabase-dashboard.md) - User creation via Supabase Dashboard
- [Product Overview](PRODUCT_OVERVIEW.md) - Features, stack, and roadmap concepts

## Database Documentation
- **Current setup:** Run [000_SETUP_NEW_DATABASE.sql](../supabase/migrations/000_SETUP_NEW_DATABASE.sql) then [001_rename_three_user_job_access_to_user_job_access.sql](../supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql) in Supabase SQL Editor. See [SUPABASE_SETUP_GUIDE.md](../SUPABASE_SETUP_GUIDE.md) at repo root.
- **Removed legacy files:** See [LEGACY_DATABASE_AND_REMOVED_FILES.md](LEGACY_DATABASE_AND_REMOVED_FILES.md) for what was removed and how to recreate similar features if needed.

## Project Overview
See [README.md](../README.md) for project overview and quick start guide.
