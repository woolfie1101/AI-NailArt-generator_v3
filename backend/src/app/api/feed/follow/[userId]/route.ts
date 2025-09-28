import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthorSummaries } from '@/utils/feed';
import type { FollowActionResponse } from '@/types/api';

async function ensureProfileExists(userId: string) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  return Boolean(data);
}

async function buildFollowResponse(targetUserId: string, viewerId: string, isFollowing: boolean) {
  const summaries = await getAuthorSummaries([targetUserId], viewerId);
  const summary = summaries.get(targetUserId);

  if (!summary) {
    return NextResponse.json({ success: false, error: '사용자 정보를 불러오지 못했습니다.' }, { status: 500 });
  }

  const response: FollowActionResponse = {
    success: true,
    author: summary,
    isFollowing,
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const targetUserId = params.userId;

  if (targetUserId === user.id) {
    return NextResponse.json({ success: false, error: '자기 자신을 팔로우할 수 없습니다.' }, { status: 400 });
  }

  try {
    const exists = await ensureProfileExists(targetUserId);

    if (!exists) {
      return NextResponse.json({ success: false, error: '대상 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    await supabaseAdmin
      .from('user_follows')
      .upsert({ follower_id: user.id, followee_id: targetUserId }, {
        onConflict: 'follower_id,followee_id',
        ignoreDuplicates: true,
      });

    return buildFollowResponse(targetUserId, user.id, true);
  } catch (error) {
    console.error('팔로우 처리 오류:', error);
    return NextResponse.json({ success: false, error: '팔로우 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const targetUserId = params.userId;

  if (targetUserId === user.id) {
    return NextResponse.json({ success: false, error: '자기 자신을 언팔로우할 수 없습니다.' }, { status: 400 });
  }

  try {
    await supabaseAdmin
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followee_id', targetUserId);

    const exists = await ensureProfileExists(targetUserId);

    if (!exists) {
      return NextResponse.json({ success: false, error: '대상 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return buildFollowResponse(targetUserId, user.id, false);
  } catch (error) {
    console.error('언팔로우 처리 오류:', error);
    return NextResponse.json({ success: false, error: '언팔로우 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
