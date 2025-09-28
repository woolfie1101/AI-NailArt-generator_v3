import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { buildFeedPostSummaries, type RawPostRecord } from '@/utils/feed';
import type { FeedResponse } from '@/types/api';

const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 12;

function clampLimit(value: number | null): number {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(value, 1), MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') ?? 'home';
  const profileUserId = searchParams.get('userId') ?? undefined;
  const cursor = searchParams.get('cursor');
  const limitParam = parseInt(searchParams.get('limit') ?? '', 10);
  const limit = clampLimit(Number.isNaN(limitParam) ? null : limitParam);

  try {
    const { data: followingRows } = await supabaseAdmin
      .from('user_follows')
      .select('followee_id')
      .eq('follower_id', user.id);

    const followingIds = new Set(followingRows?.map((row) => row.followee_id) ?? []);

    let query = supabaseAdmin
      .from('social_posts')
      .select(
        'id, user_id, asset_id, caption, hashtags, visibility, like_count, comment_count, created_at, updated_at'
      )
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    if (scope === 'profile') {
      const targetUserId = profileUserId ?? user.id;
      query = query.eq('user_id', targetUserId);

      if (targetUserId !== user.id) {
        const visibilityOptions = ['public'];
        if (followingIds.has(targetUserId)) {
          visibilityOptions.push('followers');
        }
        query = query.in('visibility', visibilityOptions);
      }
    } else {
      const visibilityConditions = [`visibility.eq.public`, `user_id.eq.${user.id}`];
      if (followingIds.size > 0) {
        const inClause = Array.from(followingIds).join(',');
        visibilityConditions.push(`and(visibility.eq.followers,user_id.in.(${inClause}))`);
      }
      query = query.or(visibilityConditions.join(','));
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError) {
      console.error('피드 조회 오류:', postsError);
      return NextResponse.json({ success: false, error: '피드를 불러올 수 없습니다.' }, { status: 500 });
    }

    const posts = (postsData ?? []) as RawPostRecord[];

    const slicedPosts = posts.slice(0, limit);
    const nextCursor = posts.length > limit ? posts[limit].created_at : null;

    const feedPosts = await buildFeedPostSummaries(slicedPosts, user.id);

    const response: FeedResponse = {
      success: true,
      posts: feedPosts,
      nextCursor,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('피드 처리 오류:', error);
    return NextResponse.json({ success: false, error: '피드를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
