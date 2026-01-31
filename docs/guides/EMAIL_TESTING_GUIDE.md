# 📧 Email Functionality Testing Guide

## **How to Test the Email System**

### **Step 1: Add Dummy Jobs**
First, make sure you have jobs to apply for:

```sql
-- Run this in Supabase SQL Editor
INSERT INTO public.jobs (title, department, location, description, status, created_at) VALUES
('Senior Software Engineer', 'Engineering', 'Bangalore, India', 'We are looking for an experienced software engineer to join our development team.', 'active', NOW()),
('Data Scientist', 'Analytics', 'Mumbai, India', 'Join our data science team to analyze educational patterns.', 'active', NOW());
```

### **Step 2: Test Application Flow**

1. **Go to Jobs Page**: http://localhost:8081/jobs
2. **Click on a Job**: Select any job to view details
3. **Click "Apply Now"**: Opens application form
4. **Fill Out Form**:
   - Name: `Test Candidate`
   - Email: `test@example.com` (or your real email)
   - Phone: `+91-9876543210`
   - Cover Letter: `I am very interested in this position and would like to apply.`
   - Resume: Upload any PDF file

5. **Submit Application**: Click "Submit Application"

### **Step 3: Check Email Delivery**

**Expected Results:**
- ✅ **Success Message**: "Application submitted! Your reference number is VS-XXXX"
- ✅ **Email Sent**: Admin receives professional email notification
- ✅ **Database Record**: Application appears in admin dashboard

### **Step 4: Verify Email Content**

The email should contain:
- **Subject**: "New Job Application: [Job Title]"
- **Job Details**: Position, department, location
- **Candidate Info**: Name, email, phone, reference number
- **Cover Letter**: Full text
- **Resume Link**: Download button for PDF
- **Professional Styling**: Branded HTML template

### **Step 5: Check Admin Dashboard**

1. **Login to Admin**: http://localhost:8081/admin/login
2. **Go to Applications Tab**: View submitted applications
3. **Verify Data**: Check all application details are correct

## **Troubleshooting Email Issues**

### **If Email Not Received:**

1. **Check Spam Folder**: Emails might go to spam
2. **Verify Resend API Key**: Check Supabase environment variables
3. **Check Edge Function Logs**: Look for errors in Supabase dashboard
4. **Test with Different Email**: Try with Gmail, Outlook, etc.

### **Common Issues:**

**Issue**: "Failed to send email"
- **Solution**: Check RESEND_API_KEY in Supabase environment variables

**Issue**: "Edge function not found"
- **Solution**: Deploy the edge function in Supabase

**Issue**: "Application submitted but no email"
- **Solution**: Check email address in edge function (line 51)

### **Environment Variables Needed:**

In Supabase Dashboard → Settings → Environment Variables:
- `RESEND_API_KEY`: Your Resend API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

## **Email Configuration**

**Current Setup:**
- **Job Application Emails**: Sent to addresses configured in `ADMIN_EMAILS` environment variable
- **From Address**: Configured via `FROM_EMAIL` environment variable
- **Admin Login**: Use your configured admin credentials

## **Expected Email Template**

The email will look like this:

```
Subject: New Job Application: Senior Software Engineer

New Job Application Received

Job Details:
- Position: Senior Software Engineer
- Department: Engineering  
- Location: Bangalore, India

Candidate Information:
- Name: Test Candidate
- Email: test@example.com
- Phone: +91-9876543210
- Reference Number: VS-12345

Cover Letter:
I am very interested in this position and would like to apply.

[Download Resume Button]

This is an automated notification from the job application system.
```

## **Success Indicators**

✅ **Application Form**: Shows success message with reference number
✅ **Database**: New record in applications table
✅ **Email**: Admin receives notification email
✅ **Admin Dashboard**: Application appears in applications list
✅ **File Storage**: Resume uploaded to Supabase Storage

## **Next Steps After Testing**

1. **Verify Email Delivery**: Check admin inbox
2. **Test Different Scenarios**: Try with different jobs
3. **Check Error Handling**: Test with invalid data
4. **Verify File Upload**: Test different PDF sizes
5. **Test Admin Dashboard**: View applications in admin panel

Let me know what happens when you test it! 🧪
