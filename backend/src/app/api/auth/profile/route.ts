import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import type { Tables } from '@/lib/types/supabase';

type Profile = Tables<'profiles'>;

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: '서버 설정 오류가 발생했습니다.' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // 프로필이 없으면 생성
      const newProfile: Profile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: '프로필 생성에 실패했습니다.' }, { status: 500 });
      }

      return NextResponse.json({ profile: createdProfile });
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: '서버 설정 오류가 발생했습니다.' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { full_name, avatar_url } = await request.json();

    // 토큰 검증
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 프로필 업데이트
    const { data: profile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
