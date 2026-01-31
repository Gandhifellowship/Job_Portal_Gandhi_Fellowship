# Local Testing Guide - Job Application Platform

## 🚀 Quick Start

The development server should now be running. You can access the application at:
**http://localhost:5173**

## 📋 What You Can Test Locally

### 1. **Homepage** (http://localhost:5173/)
- Professional landing page with company information
- Navigation to job listings and admin login

### 2. **Job Listings** (http://localhost:5173/jobs)
- Browse available job postings
- Search and filter functionality
- Click "View Details" to see individual jobs

### 3. **Job Detail Pages** (http://localhost:5173/jobs/[id])
- View job information and embedded PDFs
- Apply for positions using the application form
- File upload with validation

### 4. **Admin Login** (http://localhost:5173/admin/login)
- Secure admin authentication
- Access to admin dashboard

### 5. **Admin Dashboard** (http://localhost:5173/admin/dashboard)
- Create new job postings
- Manage existing jobs (activate/deactivate)
- View and track applications
- Download candidate resumes

## 🔧 For Full Functionality Testing

To test the complete application flow, you'll need to set up:

### Environment Variables
Create a `.env` file in the root directory:

```env
# Supabase Configuration (get from your Supabase project)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend API (for email notifications)
RESEND_API_KEY=your_resend_api_key_here

# Admin Email
ADMIN_EMAIL=admin@example.com
ADMIN_EMAILS=admin@example.com,hr@example.com
FROM_EMAIL=noreply@example.com
```

### Database Setup
The database schema is already configured in the migration files:
- `jobs` table (update table name to match your schema)
- `applications` table (update table name to match your schema)
- Storage buckets for PDFs and resumes

## 🧪 Testing Scenarios

### Without Database Connection (UI Only)
1. **Navigation**: Test all page routes and navigation
2. **Forms**: Try filling out forms (will show validation errors)
3. **UI Components**: Test responsive design and interactions
4. **File Uploads**: Test file selection (validation works client-side)

### With Database Connection (Full Functionality)
1. **Create Admin Account**: Sign up for admin access
2. **Post Jobs**: Upload job PDFs and create job postings
3. **Apply for Jobs**: Submit applications with resumes
4. **Manage Applications**: Track and update application statuses
5. **Email Notifications**: Receive emails when applications are submitted

## 🎯 Key Features to Test

### ✅ **Already Working (UI Only)**
- Responsive design and navigation
- Form validation and error handling
- File upload interface
- Professional UI components

### ⚡ **Needs Database Setup**
- Job creation and management
- Application submission
- Email notifications
- File storage and retrieval

## 🐛 Troubleshooting

### Common Issues:
1. **Port already in use**: Try `npm run dev -- --port 3000`
2. **Module not found**: Run `npm install` again
3. **Database errors**: Check Supabase connection and environment variables

### Development Commands:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check for code issues
```

## 📱 Mobile Testing
The application is fully responsive. Test on different screen sizes:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🎨 UI Components to Explore
- Job cards with hover effects
- Search and filter interface
- Application form with file upload
- Admin dashboard with tabs
- Toast notifications
- Loading states and error handling

The application is ready for local testing! Start with the UI components and navigation, then set up the database for full functionality testing.
