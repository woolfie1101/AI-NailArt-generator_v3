import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchPostWithAccess } from '@/utils/feed';
import type { FeedCommentDeleteResponse } from '@/types/api';

async function recalculateCommentCount(postId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('post_comments')
    .select('*', { head: true, count: 'exact' })
    .eq('post_id', postId);

  return count ?? 0;
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const commentId = params.id;

  try {
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('post_comments')
      .select('id, post_id, user_id')
      .eq('id', commentId)
      .maybeSingle();

    if (commentError) {
      console.error('댓글 조회 오류:', commentError);
      return NextResponse.json({ success: false, error: '댓글을 불러오지 못했습니다.' }, { status: 500 });
    }

    if (!comment) {
      return NextResponse.json({ success: false, error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const access = await fetchPostWithAccess(comment.post_id, user.id);

    if (access.status === 'not_found') {
      return NextResponse.json({ success: false, error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    const isOwner = access.status === 'ok' ? access.isOwner : false;

    if (comment.user_id !== user.id && !isOwner) {
      return NextResponse.json({ success: false, error: '댓글을 삭제할 권한이 없습니다.' }, { status: 403 });
    }

    await supabaseAdmin
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    const commentCount = await recalculateCommentCount(comment.post_id);
    const now = new Date().toISOString();

    await supabaseAdmin
      .from('social_posts')
      .update({ comment_count: commentCount, updated_at: now })
      .eq('id', comment.post_id);

    const response: FeedCommentDeleteResponse = {
      success: true,
      commentId,
      commentCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('댓글 삭제 처리 오류:', error);
    return NextResponse.json({ success: false, error: '댓글 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
