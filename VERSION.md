# Job Posting Application - Version History

## Version 1.0
**Core Features:**
- Job posting and management
- Application submission form
- Admin dashboard with job/applications view
- Excel export functionality
- Row Level Security (RLS) for data protection
- Admin authentication with service role access

## Version 1.1
**Grid View Enhancements:**
- Excel-like grid view for applications
- Custom column management (add/edit/delete)
- Text and dropdown column types with color coding
- Auto-height rows with text wrapping
- Vertical column separators
- Column filtering, sorting, and hiding
- Inline cell editing
- AG Grid integration for advanced table features

## Version 1.3
**Enhanced Filtering:**
- Enhanced applications list filters
- Multi-select filters
- Dynamic filter generation
- Custom field filters
- Improved filter persistence

## Version 1.4
**Archive & User Management:**
- Archive functionality for jobs and applications
- User management system with role-based access
- Job assignment system for managers
- Role-based access control (Admin, Manager, HR)
- Enhanced security with RLS policies
- Code quality improvements
- Enterprise-grade features and form state management
- Production-ready fixes for custom fields and user management

## Version 1.4.1
**Bug Fixes:**
- Fix: Add SPA routing rewrites to vercel.json to resolve 404 errors on job detail pages
- Fix: Dashboard error - remove unused updateCustomFieldValue reference
- Fix: Custom field persistence issues
- UI: Replace branding image with organization logo
- Maintenance: Clean up project files and consolidate database files

## Version 1.41 (Current)
**Critical Fixes:**
- Fix: Job update now preserves existing PDF URL when no new file is uploaded
- Fix: Job update now correctly updates PDF and text fields when new file is uploaded
- Fix: Add WITH CHECK clause to admin_manage_jobs RLS policy for proper UPDATE operations

---
*Last Updated: January 2025*
