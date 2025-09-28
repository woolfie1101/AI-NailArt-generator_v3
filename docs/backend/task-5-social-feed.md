# Task 5 • Social Feed APIs

## Objectives
- Power the Home feed, Profile feed, and Post detail UI.
- Handle interactions: follow, like, comment, share/save.

## Endpoints

1. **GET /api/feed**
   - Params: `scope=home|profile`, `userId` (for profile), `cursor`, `limit`.
   - Home feed: gather public posts, plus "followers" visibility posts for users the viewer follows, plus viewer's own private posts.

2. **GET /api/feed/post/:id**
   - Returns post metadata, author info, signed URL, comments (paginated).

3. **POST /api/feed/post**
   - Payload: `asset_id`, `caption`, `visibility`, optional tags/hashtags.
   - Validates ownership of asset before publishing.

4. **POST/DELETE /api/feed/post/:id/like**
   - Toggle like; update `like_count`.

5. **POST /api/feed/post/:id/comment**
   - Adds comment row; response includes new comment info.
   - Additional `DELETE /api/feed/comment/:id` for removal by author or post owner.

6. **POST/DELETE /api/feed/post/:id/save** (optional bookmark feature).

7. **POST/DELETE /api/feed/follow/:userId**
   - Manage follow relationships. Private account acceptance flow deferred.

## Notes
- Enforce RLS: posts visible only if `visibility` permits.
- Use pagination for comments and feed (cursor-based recommended).
- Integrate with Task 3 cleanup utilities to handle cascade deletes.

_Status: Backend endpoints implemented (needs integration & testing)_
