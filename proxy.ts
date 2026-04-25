import { NextResponse, type NextRequest } from 'next/server';

import { APP_ORIGIN, isAppOnlyPath, isLandingHost, normalizeHost } from '@/lib/hostRouting';

export const config = {
  matcher: [
    /*
     * Run on all paths except Next assets and public files. The negative
     * lookahead exclusions here are the standard Vercel recipe.
     */
    '/((?!_next/static|_next/image|_next/data|favicon.ico|paint-worklet.js|robots.txt|sitemap.xml|manifest.webmanifest|fonts|audio|images|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|avif|woff|woff2|ttf|eot|map)$).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const hostHeader = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const host = normalizeHost(hostHeader);
  const { pathname, search } = req.nextUrl;

  // `/landing-site` is an INTERNAL route — the landing lives publicly only at
  // cosmicsignature.com/. Any direct external request is either canonicalized
  // (on the marketing host) or 404'd (anywhere else) so search engines never
  // see a duplicate URL for the same content.
  if (pathname.startsWith('/landing-site')) {
    if (isLandingHost(host)) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url, 308);
    }
    return new NextResponse('Not Found', { status: 404 });
  }

  if (isLandingHost(host)) {
    if (pathname === '/' || pathname === '') {
      const url = req.nextUrl.clone();
      url.pathname = '/landing-site';
      return NextResponse.rewrite(url);
    }

    if (isAppOnlyPath(pathname)) {
      const target = `${APP_ORIGIN}${pathname}${search}`;
      return NextResponse.redirect(target, 308);
    }
  }

  return NextResponse.next();
}
