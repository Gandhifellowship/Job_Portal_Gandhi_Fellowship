# Create Test Users via Supabase Dashboard

Since SQL user creation is causing authentication issues, let's create users through Supabase Dashboard:

## **Method 1: Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard** → Your Project → Authentication → Users
2. **Click "Add User"** button
3. **Create each user:**

### **User 1: John Doe**
- **Email:** `john.doe@example.com`
- **Password:** `password123`
- **Auto Confirm User:** ✅ (check this)
- **User Metadata:** `{"name": "John Doe"}`

### **User 2: Jane Smith**
- **Email:** `jane.smith@example.com`
- **Password:** `password123`
- **Auto Confirm User:** ✅ (check this)
- **User Metadata:** `{"name": "Jane Smith"}`

### **User 3: Mike Johnson**
- **Email:** `mike.johnson@example.com`
- **Password:** `password123`
- **Auto Confirm User:** ✅ (check this)
- **User Metadata:** `{"name": "Mike Johnson"}`

## **Method 2: Simple SQL (Alternative)**

If you prefer SQL, run this simpler version:

```sql
-- Delete existing test users first
DELETE FROM auth.users WHERE email IN (
  'jane.smith@example.com',
  'john.doe@example.com', 
  'mike.johnson@example.com'
);

-- Then create them via Supabase Dashboard as shown above
```

## **After Creating Users:**

1. **Run the check script** `check-user-auth-status.sql` to verify
2. **Try logging in** with the credentials
3. **If still failing**, the issue might be with RLS policies or Supabase configuration

## **Troubleshooting:**

- **400 Bad Request** usually means invalid credentials or user doesn't exist
- **Check Supabase logs** in Dashboard → Logs → Auth
- **Verify email confirmation** is set to true
- **Check RLS policies** aren't blocking authentication
