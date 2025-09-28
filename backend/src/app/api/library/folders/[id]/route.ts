import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/utils/auth';
import { createSignedUrls, removeFromStorage } from '@/utils/storage';
import type { LibraryFolderDetailResponse } from '@/types/api';
import { applyCors, corsJson, createOptionsHandler } from '@/utils/cors';

export const OPTIONS = createOptionsHandler(['GET', 'PATCH', 'DELETE']);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return applyCors(auth.response);
  }

  const { user } = auth;
  const { id: folderId } = await params;

  try {
    const { data: folder, error: folderError } = await supabaseAdmin
      .from('generation_groups')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single();

    if (folderError || !folder) {
      return corsJson({ success: false, error: '폴더를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: assets, error: assetsError } = await supabaseAdmin
      .from('generation_assets')
      .select('id, storage_path, name, tags, created_at, parent_asset_id')
      .eq('group_id', folderId)
      .order('created_at', { ascending: false });

    if (assetsError) {
      console.error('폴더 이미지 조회 오류:', assetsError);
      return corsJson({ success: false, error: '이미지 조회에 실패했습니다.' }, { status: 500 });
    }

    const paths = (assets ?? []).map((asset) => asset.storage_path);
    const signedMap = paths.length ? await createSignedUrls(paths) : {};

    const response: LibraryFolderDetailResponse = {
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        createdAt: folder.created_at,
        updatedAt: folder.updated_at,
        tags: folder.tags ?? [],
        isFavorite: folder.is_favorite ?? false,
      },
      assets: (assets ?? []).map((asset) => ({
        id: asset.id,
        groupId: folderId,
        name: asset.name,
        tags: asset.tags ?? [],
        createdAt: asset.created_at,
        parentAssetId: asset.parent_asset_id,
        storagePath: asset.storage_path,
        imageUrl: signedMap[asset.storage_path] ?? '',
      })),
    };

    return corsJson(response);
  } catch (error) {
    console.error('폴더 상세 조회 오류:', error);
    return corsJson({ success: false, error: '폴더 상세 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return applyCors(auth.response);
  }

  const { user } = auth;
  const { id: folderId } = await params;

  try {
    const payload = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if (typeof payload?.name === 'string') {
      updates.name = payload.name;
    }

    if (typeof payload?.description === 'string' || payload?.description === null) {
      updates.description = payload.description;
    }

    if (Array.isArray(payload?.tags)) {
      updates.tags = payload.tags.filter((tag: unknown): tag is string => typeof tag === 'string');
    }

    if (typeof payload?.isFavorite === 'boolean') {
      updates.is_favorite = payload.isFavorite;
    }

    if (Object.keys(updates).length === 0) {
      return corsJson({ success: false, error: '업데이트할 내용이 없습니다.' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('generation_groups')
      .update(updates)
      .eq('id', folderId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      return corsJson({ success: false, error: '폴더 업데이트에 실패했습니다.' }, { status: 500 });
    }

    return corsJson({ success: true, folder: data });
  } catch (error) {
    console.error('폴더 업데이트 오류:', error);
    return corsJson({ success: false, error: '폴더 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return applyCors(auth.response);
  }

  const { user } = auth;
  const { id: folderId } = await params;

  try {
    const { data: assets, error: assetsError } = await supabaseAdmin
      .from('generation_assets')
      .select('id, storage_path')
      .eq('group_id', folderId)
      .eq('user_id', user.id);

    if (assetsError) {
      console.error('폴더 삭제 전 에셋 조회 오류:', assetsError);
      return corsJson({ success: false, error: '폴더 삭제 전에 이미지를 불러오지 못했습니다.' }, { status: 500 });
    }

    for (const asset of assets ?? []) {
      if (asset.storage_path) {
        await removeFromStorage(asset.storage_path).catch((error) => {
          console.error('스토리지 삭제 오류:', error);
        });
      }
    }

    await supabaseAdmin.from('generation_assets').delete().eq('group_id', folderId).eq('user_id', user.id);

    const { error: deleteGroupError } = await supabaseAdmin
      .from('generation_groups')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id);

    if (deleteGroupError) {
      console.error('폴더 삭제 오류:', deleteGroupError);
      return corsJson({ success: false, error: '폴더 삭제에 실패했습니다.' }, { status: 500 });
    }

    return corsJson({ success: true });
  } catch (error) {
    console.error('폴더 삭제 처리 오류:', error);
    return corsJson({ success: false, error: '폴더 삭제 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
