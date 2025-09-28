import { NextResponse } from 'next/server';

const DEFAULT_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
};

export function applyCors(response: NextResponse) {
  Object.entries(DEFAULT_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function corsJson(body: any, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  return applyCors(response);
}

export function createOptionsHandler(methods: string[] = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']) {
  const allowMethods = [...methods, 'OPTIONS'].join(',');
  return () => {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Methods', allowMethods);
    return response;
  };
}
