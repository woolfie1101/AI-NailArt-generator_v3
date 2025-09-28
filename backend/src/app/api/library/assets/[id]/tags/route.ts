import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/utils/auth';
import { createSignedUrl } from '@/utils/storage';
import type { LibraryAssetResponse } from '@/types/api';
import { corsJson, createOptionsHandler, applyCors } from '@/utils/cors';

export const OPTIONS = createOptionsHandler(['POST']);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return applyCors(auth.response);
  }

  const { user } = auth;
  const { id: assetId } = await params;

  try {
    const payload = await request.json().catch(() => ({}));
    const tags: string[] | null = Array.isArray(payload?.tags)
      ? payload.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
      : null;

    if (!tags) {
      return corsJson({ success: false, error: '태그가 필요합니다.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('generation_assets')
      .update({ tags, updated_at: timestamp })
      .eq('id', assetId)
      .eq('user_id', user.id)
      .select('id, group_id, storage_path, name, tags, created_at, parent_asset_id')
      .single();

    if (error || !data) {
      return corsJson({ success: false, error: '이미지 정보를 업데이트하지 못했습니다.' }, { status: 500 });
    }

    const signedUrl = await createSignedUrl(data.storage_path);

    const response: { success: true; asset: LibraryAssetResponse } = {
      success: true,
      asset: {
        id: data.id,
        groupId: data.group_id,
        name: data.name,
        tags: data.tags ?? [],
        createdAt: data.created_at,
        parentAssetId: data.parent_asset_id,
        storagePath: data.storage_path,
        imageUrl: signedUrl,
      },
    };

    return corsJson(response);
  } catch (error) {
    console.error('태그 업데이트 오류:', error);
    return corsJson({ success: false, error: '이미지 정보를 업데이트하지 못했습니다.' }, { status: 500 });
  }
}
