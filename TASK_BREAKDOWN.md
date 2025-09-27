# Feature Delivery Plan

A combined roadmap for the image library and social feed features. Update checkboxes as tasks complete.

## Phase 1 – Foundations
1. [x] **Design & Data Modeling**
   - Wireframe Library list, Folder detail, and Social Feed screens.
   - Extend Supabase schema for `generation_groups`, `generation_assets`, and `social_posts` (with privacy flags, captions, like/comment counts, etc.).
   - Define follow relationships and feed visibility rules.
2. [x] **Supabase Storage & Access Policy**
   - Create Storage structure for grouped images.
   - Set bucket permissions + signed URL helpers.

## Phase 2 – Backend Services
3. [x] **Generation & Upload Enhancements**
   - Auto-create folder record/prefix on first render.
   - Save JPEGs to Storage and corresponding DB entries (folder/image).
4. [x] **Library CRUD APIs**
   - Endpoints to list/filter/sort folders and images.
   - Edit name/tag/favorite; delete image/folder (cascade cleanup).
5. [ ] **Social Feed APIs**
   - Post creation from library images, captions, tags, privacy settings.
   - Like/comment endpoints, follow/unfollow, feed retrieval (public/private).

## Phase 3 – Frontend Implementation
6. [ ] **Bottom Navigation Integration**
   - Add mobile-first nav with Home / Create / Library tabs.
   - Home opens community feed; Create launches existing generator; Library opens archive view.
7. [ ] **Library UI**
   - Port `ui-library` components into the app, connect to real data.
   - Filtering, sorting, tag editing, favorites, downloads.
8. [ ] **Folder Detail UI**
   - Display folder images with edit/delete/download actions.
   - Allow publishing selected images to social feed.
9. [ ] **Social Feed UI**
   - Build profile feed, community feed, post detail modals, follow states.
   - Include privacy indicators (public/private/mutual).

## Phase 4 – Polish & QA
10. [ ] **End-to-End Testing**
    - Integration tests for storage cleanup, feed visibility, and permissions.
    - Frontend regression tests (navigation, filters, CRUD, social interactions).
11. [ ] **Localization & Accessibility**
    - Translate new UI copy (KO/EN) and ensure keyboard/screen reader support.

_Last updated: 2025-09-27_
