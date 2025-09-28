import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabase';

interface AuthSuccess {
  user: User;
}

interface AuthFailure {
  response: NextResponse;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      response: NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 }),
    };
  }

  if (!supabaseAdmin) {
    return {
      response: NextResponse.json({ error: '서버 설정 오류: Supabase admin 클라이언트를 사용할 수 없습니다.' }, { status: 500 }),
    };
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return {
      response: NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 }),
    };
  }

  return { user: data.user };
}
