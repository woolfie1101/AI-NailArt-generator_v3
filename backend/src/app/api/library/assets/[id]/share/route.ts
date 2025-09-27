import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/utils/auth';

const DEFAULT_VISIBILITY = 'public';
const ALLOWED_VISIBILITY = new Set(['public', 'followers', 'private']);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const assetId = params.id;

  try {
    const payload = await request.json().catch(() => ({}));
    const caption = typeof payload?.caption === 'string' ? payload.caption : null;
    const visibilityRaw = typeof payload?.visibility === 'string' ? payload.visibility : DEFAULT_VISIBILITY;
    const visibility = ALLOWED_VISIBILITY.has(visibilityRaw) ? visibilityRaw : DEFAULT_VISIBILITY;

    const hashtags: string[] = Array.isArray(payload?.hashtags)
      ? payload.hashtags.filter((tag: unknown): tag is string => typeof tag === 'string')
      : [];

    const { data: asset, error: assetError } = await supabaseAdmin
      .from('generation_assets')
      .select('id, group_id, user_id')
      .eq('id', assetId)
      .single();

    if (assetError || !asset || asset.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '게시할 이미지를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: existingPost } = await supabaseAdmin
      .from('social_posts')
      .select('id')
      .eq('asset_id', assetId)
      .single();

    if (existingPost) {
      return NextResponse.json({ success: false, error: '이미 해당 이미지로 게시물이 생성되었습니다.' }, { status: 409 });
    }

    const timestamp = new Date().toISOString();

    const { data: post, error: insertError } = await supabaseAdmin
      .from('social_posts')
      .insert({
        id: randomUUID(),
        user_id: user.id,
        asset_id: assetId,
        caption,
        hashtags,
        visibility,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (insertError || !post) {
      console.error('게시물 생성 오류:', insertError);
      return NextResponse.json({ success: false, error: '게시물 생성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('게시물 공유 오류:', error);
    return NextResponse.json({ success: false, error: '게시물 공유 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
