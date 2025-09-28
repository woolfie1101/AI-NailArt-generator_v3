import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
  buildFeedPostSummaries,
  fetchPostWithAccess,
  type RawPostRecord,
} from '@/utils/feed';
import type { FeedPostActionResponse } from '@/types/api';

async function recalculateLikeCount(postId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('post_likes')
    .select('*', { head: true, count: 'exact' })
    .eq('post_id', postId);

  return count ?? 0;
}

async function respondWithPostSummary(post: RawPostRecord, viewerId: string) {
  const [summary] = await buildFeedPostSummaries([post], viewerId);

  if (!summary) {
    return NextResponse.json({ success: false, error: '게시물 정보를 불러오지 못했습니다.' }, { status: 500 });
  }

  const response: FeedPostActionResponse = {
    success: true,
    post: summary,
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const postId = params.id;

  try {
    const access = await fetchPostWithAccess(postId, user.id);

    if (access.status === 'not_found') {
      return NextResponse.json({ success: false, error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (access.status === 'forbidden') {
      return NextResponse.json({ success: false, error: '해당 게시물을 볼 권한이 없습니다.' }, { status: 403 });
    }

    const { post } = access;

    await supabaseAdmin
      .from('post_likes')
      .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id', ignoreDuplicates: true });

    const likeCount = await recalculateLikeCount(postId);

    const now = new Date().toISOString();
    post.like_count = likeCount;
    post.updated_at = now;

    await supabaseAdmin
      .from('social_posts')
      .update({ like_count: likeCount, updated_at: now })
      .eq('id', postId);

    return respondWithPostSummary(post, user.id);
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    return NextResponse.json({ success: false, error: '좋아요 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const postId = params.id;

  try {
    const access = await fetchPostWithAccess(postId, user.id);

    if (access.status === 'not_found') {
      return NextResponse.json({ success: false, error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (access.status === 'forbidden') {
      return NextResponse.json({ success: false, error: '해당 게시물을 볼 권한이 없습니다.' }, { status: 403 });
    }

    const { post } = access;

    await supabaseAdmin
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    const likeCount = await recalculateLikeCount(postId);
    const now = new Date().toISOString();

    post.like_count = likeCount;
    post.updated_at = now;

    await supabaseAdmin
      .from('social_posts')
      .update({ like_count: likeCount, updated_at: now })
      .eq('id', postId);

    return respondWithPostSummary(post, user.id);
  } catch (error) {
    console.error('좋아요 취소 처리 오류:', error);
    return NextResponse.json({ success: false, error: '좋아요 취소 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
