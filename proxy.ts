import { NextRequest, NextResponse } from 'next/server';

const MARKETING_HOSTNAMES = new Set([
  'cosmicsignature.com',
  'www.cosmicsignature.com',
  'localhost',
]);

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] ?? '';
  const { pathname } = request.nextUrl;

  if (MARKETING_HOSTNAMES.has(hostname) && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/lp';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
