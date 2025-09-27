import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ImageProcessor } from '@/utils/imageProcessor';
import { authenticateRequest } from '@/utils/auth';
import { uploadImageToStorage, createSignedUrl } from '@/utils/storage';
import { supabaseAdmin } from '@/lib/supabase';
import type { UploadResponse } from '@/types/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function parseTags(input: FormDataEntryValue | null): string[] {
  if (!input) {
    return [];
  }

  const value = input.toString();
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((tag) => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean);
    }
  } catch (error) {
    // fallback to comma separated list
  }

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const groupId = formData.get('groupId')?.toString();
    const parentAssetId = formData.get('parentAssetId')?.toString() || null;
    const assetNameInput = formData.get('name')?.toString();
    const tags = parseTags(formData.get('tags'));

    if (!file) {
      return NextResponse.json({ success: false, error: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    if (!groupId) {
      return NextResponse.json({ success: false, error: 'groupId가 필요합니다.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    // Ensure folder belongs to user
    const { data: group, error: groupError } = await supabaseAdmin
      .from('generation_groups')
      .select('id, user_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ success: false, error: '폴더를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (group.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '폴더에 대한 권한이 없습니다.' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const optimizedBuffer = await ImageProcessor.optimizeImage(buffer, {
      width: 1024,
      height: 1024,
      quality: 85,
      format: 'jpeg',
    });

    const assetId = randomUUID();
    const storagePath = `${user.id}/${groupId}/${assetId}.jpeg`;

    await uploadImageToStorage(storagePath, optimizedBuffer);

    const assetName = assetNameInput?.trim() || assetId;
    const timestamp = new Date().toISOString();

    const { data: insertedAsset, error: insertError } = await supabaseAdmin
      .from('generation_assets')
      .insert({
        id: assetId,
        group_id: groupId,
        user_id: user.id,
        storage_path: storagePath,
        name: assetName,
        tags,
        parent_asset_id: parentAssetId,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (insertError || !insertedAsset) {
      console.error('Asset insert error:', insertError);
      return NextResponse.json({ success: false, error: '이미지 메타데이터 저장에 실패했습니다.' }, { status: 500 });
    }

    await supabaseAdmin
      .from('generation_groups')
      .update({ updated_at: timestamp })
      .eq('id', groupId);

    const signedUrl = await createSignedUrl(storagePath, 60 * 60);

    const response: UploadResponse = {
      success: true,
      asset: {
        id: insertedAsset.id,
        groupId: insertedAsset.group_id,
        name: insertedAsset.name,
        tags: insertedAsset.tags ?? [],
        storagePath: insertedAsset.storage_path,
        imageUrl: signedUrl,
        createdAt: insertedAsset.created_at ?? timestamp,
        parentAssetId: insertedAsset.parent_asset_id,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json({ success: false, error: '파일 업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
