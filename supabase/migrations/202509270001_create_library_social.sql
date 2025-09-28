-- Enable required extensions
create extension if not exists "uuid-ossp";

-- generation_groups table
create table if not exists public.generation_groups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  tags text[] default '{}',
  is_favorite boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.generation_groups enable row level security;

create policy "Users can view own groups" on public.generation_groups
  for select using (auth.uid() = user_id);

create policy "Users can insert own groups" on public.generation_groups
  for insert with check (auth.uid() = user_id);

create policy "Users can update own groups" on public.generation_groups
  for update using (auth.uid() = user_id);

create policy "Users can delete own groups" on public.generation_groups
  for delete using (auth.uid() = user_id);

-- generation_assets table
create table if not exists public.generation_assets (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.generation_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  name text not null,
  tags text[] default '{}',
  parent_asset_id uuid references public.generation_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generation_assets_group_id_idx on public.generation_assets (group_id);
create index if not exists generation_assets_user_id_idx on public.generation_assets (user_id);

alter table public.generation_assets enable row level security;

create policy "Users can view own assets" on public.generation_assets
  for select using (auth.uid() = user_id);

create policy "Users can insert own assets" on public.generation_assets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own assets" on public.generation_assets
  for update using (auth.uid() = user_id);

create policy "Users can delete own assets" on public.generation_assets
  for delete using (auth.uid() = user_id);

-- social_posts table
create table if not exists public.social_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.generation_assets(id) on delete restrict,
  caption text,
  hashtags text[] default '{}',
  visibility text not null default 'public',
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_posts_user_id_idx on public.social_posts (user_id);
create index if not exists social_posts_visibility_idx on public.social_posts (visibility);

alter table public.social_posts enable row level security;

-- post_likes table
create table if not exists public.post_likes (
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

-- post_comments table
create table if not exists public.post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

-- user_follows table
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);

alter table public.user_follows enable row level security;

create policy "Users manage follows" on public.user_follows
  for all using (auth.uid() = follower_id);

create policy "Follows readable" on public.user_follows
  for select using (
    follower_id = auth.uid() or followee_id = auth.uid()
  );

-- Helper function for follower visibility (idempotent)
create or replace function public.is_follower(target uuid, viewer uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_follows
    where user_follows.followee_id = target
      and user_follows.follower_id = viewer
  );
$$;

-- Policies that depend on the helper
create policy "Public posts read" on public.social_posts
  for select using (
    case visibility
      when 'public' then true
      when 'followers' then is_follower(user_id, auth.uid())
      when 'private' then auth.uid() = user_id
      else false
    end
  );

create policy "Users manage own posts" on public.social_posts
  for all using (auth.uid() = user_id);

create policy "Users manage their likes" on public.post_likes
  for all using (auth.uid() = user_id);

create policy "Like visibility follows post" on public.post_likes
  for select using (
    case (
      select visibility from public.social_posts where id = post_id
    )
      when 'public' then true
      when 'followers' then is_follower((select user_id from public.social_posts where id = post_id), auth.uid())
      when 'private' then auth.uid() = (select user_id from public.social_posts where id = post_id)
      else false
    end
  );

create policy "Users manage own comments" on public.post_comments
  for all using (auth.uid() = user_id);

create policy "Comment visibility follows post" on public.post_comments
  for select using (
    case (
      select visibility from public.social_posts where id = post_id
    )
      when 'public' then true
      when 'followers' then is_follower((select user_id from public.social_posts where id = post_id), auth.uid())
      when 'private' then auth.uid() = (select user_id from public.social_posts where id = post_id)
      else false
    end
  );

-- Storage policies (bucket nail-art-assets)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload own files'
  ) then
    execute '
      create policy "Users upload own files" on storage.objects
        for insert with check (
          bucket_id = ''nail-art-assets''
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    ';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users read own files'
  ) then
    execute '
      create policy "Users read own files" on storage.objects
        for select using (
          bucket_id = ''nail-art-assets''
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    ';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete own files'
  ) then
    execute '
      create policy "Users delete own files" on storage.objects
        for delete using (
          bucket_id = ''nail-art-assets''
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    ';
  end if;
end;
$$;
