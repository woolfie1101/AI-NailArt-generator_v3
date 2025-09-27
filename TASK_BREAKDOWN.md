# Image Library Delivery Plan

Ordered tasks for shipping the new archive experience. Update checkboxes as you finish each step.

1. [ ] **Design & Data Modeling**
   - Finalize UI wireframes for Library list and folder detail pages.
   - Extend Supabase schema with `generation_groups` (folders) and `generation_assets` (images) tables; define tag arrays, favorite flags, timestamps, and cascade rules.
2. [ ] **Supabase Storage Configuration**
   - Create Storage buckets/folder structure for grouped images.
   - Set up service-role policies and signed URL helpers for downloads.
3. [ ] **Backend API Enhancements**
   - When the first image in a session is generated, create a new folder record + storage prefix automatically.
   - Update generation/upload endpoints to write JPEGs to Storage and create DB records tied to the active folder.
   - Add CRUD routes for folders/images (rename, retag, favorite toggle, delete).
   - Implement cascading delete logic and orphan cleanup utilities.
4. [ ] **AI Tag Integration**
   - Pipe existing AI tag suggestions into folder metadata by default.
   - Expose endpoints to add/remove tags manually.
5. [ ] **Frontend Library Page**
   - Build the folder listing view with filtering (date, name, tags) and sorting controls.
   - Surface favorite toggles and quick actions per folder.
6. [ ] **Folder Detail UI**
   - Show all images per folder with thumbnails, metadata editing, download, and delete buttons.
   - Reuse the tag editor component for folders/images.
7. [ ] **Testing & Polish**
   - Write integration tests for new APIs and storage cleanup.
   - Add frontend regression tests for filtering, sorting, and destructive actions.
   - Verify localization strings, empty states, and error handling.

_Last updated: 2025-09-27_
