import { supabaseAdmin } from '@/lib/supabase';
import { createSignedUrls } from '@/utils/storage';
import type {
  FeedAuthorSummary,
  FeedPostSummary,
  FeedAssetSummary,
  FeedCommentSummary,
  VisibilityType,
} from '@/types/api';

interface RawPostRecord {
  id: string;
  user_id: string;
  asset_id: string;
  caption: string | null;
  hashtags: string[] | null;
  visibility: string;
  like_count: number;
  comment_count: number;
  created_at: string | null;
  updated_at: string | null;
}

interface RawCommentRecord {
  id: string;
  post_id: string;
  user_id: string;
  message: string;
  created_at: string | null;
}

export async function getAuthorSummaries(authorIds: string[], viewerId: string): Promise<Map<string, FeedAuthorSummary>> {
  const uniqueAuthorIds = Array.from(new Set(authorIds.filter(Boolean)));

  if (uniqueAuthorIds.length === 0) {
    return new Map();
  }

  const profilesPromise = supabaseAdmin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', uniqueAuthorIds);

  const viewerFollowingPromise = supabaseAdmin
    .from('user_follows')
    .select('followee_id')
    .eq('follower_id', viewerId)
    .in('followee_id', uniqueAuthorIds);

  const viewerFollowersPromise = supabaseAdmin
    .from('user_follows')
    .select('follower_id')
    .eq('followee_id', viewerId)
    .in('follower_id', uniqueAuthorIds);

  const [profilesResult, viewerFollowingResult, viewerFollowersResult] = await Promise.all([
    profilesPromise,
    viewerFollowingPromise,
    viewerFollowersPromise,
  ]);

  const profiles = profilesResult.data ?? [];
  const viewerFollowingSet = new Set(viewerFollowingResult.data?.map((row) => row.followee_id) ?? []);
  const viewerFollowersSet = new Set(viewerFollowersResult.data?.map((row) => row.follower_id) ?? []);

  const followerCountMap = new Map<string, number>();
  const followingCountMap = new Map<string, number>();

  await Promise.all(
    uniqueAuthorIds.map(async (authorId) => {
      const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
        supabaseAdmin
          .from('user_follows')
          .select('*', { head: true, count: 'exact' })
          .eq('followee_id', authorId),
        supabaseAdmin
          .from('user_follows')
          .select('*', { head: true, count: 'exact' })
          .eq('follower_id', authorId),
      ]);

      followerCountMap.set(authorId, followersCount ?? 0);
      followingCountMap.set(authorId, followingCount ?? 0);
    })
  );

  const result = new Map<string, FeedAuthorSummary>();

  for (const profile of profiles) {
    const authorId = profile.id;
    result.set(authorId, {
      id: authorId,
      displayName: profile.full_name,
      avatarUrl: profile.avatar_url,
      isFollowed: viewerFollowingSet.has(authorId),
      isFollowingMe: viewerFollowersSet.has(authorId),
      followersCount: followerCountMap.get(authorId) ?? 0,
      followingCount: followingCountMap.get(authorId) ?? 0,
    });
  }

  return result;
}

