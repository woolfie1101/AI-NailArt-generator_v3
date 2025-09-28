import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/utils/auth';
import { removeFromStorage, createSignedUrl } from '@/utils/storage';
import type { LibraryAssetResponse } from '@/types/api';
import { applyCors, corsJson, createOptionsHandler } from '@/utils/cors';

export const OPTIONS = createOptionsHandler(['PATCH', 'DELETE']);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return applyCors(auth.response);
  }

  const { user } = auth;
  const { id: assetId } = await params;

  try {
    const payload = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if (typeof payload?.name === 'string') {
      updates.name = payload.name;
    }

    if (Array.isArray(payload?.tags)) {
      updates.tags = payload.tags.filter((tag: unknown): tag is string => typeof tag === 'string');
    }

    if (Object.keys(updates).length === 0) {
      return corsJson({ success: false, error: '업데이트할 내용이 없습니다.' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('generation_assets')
      .update(updates)
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
    console.error('에셋 업데이트 오류:', error);
    return corsJson({ success: false, error: '이미지 정보를 업데이트하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return applyCors(auth.response);
  }

  const { user } = auth;
  const { id: assetId } = await params;

  try {
    const { data: asset, error } = await supabaseAdmin
      .from('generation_assets')
      .select('id, storage_path, group_id')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single();

    if (error || !asset) {
      return corsJson({ success: false, error: '이미지를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (asset.storage_path) {
      await removeFromStorage(asset.storage_path).catch((storageError) => {
        console.error('스토리지 이미지 삭제 오류:', storageError);
      });
    }

    await supabaseAdmin.from('generation_assets').delete().eq('id', assetId).eq('user_id', user.id);

    return corsJson({ success: true });
  } catch (error) {
    console.error('에셋 삭제 오류:', error);
    return corsJson({ success: false, error: '이미지를 삭제하지 못했습니다.' }, { status: 500 });
  }
}
