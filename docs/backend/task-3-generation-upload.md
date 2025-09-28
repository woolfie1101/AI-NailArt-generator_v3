# Task 3 • Generation & Upload Enhancements

Goal: ensure every generated image is persisted to Supabase Storage and recorded with folder metadata.

## Remaining Work Items

1. **Folder Bootstrap API**
   - New endpoint `POST /api/generations/group`.
   - When the first generation request comes in (per session/user), create a `generation_group` row.
   - Return `group_id`, default name (`YYYY-MM-DD_<counter>`), and initial signed URL for pending uploads.

2. **Upload Endpoint (`/api/upload`)**
   - Accept `group_id` plus optional `parent_asset_id`.
   - Optimize image (existing Sharp pipeline), then upload to `nail-art-assets` as `user_id/group_id/asset_uuid.jpeg`.
   - Insert `generation_assets` record with storage path, tags, and metadata.
   - Respond with asset record + short-lived signed URL.

3. **Generate Endpoint (`/api/generate`)**
   - Accept `group_id`, `prompt`, `style`, `regeneration_source_asset`.
   - After AI render, reuse upload helper to store result.
   - Return new asset entry; if regeneration, link to original asset via `parent_asset_id` (new nullable column).

4. **Library Retrieval API**
   - Extend existing `/api/generations` to join `generation_groups` and `generation_assets`.
   - Query params: `date_range`, `tags`, `favorites`, pagination.
   - Return structure tailored to the new Library UI (folders with thumbnail array + asset list when requested).

5. **Deletion Helper**
   - Utility that removes storage object and DB row atomically.
   - Used by folder delete (cascade) and individual asset delete endpoints (Task 4 integration).

## Implementation Notes
- Use Supabase service role key on the backend for storage operations.
- Prefer server-side signed URLs with short expiry; client requests them as needed.
- Schedule: wrap up before starting Task 4.

_Status: Backend endpoints implemented (`/api/generations/group`, `/api/upload`, `/api/generate`) and generator UI now stores results via `/api/generate`_
