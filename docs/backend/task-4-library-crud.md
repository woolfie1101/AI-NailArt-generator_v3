# Task 4 • Library CRUD APIs

## Objective
Expose REST endpoints to manage generation folders and assets for the Library UI.

## Endpoints
1. **GET /api/library/folders**
   - Query params: `date_from`, `date_to`, `tags`, `favorite`, pagination (`cursor` or `page`, `limit`).
   - Returns array of folders with thumbnail preview URLs and basic counts.

2. **GET /api/library/folders/:id**
   - Returns folder metadata and full asset list (with signed URLs) for detail view.

3. **POST /api/library/folders/:id/favorite**
   - Toggle favorite flag.

4. **PUT /api/library/folders/:id**
   - Update name, description, tags (full replace).

5. **DELETE /api/library/folders/:id**
   - Cascade delete using helper from Task 3.

6. **PUT /api/library/assets/:id**
   - Update asset name/tags.

7. **DELETE /api/library/assets/:id**
   - Remove single image (uses cleanup helper).

8. **POST /api/library/assets/:id/share**
   - Creates a `social_post` record (calls Task 5 logic later).

## Considerations
- RLS: ensure Supabase policies restrict access to `user_id`.
- Signed URLs generated on demand with short TTL.
- Validate tags (string length, count) to avoid abuse.

_Status: Spec drafted; implementation next_
