# 🔐 Admin Setup Guide - Job Portal

## **Admin Credentials Setup**

### **Create your admin credentials:**
- **Email:** Set your admin email address
- **Password:** Create a strong password

## **How to Set Up Admin Access**

### **Option 1: Using Supabase Dashboard (Recommended)**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to your project

2. **Access Authentication**
   - Click on "Authentication" in the left sidebar
   - Go to "Users" tab

3. **Create Admin User**
   - Click "Add User" button
   - Enter the following details:
     - **Email:** Your admin email address
     - **Password:** Your secure password
     - **Auto Confirm User:** ✅ (check this box)
   - Click "Create User"

4. **Test Admin Login**
   - Go to your app: http://localhost:8080/admin/login
   - Use the credentials above to log in

### **Option 2: Using Supabase SQL Editor**

1. **Open SQL Editor**
   - Go to your Supabase Dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run Admin Creation Query**
   ```sql
   -- Create admin user
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     created_at,
     updated_at,
     confirmation_token,
     email_change,
     email_change_token_new,
     recovery_token
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'admin@example.com',
     crypt('YourSecurePassword123!', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW(),
     '',
     '',
     '',
     ''
   );
   ```

3. **Test Admin Login**
   - Go to: http://localhost:8080/admin/login
   - Use your admin credentials

## **Adding Dummy Jobs for Testing**

### **Method 1: Using SQL Editor (Recommended)**

1. **Open SQL Editor in Supabase Dashboard**
2. **Copy and paste the contents of `DUMMY_JOBS.sql`**
3. **Click "Run" to execute the query**

### **Method 2: Using Admin Dashboard**

1. **Login as admin** using the credentials above
2. **Go to Admin Dashboard**
3. **Click "Add New Job"**
4. **Manually add jobs** using the form

## **Testing Features**

### **✅ What You Can Test:**

1. **Job Listings**
   - View all 10 dummy jobs on homepage and jobs page
   - Search and filter functionality
   - Job detail pages

2. **Admin Dashboard**
   - Login with admin credentials
   - View job statistics
   - Create new jobs
   - Manage existing jobs (activate/deactivate)
   - View applications (once candidates apply)

3. **Application System**
   - Apply for jobs as a candidate
   - Upload resume (PDF only)
   - Receive reference numbers
   - Email notifications to admin

4. **File Management**
   - Upload job PDFs
   - Upload candidate resumes
   - Secure file storage

## **Security Notes**

⚠️ **Important:** These are temporary credentials for testing only!

- Change the admin password before going to production
- Use a real email address for production
- Set up proper email verification
- Configure additional security measures

## **Troubleshooting**

### **Can't Login as Admin?**
1. Check if user was created in Supabase Authentication
2. Verify email is confirmed
3. Try resetting password in Supabase Dashboard

### **Dummy Jobs Not Showing?**
1. Check if SQL query executed successfully
2. Verify jobs have `status = 'active'`
3. Refresh the application

### **Need Help?**
- Check Supabase logs in the Dashboard
- Verify environment variables are set correctly
- Ensure database tables exist and have proper permissions

## **Next Steps After Testing**

1. **Create Real Admin Account**
2. **Add Real Job Postings**
3. **Configure Email Notifications**
4. **Set Up Production Environment**
5. **Test Complete Application Flow**

Happy Testing! 🚀
