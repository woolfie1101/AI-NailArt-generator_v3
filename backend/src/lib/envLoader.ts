// 환경 변수 동적 로더
export async function loadEnvironmentVariables() {
  if (typeof window === 'undefined') {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  }

  // 이미 로드된 경우 전역 변수에서 가져오기
  if ((window as any).__SUPABASE_URL__ && (window as any).__SUPABASE_ANON_KEY__) {
    return {
      NEXT_PUBLIC_SUPABASE_URL: (window as any).__SUPABASE_URL__,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: (window as any).__SUPABASE_ANON_KEY__,
    };
  }

  // API에서 환경 변수 가져오기
  try {
    console.log('🔄 API에서 환경 변수 로딩 중...');
    const response = await fetch('/api/env');
    const envVars = await response.json();
    
    // 전역 변수에 저장
    (window as any).__SUPABASE_URL__ = envVars.NEXT_PUBLIC_SUPABASE_URL;
    (window as any).__SUPABASE_ANON_KEY__ = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('✅ API에서 환경 변수 로드됨');
    return envVars;
  } catch (error) {
    console.error('❌ API에서 환경 변수 로드 실패:', error);
    throw error;
  }
}
