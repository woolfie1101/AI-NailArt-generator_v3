/** @type {import('next').NextConfig} */
const nextConfig = {
  // API 라우트만 처리하고 프론트엔드는 정적 파일로 서빙
  trailingSlash: false,

  // 정적 파일 서빙 설정
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // 이미지 최적화 설정
  images: {
    unoptimized: true,
  },

  // 출력 설정
  output: 'standalone',

  // ESLint 무시 (프로덕션 빌드 시)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript 타입 체크 무시 (프로덕션 빌드 시)
  typescript: {
    ignoreBuildErrors: true,
  },

  // 환경 변수를 클라이언트에 주입
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // 런타임 환경 변수 주입
  async rewrites() {
    return [
      {
        source: '/api/env',
        destination: '/api/env/route',
      },
    ];
  },

};

module.exports = nextConfig;
