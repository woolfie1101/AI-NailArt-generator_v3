import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { buildFeedPostSummaries, type RawPostRecord } from '@/utils/feed';
import type { FeedPostPublishRequest, FeedPostPublishResponse } from '@/types/api';

const ALLOWED_VISIBILITY: Array<'public' | 'followers' | 'private'> = ['public', 'followers', 'private'];

function resolveVisibility(value: unknown): typeof ALLOWED_VISIBILITY[number] {
  if (typeof value === 'string' && (ALLOWED_VISIBILITY as readonly string[]).includes(value)) {
    return value as typeof ALLOWED_VISIBILITY[number];
  }
  return 'public';
}

function sanitizeHashtags(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && value.length <= 40)
    .slice(0, 12);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;

  try {
    const payload = (await request.json()) as FeedPostPublishRequest;
    const assetId = payload?.assetId;

    if (!assetId) {
      return NextResponse.json({ success: false, error: 'assetId가 필요합니다.' }, { status: 400 });
    }

    const visibility = resolveVisibility(payload.visibility);

    const caption = typeof payload.caption === 'string' ? payload.caption.trim() : null;
    const hashtags = sanitizeHashtags(payload.hashtags);

    const { data: asset, error: assetError } = await supabaseAdmin
      .from('generation_assets')
      .select('id, user_id, group_id')
      .eq('id', assetId)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ success: false, error: '선택한 이미지를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (asset.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '본인 소유의 이미지가 아닙니다.' }, { status: 403 });
    }

    const { data: insertedPost, error: insertError } = await supabaseAdmin
      .from('social_posts')
      .insert({
        user_id: user.id,
        asset_id: assetId,
        caption,
        hashtags,
        visibility,
        like_count: 0,
        comment_count: 0,
      })
      .select(
        'id, user_id, asset_id, caption, hashtags, visibility, like_count, comment_count, created_at, updated_at'
      )
      .single();

    if (insertError || !insertedPost) {
      console.error('게시물 생성 오류:', insertError);
      return NextResponse.json({ success: false, error: '게시물 등록에 실패했습니다.' }, { status: 500 });
    }

    // Update latest timestamp on related group for ordering consistency
    if (asset.group_id) {
      await supabaseAdmin
        .from('generation_groups')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', asset.group_id);
    }

    const [postSummary] = await buildFeedPostSummaries([insertedPost as RawPostRecord], user.id);

    if (!postSummary) {
      return NextResponse.json({ success: false, error: '게시물 정보를 불러오지 못했습니다.' }, { status: 500 });
    }

    const response: FeedPostPublishResponse = {
      success: true,
      post: postSummary,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('게시물 생성 처리 오류:', error);
    return NextResponse.json({ success: false, error: '게시물 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
