import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/utils/auth';
import { createSignedUrls } from '@/utils/storage';
import type { LibraryFoldersResponse } from '@/types/api';

const DEFAULT_LIMIT = 20;

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT, 1),
    50
  );
  const cursor = searchParams.get('cursor');
  const favorite = parseBoolean(searchParams.get('favorite'));
  const tagsParam = searchParams.get('tags');
  const tagsFilter = tagsParam ? tagsParam.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  try {
    let query = supabaseAdmin
      .from('generation_groups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (favorite !== undefined) {
      query = query.eq('is_favorite', favorite);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: groups, error: groupsError } = await query;

    if (groupsError) {
      console.error('폴더 목록 조회 오류:', groupsError);
      return NextResponse.json({ success: false, error: '폴더 목록 조회에 실패했습니다.' }, { status: 500 });
    }

    if (!groups || groups.length === 0) {
      const emptyResponse: LibraryFoldersResponse = { success: true, folders: [], nextCursor: null };
      return NextResponse.json(emptyResponse);
    }

    const filteredGroups = tagsFilter.length
      ? groups.filter((group) => {
          const groupTags = group.tags ?? [];
          return tagsFilter.every((tag) => groupTags.includes(tag));
        })
      : groups;

    if (filteredGroups.length === 0) {
      return NextResponse.json({ success: true, folders: [], nextCursor: null } as LibraryFoldersResponse);
    }

    const groupIds = filteredGroups.map((group) => group.id);

    let assets: Array<{
      id: string;
      group_id: string;
      storage_path: string;
      name: string;
      tags: string[] | null;
      created_at: string | null;
    }> = [];

    if (groupIds.length > 0) {
      const { data, error: assetsError } = await supabaseAdmin
        .from('generation_assets')
        .select('id, group_id, storage_path, name, tags, created_at')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false });

      if (assetsError) {
        console.error('에셋 조회 오류:', assetsError);
        return NextResponse.json({ success: false, error: '이미지 조회에 실패했습니다.' }, { status: 500 });
      }

      assets = data ?? [];
    }
    const assetsByGroup = new Map<string, typeof assets>();
    for (const asset of assets) {
      const list = assetsByGroup.get(asset.group_id) ?? [];
      list.push(asset);
      assetsByGroup.set(asset.group_id, list);
    }

    const previewPaths = assets.slice(0, groupIds.length * 4).map((asset) => asset.storage_path);
    const signedMap = previewPaths.length ? await createSignedUrls(previewPaths) : {};

    const folders = filteredGroups.map((group) => {
      const groupAssets = assetsByGroup.get(group.id) ?? [];
      const thumbnails = groupAssets
        .slice(0, 4)
        .map((asset) => signedMap[asset.storage_path])
        .filter(Boolean);

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        tags: group.tags ?? [],
        isFavorite: group.is_favorite ?? false,
        imageCount: groupAssets.length,
        thumbnails,
      };
    });

    const nextCursorValue = filteredGroups.length === limit ? filteredGroups[filteredGroups.length - 1].created_at : null;

    const response: LibraryFoldersResponse = {
      success: true,
      folders,
      nextCursor: nextCursorValue,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('폴더 목록 처리 오류:', error);
    return NextResponse.json({ success: false, error: '폴더 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}
