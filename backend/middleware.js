import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // API 경로는 그대로 통과
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // _next 관련 경로도 그대로 통과
  if (pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  // favicon, robots.txt 등 정적 파일
  if (pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|txt)$/)) {
    return NextResponse.next()
  }

  // 모든 다른 경로는 React 앱의 index.html로 리다이렉트
  const url = request.nextUrl.clone()
  url.pathname = '/index.html'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}