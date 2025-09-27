# Upcoming Image Library Feature Overview

> **Goal:** Give users a persistent “My Library” space where every AI-generated nail-art image is stored, organized, and easy to rediscover.

## 1. Automatic Archiving to Supabase
- On the first successful generation, create a new folder entry and storage prefix automatically.
- Every finished nail-art render (original + any regenerated edits) is saved as a JPEG under that folder.
- Images belong to logical “folders” so all variations from the same session stay together.
- Default naming: `YYYY-MM-DD_<counter>` for folders and image files.

## 2. Folder-Level Organization
- Each folder stores metadata:
  - Creation timestamp (used for default naming and sorting).
  - Folder name (editable) and optional description.
  - Tag list (e.g., `#봄네일`, `#glitter`) to capture theme, season, or client.
  - Favorite flag so artists can pin their best sets.
- Tag edits, name changes, or deletes should stay synced between database and storage.

## 3. Image Library Page
- A dedicated page lists all folders the user has created.
- Core UX capabilities:
  - **Filter** by creation date range, folder name search, or tag selection.
  - **Sort** by newest/oldest, alphabetical folder name, or favorites first.
  - **Favorite toggle** directly in the list.
- Each folder card shows preview thumbnails, tag chips, creation info, and quick actions.

## 4. Folder Detail View
- Clicking a folder opens a detail screen with every saved image in that group.
- For each image:
  - Show name, timestamp, tags (editable), and download button.
  - Allow deletion of an individual render.
- Inline rename/tag editing for both the folder and its child images.

## 5. Deletion & Cleanup
- Users can delete a folder; all contained images and their storage objects are removed in the same action.
- Individual image deletes are also supported.
- Backend must ensure there are no orphaned records or storage files after deletions.

## 6. Tag-Driven Discovery
- Tags applied at folder or image level become a central discovery tool.
- The Library page supports filtering by tags; consider multi-select chips or search-as-you-type.
- AI-generated tags from the existing generator can seed folders automatically.

_Last updated: 2025-09-27_
