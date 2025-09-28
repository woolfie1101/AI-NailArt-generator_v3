import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
  buildFeedPostSummaries,
  buildFeedCommentSummaries,
  fetchPostWithAccess,
  type RawPostRecord,
  type RawCommentRecord,
} from '@/utils/feed';
import type { FeedPostDetailResponse } from '@/types/api';

const COMMENT_DEFAULT_LIMIT = 20;
const COMMENT_MAX_LIMIT = 50;

function clampLimit(value: number | null): number {
  if (!value || Number.isNaN(value)) {
    return COMMENT_DEFAULT_LIMIT;
  }
  return Math.min(Math.max(value, 1), COMMENT_MAX_LIMIT);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const postId = params.id;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limitParam = parseInt(searchParams.get('limit') ?? '', 10);
  const limit = clampLimit(Number.isNaN(limitParam) ? null : limitParam);

  try {
    const access = await fetchPostWithAccess(postId, user.id);

    if (access.status === 'not_found') {
      return NextResponse.json({ success: false, error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (access.status === 'forbidden') {
      return NextResponse.json({ success: false, error: '해당 게시물을 볼 권한이 없습니다.' }, { status: 403 });
    }

    const { post } = access;

    const [postSummary] = await buildFeedPostSummaries([post as RawPostRecord], user.id);

    if (!postSummary) {
      return NextResponse.json({ success: false, error: '게시물 정보를 불러오지 못했습니다.' }, { status: 500 });
    }

    let commentsQuery = supabaseAdmin
      .from('post_comments')
      .select('id, post_id, user_id, message, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      commentsQuery = commentsQuery.lt('created_at', cursor);
    }

    const { data: commentsData, error: commentsError } = await commentsQuery;

    if (commentsError) {
      console.error('댓글 조회 오류:', commentsError);
      return NextResponse.json({ success: false, error: '댓글을 불러오지 못했습니다.' }, { status: 500 });
    }

    const commentsList = (commentsData ?? []) as RawCommentRecord[];
    const slicedComments = commentsList.slice(0, limit);
    const nextCursor = commentsList.length > limit ? commentsList[limit].created_at : null;

    const commentSummaries = await buildFeedCommentSummaries(slicedComments, user.id, post.user_id);

    const response: FeedPostDetailResponse = {
      success: true,
      post: postSummary,
      comments: commentSummaries,
      nextCursor,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('게시물 상세 처리 오류:', error);
    return NextResponse.json({ success: false, error: '게시물 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
