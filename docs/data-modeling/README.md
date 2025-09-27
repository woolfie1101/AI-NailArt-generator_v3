# Task 1 • Design & Data Modeling

## Wireframe Snapshot
- **Library List**: grid of generation folders with filters (date, tags, favorites) and quick actions.
- **Folder Detail**: shows all images within a folder plus download, delete, and “post to feed” actions.
- **Social Feed**: masonry layout, post detail modal, user profile screen with follow stats and privacy controls.

These match the UI prototype now integrated into `frontend/App.tsx`.

## Supabase Schema Proposal

### `generation_groups`
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | `primary key`, default gen_random_uuid() |
| user_id | uuid | references `auth.users.id` |
| name | text | editable name (default `YYYY-MM-DD_<counter>`) |
| description | text | optional |
| tags | text[] | array of tags |
| is_favorite | boolean | default `false` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |

### `generation_assets`
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | `primary key` |
| group_id | uuid | references `generation_groups.id` ON DELETE CASCADE |
| user_id | uuid | references `auth.users.id` |
| storage_path | text | path to Supabase Storage object |
| image_url | text | cached public/signed URL (optional) |
| name | text | default `YYYY-MM-DD_<counter>` |
| tags | text[] | AI + user tags |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |

### `social_posts`
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | `primary key` |
| user_id | uuid | references `auth.users.id` |
| asset_id | uuid | references `generation_assets.id` (ON DELETE RESTRICT) |
| caption | text | optional |
| hashtags | text[] | optional |
| visibility | text | enum `'public' 'followers' 'private'` |
| like_count | integer | default `0` |
| comment_count | integer | default `0` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |

### `post_likes`
| Column | Type | Notes |
| --- | --- | --- |
| post_id | uuid | references `social_posts.id` ON DELETE CASCADE |
| user_id | uuid | references `auth.users.id` ON DELETE CASCADE |
| created_at | timestamptz | default `now()` |
Primary key: `(post_id, user_id)`

### `post_comments`
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | `primary key` |
| post_id | uuid | references `social_posts.id` ON DELETE CASCADE |
| user_id | uuid | references `auth.users.id` ON DELETE CASCADE |
| message | text | comment body |
| created_at | timestamptz | default `now()` |

### `user_follows`
| Column | Type | Notes |
| --- | --- | --- |
| follower_id | uuid | references `auth.users.id` ON DELETE CASCADE |
| followee_id | uuid | references `auth.users.id` ON DELETE CASCADE |
| created_at | timestamptz | default `now()` |
Primary key: `(follower_id, followee_id)`

## Feed Visibility Logic
- **public**: visible to everyone.
- **followers**: visible to users with follower → followee relation (optionally require reciprocal follow for “mutual only”).
- **private**: visible only to owner.

## Notes
- `profiles` table now auto-seeds via `AuthContext`. Ensure schema matches new fields.
- Consider additional analytics tables later (views, shares).

## Next Steps
- Update `TASK_BREAKDOWN.md` marking Task 1 as complete.
- Start Task 2 (storage structure & access policies).

_Task completed on 2025-09-27_
