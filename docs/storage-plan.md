# Task 2 • Supabase Storage & Access Policy

## Storage Buckets
- **`nail-art-assets`**
  - Stores original uploads and generated images destined for the archive.
  - Folder structure: `user_id/generation_group_id/asset_id.jpeg`
  - Metadata: store prompt/style info in DB; storage objects keep only media.
- **`social-thumbnails`** (optional)
  - Cached resized images for feed performance.
  - Structure: `post_id/size.jpeg`

## Access Rules
- Default bucket policy: private.
- Backend generates signed URLs when: displaying library thumbnails, downloading images, populating social feed.
- Supabase Edge Function or Next.js API should revoke/rotate URLs at intervals or rely on time-bound signatures.

## RLS Highlights (Storage policies)
1. **Upload**: only authenticated user can upload to `nail-art-assets` under their `user_id/*` prefix.
2. **Read**: user can read their own assets; social feed uses signed URLs for public visibility.
3. **Delete**: allowed only for owner; cascading delete logic ensures DB rows removed before storage objects.

## Integration Steps
1. Create buckets in Supabase Dashboard.
2. Add storage policies using SQL:
   ```sql
   create policy "Users can upload their files" on storage.objects
   for insert with check (
     bucket_id = 'nail-art-assets'
     and auth.uid()::text = (storage.foldername(name))[1]
   );

   create policy "Users can read own files" on storage.objects
   for select using (
     bucket_id = 'nail-art-assets'
     and auth.uid()::text = (storage.foldername(name))[1]
   );

   create policy "Users can delete own files" on storage.objects
   for delete using (
     bucket_id = 'nail-art-assets'
     and auth.uid()::text = (storage.foldername(name))[1]
   );
   ```
3. Implement signed URL helper in backend (Task 3).

Task 2 completed on 2025-09-27.
