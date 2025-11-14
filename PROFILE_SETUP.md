# Profile Editing Setup Guide

This guide explains how to set up the profile editing functionality, including avatar uploads.

## ✅ What's Implemented

The profile editing system includes:

1. **Edit Profile Information**
   - Update full name
   - Email display (read-only)
   - Form validation with Zod
   - Success/error toast notifications

2. **Avatar Upload**
   - Upload profile pictures (JPG, PNG, WEBP)
   - Maximum file size: 5MB
   - Image preview before upload
   - Automatic deletion of old avatar when updating
   - Fallback to initials if no avatar

3. **Server Actions**
   - `updateProfile()` - Update user profile information
   - `updateAvatar()` - Handle avatar upload to Supabase Storage

## 🔧 Supabase Storage Setup

To enable avatar uploads, you need to create the `avatars` bucket in Supabase:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Yes (check this box)
   - **File size limit**: 5MB (optional)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp` (optional)
5. Click **"Create bucket"**

### Option 2: Via SQL

Run this SQL in the Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

### Apply Storage Policies

After creating the bucket, run the following SQL to apply security policies:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Note**: These policies are also included in `supabase/storage-setup.sql`.

## 📁 Files Created

### Server Actions
- `lib/actions/profile-actions.ts` - Profile update and avatar upload actions

### Validation
- `lib/validations/profile.ts` - Zod schemas for profile updates

### Components
- `components/profile/profile-content.tsx` - Main profile display with edit capabilities
- `components/profile/edit-profile-form.tsx` - Form for editing profile information
- `components/profile/edit-avatar-dialog.tsx` - Dialog for uploading avatar

### Pages
- `app/dashboard/profile/page.tsx` - Updated to support editing

## 🎨 Features

### Profile Information Editing
- Click the **"Edit Profile"** button in the top right
- Update your full name
- Click **"Save Changes"** to apply
- Receives success/error feedback via toasts

### Avatar Upload
- Click the **camera icon** on the avatar
- Choose an image file (JPG, PNG, or WEBP)
- Preview the image before uploading
- Click **"Upload"** to save
- Old avatar is automatically deleted

## 🔒 Security

- Users can only update their own profile
- Avatar uploads are scoped to user folders: `avatars/{user_id}/avatar-{timestamp}.ext`
- RLS policies ensure users cannot access other users' upload permissions
- File type and size validation on both client and server
- Rollback mechanism if database update fails after file upload

## 🚀 Usage

1. Navigate to **Profile** from the user dropdown menu
2. Click **"Edit Profile"** to update your name
3. Click the **camera icon** on your avatar to upload a new picture
4. Changes are reflected immediately after saving

## 🔍 Testing

To test the profile editing functionality:

1. Log in to the application
2. Go to your profile page
3. Test editing your name:
   - Click "Edit Profile"
   - Change your full name
   - Click "Save Changes"
   - Verify the name updates on the page
4. Test uploading an avatar:
   - Click the camera icon on your avatar
   - Select an image file
   - Verify the preview appears
   - Click "Upload"
   - Verify the avatar updates

## 📝 Notes

- Email cannot be changed through this interface (Supabase Auth handles email changes separately)
- Avatar images are stored in Supabase Storage with unique filenames to prevent conflicts
- When uploading a new avatar, the old one is automatically deleted to save storage space
- If no avatar is set, the profile displays initials based on the user's name
