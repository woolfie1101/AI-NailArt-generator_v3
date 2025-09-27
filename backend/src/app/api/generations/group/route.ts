import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/utils/auth';
import type { TablesInsert } from '@/lib/types/supabase';

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('response' in auth) {
    return auth.response;
  }

  const { user } = auth;

  try {
    const body = await request.json().catch(() => ({}));
    const desiredName: string | undefined = typeof body?.name === 'string' ? body.name : undefined;
    const tags: string[] = Array.isArray(body?.tags)
      ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
      : [];
    const description = typeof body?.description === 'string' ? body.description : null;

    // Build default name `YYYY-MM-DD_nn`
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10);

    const { count } = await supabaseAdmin
      .from('generation_groups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${datePrefix}T00:00:00`)
      .lte('created_at', `${datePrefix}T23:59:59`);

    const suffix = String((count ?? 0) + 1).padStart(2, '0');
    const fallbackName = `${datePrefix}_${suffix}`;
    const name = desiredName?.trim() || fallbackName;
    const timestamp = new Date().toISOString();

    const payload: TablesInsert<'generation_groups'> = {
      id: randomUUID(),
      user_id: user.id,
      name,
      description,
      tags,
      is_favorite: false,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const { data, error } = await supabaseAdmin
      .from('generation_groups')
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.error('폴더 생성 오류:', error);
      return NextResponse.json({ success: false, error: '폴더 생성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, group: data });
  } catch (error) {
    console.error('폴더 생성 중 오류:', error);
    return NextResponse.json({ success: false, error: '폴더 생성 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