export async function buildFeedPostSummaries(
  posts: RawPostRecord[],
  viewerId: string
): Promise<FeedPostSummary[]> {
  if (posts.length === 0) {
    return [];
  }

  const postIds = posts.map((post) => post.id);
  const authorIds = posts.map((post) => post.user_id);
  const assetIds = Array.from(new Set(posts.map((post) => post.asset_id)));

  const assetsPromise = assetIds.length
    ? supabaseAdmin
        .from('generation_assets')
        .select('id, name, tags, storage_path, created_at')
        .in('id', assetIds)
    : Promise.resolve({ data: [], error: null });

  const likedPromise = postIds.length
    ? supabaseAdmin
        .from('post_likes')
        .select('post_id')
        .eq('user_id', viewerId)
        .in('post_id', postIds)
    : Promise.resolve({ data: [], error: null });

  const [assetsResult, likedResult, authorSummaries] = await Promise.all([
    assetsPromise,
    likedPromise,
    getAuthorSummaries(authorIds, viewerId),
  ]);

  const assets = assetsResult.data ?? [];
  const likedSet = new Set(likedResult.data?.map((row) => row.post_id) ?? []);

  const assetMap = new Map<string, FeedAssetSummary>();

  if (assets.length > 0) {
    const storagePaths = assets.map((asset) => asset.storage_path).filter(Boolean);
    const signedUrls = storagePaths.length ? await createSignedUrls(storagePaths, 60 * 60) : {};

    for (const asset of assets) {
      const signedUrl = signedUrls[asset.storage_path] ?? '';
      assetMap.set(asset.id, {
        id: asset.id,
        name: asset.name,
        tags: asset.tags ?? [],
        storagePath: asset.storage_path,
        createdAt: asset.created_at,
        imageUrl: signedUrl,
      });
    }
  }

  return posts.map<FeedPostSummary>((post) => {
    const author = authorSummaries.get(post.user_id) ?? {
      id: post.user_id,
      displayName: null,
      avatarUrl: null,
      isFollowed: false,
      isFollowingMe: false,
      followersCount: 0,
      followingCount: 0,
    };

    const asset = assetMap.get(post.asset_id) ?? {
      id: post.asset_id,
      name: '',
      tags: [],
      storagePath: '',
      createdAt: null,
      imageUrl: '',
    };

    return {
      id: post.id,
      caption: post.caption,
      hashtags: post.hashtags ?? [],
      visibility: (post.visibility as VisibilityType) ?? 'public',
      likeCount: post.like_count ?? 0,
      commentCount: post.comment_count ?? 0,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author,
      asset,
      isLiked: likedSet.has(post.id),
      isSaved: false,
      canEdit: post.user_id === viewerId,
    };
  });
}

export async function buildFeedCommentSummaries(
  comments: RawCommentRecord[],
  viewerId: string,
  postOwnerId: string
): Promise<FeedCommentSummary[]> {
  if (comments.length === 0) {
    return [];
  }

  const authorIds = comments.map((comment) => comment.user_id);
  const authorSummaries = await getAuthorSummaries(authorIds, viewerId);

  return comments.map((comment) => {
    const author = authorSummaries.get(comment.user_id) ?? {
      id: comment.user_id,
      displayName: null,
      avatarUrl: null,
      isFollowed: false,
      isFollowingMe: false,
      followersCount: 0,
      followingCount: 0,
    };

    return {
      id: comment.id,
      message: comment.message,
      createdAt: comment.created_at,
      author,
      canDelete: comment.user_id === viewerId || viewerId === postOwnerId,
    };
  });
}

export type { RawPostRecord, RawCommentRecord };

type PostAccessResult =
  | { status: 'ok'; post: RawPostRecord; isOwner: boolean }
  | { status: 'forbidden'; post?: RawPostRecord }
  | { status: 'not_found' };

export async function fetchPostWithAccess(postId: string, viewerId: string): Promise<PostAccessResult> {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, user_id, asset_id, caption, hashtags, visibility, like_count, comment_count, created_at, updated_at')
    .eq('id', postId)
    .maybeSingle();

  if (error) {
    console.error('게시물 조회 오류:', error);
    throw error;
  }

  if (!data) {
    return { status: 'not_found' };
  }

  const post = data as RawPostRecord;

  if (post.user_id === viewerId) {
    return { status: 'ok', post, isOwner: true };
  }

  if (post.visibility === 'public') {
    return { status: 'ok', post, isOwner: false };
  }

  if (post.visibility === 'followers') {
    const { data: followData } = await supabaseAdmin
      .from('user_follows')
      .select('followee_id')
      .eq('follower_id', viewerId)
      .eq('followee_id', post.user_id)
      .maybeSingle();

    if (followData) {
      return { status: 'ok', post, isOwner: false };
    }
  }

  return { status: 'forbidden', post };
}

export type { PostAccessResult };
