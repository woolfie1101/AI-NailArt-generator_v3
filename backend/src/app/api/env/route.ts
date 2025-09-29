import { NextResponse } from 'next/server';

export async function GET() {
  // 클라이언트에서 필요한 환경 변수만 노출
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  return NextResponse.json(envVars);
}
