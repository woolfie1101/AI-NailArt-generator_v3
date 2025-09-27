# Upcoming Feature Overview

> **Goal:** Build a social-ready archive and discovery layer for AI nail-art creations.

## 1. Automatic Archiving to Supabase
- On the first successful generation, create a new folder entry and storage prefix automatically.
- Every finished nail-art render (original + any regenerated edits) is saved as a JPEG under that folder.
- Images belong to logical “folders” so all variations from the same session stay together.
- Default naming: `YYYY-MM-DD_<counter>` for folders and image files.

## 2. Folder-Level Organization
- Each folder stores metadata (timestamp, editable name, description, tags, favorite flag).
- Tag edits, name changes, and deletes keep the storage structure in sync.

## 3. Image Library Page
- Dedicated page listing all folders the user has created.
- Filter by date range, folder name, or tags; sort by newest, oldest, name, or favorites.
- Toggle favorites inline; folder cards show thumbnails, tags, and quick actions.

## 4. Folder Detail View
- Show every image inside a folder with metadata, download, edit, and delete options.
- Inline editing for folder/image names and tags.

## 5. Deletion & Cleanup
- Folder deletions cascade to contained images and storage objects.
- Individual image deletions remove both storage files and DB rows.

## 6. Tag-Driven Discovery
- Tags applied at folder or image level power search/filter UI.
- AI-generated tags seed folder metadata by default.

## 7. Social Feed (“Nailgram”)
- Each user gets a profile feed that showcases selected nail-art images.
- Feeds can be public, private, or mutual-follow only (“secret feed”).
- Use Instagram-style interactions: post upload (from saved library images), captions, likes, comments, follow/unfollow, share, etc.
- Users can choose which archived images to publish to their feed.

## 8. Bottom Navigation
- Add a persistent bottom nav (mobile-first) with three tabs:
  1. **Home** – browse global/community nail feeds.
  2. **Create** – open the existing AI generator.
  3. **Library** – open the personal archive/library page.

_Last updated: 2025-09-27_
