# Gandhi Fellowship Job Posting System

## Project Overview

A comprehensive job posting and application management system for Gandhi Fellowship, featuring role-based access control, user management, and archive functionality.

**Version**: 1.41  
**Last Updated**: 2025-01-24

## Key Features

- **Job Management**: Create, edit, archive, and delete job postings
- **Application Management**: View, filter, archive, and manage job applications
- **User Management**: Role-based access control (Admin, Manager, HR, etc.)
- **Archive System**: Archive jobs and applications while preserving data
- **Advanced Filtering**: Multi-select filters and search functionality
- **Export Capabilities**: Export applications to Excel
- **Responsive Design**: Mobile-friendly interface

## Quick Start

### Database Setup
```sql
-- Run this in Supabase SQL Editor for production setup
\i database/production-setup.sql
```

### Development
```bash
npm install
npm run dev
```

## Documentation

- [Database Setup](database/README.md) - Complete database documentation
- [Documentation Index](docs/README.md) - All project documentation
- [Setup Guide](docs/guides/SETUP.md) - Development setup instructions
- [User Management](docs/guides/User_roles_access_learnings.md) - RBAC implementation guide

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/82a53c82-3bc3-49b7-aedb-b03fd128de5b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/82a53c82-3bc3-49b7-aedb-b03fd128de5b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
