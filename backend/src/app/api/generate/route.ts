import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { authenticateRequest } from '@/utils/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { AIService } from '@/utils/aiService';
import { ImageProcessor } from '@/utils/imageProcessor';
import { uploadImageToStorage, createSignedUrl } from '@/utils/storage';
import type { GenerateRequest, GenerateResponse, ImagePayload, LibraryAssetResponse } from '@/types/api';

const DEFAULT_IMAGE_FORMAT = 'jpeg';
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0 && tag.length <= 40)
    .slice(0, 20);
}

function normalizeBase64(payload?: ImagePayload | null): ImagePayload | null {
  if (!payload?.data || typeof payload.data !== 'string') {
    return null;
  }

  const mimeType = typeof payload.mimeType === 'string' ? payload.mimeType : 'image/png';

  if (!SUPPORTED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('지원하지 않는 이미지 형식입니다.');
  }

  const data = payload.data.includes(',') ? payload.data.split(',').pop() ?? '' : payload.data;

  if (!data) {
    throw new Error('이미지 데이터가 비어 있습니다.');
  }

  return { data, mimeType };
}

async function ensureGroup(userId: string, groupId?: string, desiredName?: string) {
  if (groupId) {
    const { data, error } = await supabaseAdmin
      .from('generation_groups')
      .select('id, user_id, name')
      .eq('id', groupId)
      .maybeSingle();

    if (error) {
      throw new Error('폴더 정보를 조회하지 못했습니다.');
    }

    if (!data) {
      const notFound = new Error('폴더를 찾을 수 없습니다.');
      (notFound as Error & { status?: number }).status = 404;
      throw notFound;
    }

    if (data.user_id !== userId) {
      const forbidden = new Error('해당 폴더에 접근 권한이 없습니다.');
      (forbidden as Error & { status?: number }).status = 403;
      throw forbidden;
    }

    return { id: data.id, name: data.name, isNew: false };
  }

  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10);

  const { count } = await supabaseAdmin
    .from('generation_groups')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${datePrefix}T00:00:00`)
    .lte('created_at', `${datePrefix}T23:59:59`);

  const suffix = String((count ?? 0) + 1).padStart(2, '0');
  const fallbackName = `${datePrefix}_${suffix}`;
  const name = desiredName?.trim() || fallbackName;
  const timestamp = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('generation_groups')
    .insert({
      id: randomUUID(),
      user_id: userId,
      name,
      created_at: timestamp,
      updated_at: timestamp,
      description: null,
      tags: [],
      is_favorite: false,
    })
    .select('id, name')
    .single();

  if (error || !data) {
    throw new Error('폴더 생성에 실패했습니다.');
  }

  return { id: data.id, name: data.name, isNew: true };
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;

  try {
    const payload = (await request.json()) as GenerateRequest;

    if (!payload?.prompt && !payload.generatedImage) {
      return NextResponse.json({ success: false, error: '프롬프트 또는 이미지 데이터가 필요합니다.' }, { status: 400 });
    }

    const tags = sanitizeTags(payload.tags);
    const parentAssetId = typeof payload.parentAssetId === 'string' ? payload.parentAssetId : null;

    const group = await ensureGroup(user.id, payload.groupId);

    const generatedImage = payload.generatedImage ? normalizeBase64(payload.generatedImage) : null;
    const baseImage = payload.baseImage ? normalizeBase64(payload.baseImage) : null;
    const styleImage = payload.styleImage ? normalizeBase64(payload.styleImage) : null;

    let finalImage = generatedImage;

    if (!finalImage) {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ success: false, error: 'AI API 키가 설정되지 않았습니다.' }, { status: 500 });
      }

      if (!baseImage) {
        return NextResponse.json({ success: false, error: '베이스 이미지 데이터가 필요합니다.' }, { status: 400 });
      }

      const aiService = new AIService(apiKey);
      const result = await aiService.generateNailArt({
        baseImage,
        styleImage,
        prompt: payload.prompt ?? '',
        mode: payload.mode ?? 'inspiration',
        isRegeneration: Boolean(parentAssetId),
      });

      finalImage = normalizeBase64(result);
    }

    if (!finalImage) {
      return NextResponse.json({ success: false, error: '이미지 생성에 실패했습니다.' }, { status: 500 });
    }

    const assetId = randomUUID();
    const storagePath = `${user.id}/${group.id}/${assetId}.${DEFAULT_IMAGE_FORMAT}`;
    const buffer = Buffer.from(finalImage.data, 'base64');
    const optimizedBuffer = await ImageProcessor.optimizeImage(buffer, {
      width: 1024,
      height: 1024,
      quality: 90,
      format: 'jpeg',
    });

    await uploadImageToStorage(storagePath, optimizedBuffer);

    const timestamp = new Date().toISOString();
    const assetName = typeof payload.name === 'string' && payload.name.trim().length > 0 ? payload.name.trim() : assetId;

    const { data: insertedAsset, error: insertError } = await supabaseAdmin
      .from('generation_assets')
      .insert({
        id: assetId,
        group_id: group.id,
        user_id: user.id,
        storage_path: storagePath,
        name: assetName,
        tags,
        parent_asset_id: parentAssetId,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select('id, group_id, storage_path, name, tags, created_at, parent_asset_id')
      .single();

    if (insertError || !insertedAsset) {
      console.error('Asset insert error:', insertError);
      return NextResponse.json({ success: false, error: '이미지 메타데이터 저장에 실패했습니다.' }, { status: 500 });
    }

    await supabaseAdmin
      .from('generation_groups')
      .update({ updated_at: timestamp })
      .eq('id', group.id);

    const signedUrl = await createSignedUrl(storagePath, 60 * 60);

    const assetResponse: LibraryAssetResponse = {
      id: insertedAsset.id,
      groupId: insertedAsset.group_id,
      name: insertedAsset.name,
      tags: insertedAsset.tags ?? [],
      storagePath: insertedAsset.storage_path,
      imageUrl: signedUrl,
      createdAt: insertedAsset.created_at ?? timestamp,
      parentAssetId: insertedAsset.parent_asset_id,
    };

    const response: GenerateResponse = {
      success: true,
      asset: assetResponse,
      group,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    console.error('AI 생성 처리 오류:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status });
  }
}
