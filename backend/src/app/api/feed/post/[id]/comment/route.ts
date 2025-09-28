import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
  buildFeedCommentSummaries,
  fetchPostWithAccess,
  type RawCommentRecord,
} from '@/utils/feed';
import type { FeedCommentActionResponse } from '@/types/api';

const MAX_MESSAGE_LENGTH = 500;

function sanitizeMessage(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) {
    return null;
  }
  return trimmed;
}

async function recalculateCommentCount(postId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('post_comments')
    .select('*', { head: true, count: 'exact' })
    .eq('post_id', postId);

  return count ?? 0;
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
      return NextResponse.json({ success: false, error: '댓글을 작성할 권한이 없습니다.' }, { status: 403 });
    }

    const { post } = access;

    const payload = await request.json().catch(() => ({}));
    const message = sanitizeMessage(payload?.message);

    if (!message) {
      return NextResponse.json({ success: false, error: '내용을 확인해주세요.' }, { status: 400 });
    }

    const { data: insertedComment, error: insertError } = await supabaseAdmin
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        message,
      })
      .select('id, post_id, user_id, message, created_at')
      .single();

    if (insertError || !insertedComment) {
      console.error('댓글 작성 오류:', insertError);
      return NextResponse.json({ success: false, error: '댓글을 등록하지 못했습니다.' }, { status: 500 });
    }

    const commentCount = await recalculateCommentCount(postId);
    const now = new Date().toISOString();

    post.comment_count = commentCount;
    post.updated_at = now;

    await supabaseAdmin
      .from('social_posts')
      .update({ comment_count: commentCount, updated_at: now })
      .eq('id', postId);

    const [commentSummary] = await buildFeedCommentSummaries(
      [insertedComment as RawCommentRecord],
      user.id,
      post.user_id
    );

    if (!commentSummary) {
      return NextResponse.json({ success: false, error: '댓글 정보를 불러오지 못했습니다.' }, { status: 500 });
    }

    const response: FeedCommentActionResponse = {
      success: true,
      comment: commentSummary,
      commentCount,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('댓글 작성 처리 오류:', error);
    return NextResponse.json({ success: false, error: '댓글 작성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
