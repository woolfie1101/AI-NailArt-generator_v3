import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/lib/types/supabase';

type Generation = Tables<'nail_art_generations'>;
type GenerationInsert = TablesInsert<'nail_art_generations'>;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // 토큰 검증
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 사용자의 생성 기록 조회
    const { data: generations, error: generationsError, count } = await supabaseAdmin
      .from('nail_art_generations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (generationsError) {
      return NextResponse.json({ error: '생성 기록 조회에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      generations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('생성 기록 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const generationData: Omit<GenerationInsert, 'user_id'> = await request.json();
    
    // 토큰 검증
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 사용량 확인
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM 형식
    const { data: usage } = await supabaseAdmin
      .from('user_usage')
      .select('generations_count')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single();

    const currentUsage = usage?.generations_count || 0;

    // 사용자 구독 정보 확인
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const subscriptionTier = profile?.subscription_tier || 'free';
    
    // 무료 사용자의 경우 월 5회 제한
    if (subscriptionTier === 'free' && currentUsage >= 5) {
      return NextResponse.json({ 
        error: '무료 플랜의 월 생성 한도(5회)를 초과했습니다. 프리미엄 플랜으로 업그레이드하세요.' 
      }, { status: 403 });
    }

    // 생성 기록 저장
    const newGeneration: GenerationInsert = {
      ...generationData,
      user_id: user.id
    };

    const { data: generation, error: insertError } = await supabaseAdmin
      .from('nail_art_generations')
      .insert(newGeneration)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: '생성 기록 저장에 실패했습니다.' }, { status: 500 });
    }

    // 사용량 업데이트
    await supabaseAdmin
      .from('user_usage')
      .upsert({
        user_id: user.id,
        month_year: currentMonth,
        generations_count: currentUsage + 1,
        updated_at: new Date().toISOString()
      });

    return NextResponse.json({ generation });

  } catch (error) {
    console.error('생성 기록 저장 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
