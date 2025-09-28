/** @type {import('next').NextConfig} */
const nextConfig = {
  // API 라우트만 처리하고 프론트엔드는 정적 파일로 서빙
  trailingSlash: true,

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

};

module.exports = nextConfig;
