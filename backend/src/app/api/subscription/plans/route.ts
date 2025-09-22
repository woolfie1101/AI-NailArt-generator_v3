import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 모든 활성화된 구독 플랜 조회
    const { data: plans, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      return NextResponse.json({ error: '구독 플랜 조회에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ plans });

  } catch (error) {
    console.error('구독 플랜 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
