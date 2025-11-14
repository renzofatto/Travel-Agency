# Storage Setup Instructions - URGENT

## Error: "new row violates row-level security policy"

This error occurs when trying to upload photos because the Supabase Storage buckets and their RLS policies haven't been configured yet.

## Quick Fix (5 minutes)

### Step 1: Create Storage Buckets

1. Go to your **Supabase Dashboard**
2. Click on **Storage** in the left sidebar
3. Click **"Create a new bucket"**

Create these 3 buckets:

#### Bucket 1: travel-documents
- **Name**: `travel-documents`
- **Public**: ❌ **NO** (private)
- Click "Create bucket"

#### Bucket 2: photos
- **Name**: `photos`
- **Public**: ✅ **YES** (public)
- Click "Create bucket"

#### Bucket 3: avatars
- **Name**: `avatars`
- **Public**: ✅ **YES** (public)
- Click "Create bucket"

### Step 2: Apply RLS Policies

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Copy and paste the **ENTIRE** content from `supabase/storage-setup.sql`
4. Click **"Run"** (or press Cmd/Ctrl + Enter)

**IMPORTANT**: Make sure you run ALL the SQL from the file, not just parts of it.

## Verification

After running the SQL, verify the policies were created:

```sql
-- Check storage policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
```

You should see policies like:
- "Group members can upload documents"
- "Group members can upload photos"
- "Photos are publicly accessible"
- "Users can upload their own avatar"
- "Avatars are publicly accessible"
- etc.

## If You Get Errors

### Error: "bucket already exists"
- This is OK, the bucket was already created
- Continue with the RLS policies

### Error: "policy already exists"
- This means the policy was already created
- You can safely ignore this or drop the policy first:
```sql
DROP POLICY IF EXISTS "policy-name" ON storage.objects;
```

### Error: "permission denied"
- Make sure you're using the correct Supabase project
- Make sure you have admin access to the project

## What Each Bucket Does

1. **travel-documents** (Private)
   - Stores trip documents (tickets, reservations, etc.)
   - Only group members can view
   - Only uploader or admin can delete

2. **photos** (Public)
   - Stores trip photos
   - Anyone can view (public URLs)
   - Only uploader or admin can delete

3. **avatars** (Public)
   - Stores user profile pictures
   - Anyone can view (public URLs)
   - Only the user can upload/update/delete their own avatar

## Testing After Setup

1. **Refresh your browser** (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
2. Navigate to a group's Photos page
3. Click "Upload Photos"
4. Select one or more images
5. Click "Upload"
6. Photos should upload successfully

If you still get errors after following these steps, check:
- The bucket names are EXACTLY as specified (lowercase, no spaces)
- All SQL policies were executed without errors
- Your user is a member of the group you're uploading to

## Full SQL Script Location

The complete SQL script is in:
📄 `supabase/storage-setup.sql`

This file contains:
- ✅ All bucket creation commands (commented, use UI instead)
- ✅ All RLS policies for documents
- ✅ All RLS policies for photos
- ✅ All RLS policies for avatars

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check the Supabase logs in Dashboard → Database → Logs
3. Verify your user ID matches in the database
4. Make sure you're logged in and authenticated
