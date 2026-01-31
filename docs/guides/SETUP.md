# Job Application Platform - Setup Guide

## Overview
This is a complete job application platform built with React, Vite, Supabase, and Resend for email notifications.

## Features Implemented

### ✅ Core Features
- **Admin Dashboard**: Complete job management system with authentication
- **Job Postings**: Create, edit, and manage job postings with PDF uploads
- **Application System**: Full application form with file upload and validation
- **Search & Filter**: Advanced job search and filtering capabilities
- **Email Notifications**: Automated email notifications for new applications
- **Responsive Design**: Mobile-first design with modern UI components
- **File Storage**: Secure file storage for job PDFs and candidate resumes

### ✅ Technical Implementation
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with protected routes
- **File Storage**: Supabase Storage buckets
- **Email**: Resend API integration
- **Form Handling**: React Hook Form with Zod validation

## Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Resend API Configuration
RESEND_API_KEY=your_resend_api_key_here

# Admin Email Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_EMAILS=admin@example.com,hr@example.com
FROM_EMAIL=noreply@example.com

# Application Configuration
VITE_APP_NAME=Job Portal
VITE_APP_URL=http://localhost:5173
```

## Database Setup

The database schema is already set up with the following tables:
- `jobs`: Job postings with PDF support
- `applications`: Candidate applications with reference numbers

Note: Update table names in the codebase to match your database schema.

### Storage Buckets
- `job-pdfs`: Public bucket for job description PDFs
- `resumes`: Private bucket for candidate resumes

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Supabase Edge Functions

The email notification system uses Supabase Edge Functions:
- `send-application-notification`: Sends email notifications when applications are submitted

To deploy the edge function:
```bash
supabase functions deploy send-application-notification
```

## Application Flow

### For Candidates
1. Visit homepage to see company information
2. Browse job listings with search and filter
3. Click on job to view details and PDF
4. Fill out application form with resume upload
5. Receive confirmation with reference number

### For Admins
1. Login via admin portal
2. Create and manage job postings
3. Upload job description PDFs
4. View all applications with status tracking
5. Download candidate resumes
6. Update application statuses

## Security Features
- Row Level Security (RLS) policies
- File type validation (PDF only)
- File size limits (5MB for resumes, 10MB for job PDFs)
- Secure file storage with proper access controls
- Authentication required for admin functions

## Deployment
The application is ready for deployment on Vercel with:
- Serverless functions for API routes
- Supabase for backend services
- Resend for email delivery

## Missing Features (Optional Enhancements)
- Bulk job management actions
- Advanced application filtering
- Email templates customization
- Application status notifications to candidates
- Analytics dashboard
- Multi-language support

