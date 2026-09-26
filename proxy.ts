import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';
import {
  APP_ORIGIN,
  LANDING_ORIGIN,
  isAppOnlyPath,
  isAppHost,
  isKnownPublicPath,
  isLandingHost,
  isLandingOnlyPath,
  isLegacyWwwLandingHost,
  normalizeHost,
  splitLocalePrefix,
} from '@/lib/hostRouting';
import {
  UNMATCHED_INTERNAL_PATH,
  canonicalParamPath,
  isRejectedParamPath,
  pageAliasTarget,
} from '@/lib/paramRoutes';

export const config = {
  matcher: [
    /*
     * Run on all paths except Next assets and public files. The negative
     * lookahead exclusions here are the standard Vercel recipe. The web
     * manifest is localized (`/[locale]/manifest.webmanifest`), so the legacy
     * `/manifest.webmanifest` goes through next-intl to the English one.
     * `.well-known` holds security.txt, which is the same on both hosts.
     */
    '/((?!_next/static|_next/image|_next/data|favicon.ico|paint-worklet.js|robots.txt|sitemap.xml|sitemap-nfts.xml|llms(?:-full)?\\.txt|\\.well-known|fonts|audio|images|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|avif|woff|woff2|ttf|eot|map|pdf)$).*)',
  ],
};

/**
 * Locale detection, redirect, and internal rewrite to `/[locale]/...`.
 * Resolution order: URL prefix -> NEXT_LOCALE cookie -> Accept-Language ->
 * default. With `localePrefix: 'as-needed'`, English URLs stay unprefixed.
 */
const intlMiddleware = createIntlMiddleware(routing);

function isRedirect(response: NextResponse): boolean {
  return response.status >= 300 && response.status < 400;
}

/**
 * Makes the middleware READ-ONLY over the NEXT_LOCALE cookie.
 *
 * next-intl's middleware re-writes the cookie on every request whose URL
 * locale differs from it — including App Router PREFETCHES. When a user
 * switches zh -> en, prefetches of still-mounted `/zh/...` links respond
 * with `Set-Cookie: NEXT_LOCALE=zh` and clobber the fresh choice, so the
 * switch "doesn't stick". Next 16 strips the `Next-Router-Prefetch` header
 * before middleware runs, so prefetches cannot be told apart server-side.
 *
 * Instead, the server never writes the cookie: next-intl's client router
 * writes it on every explicit locale switch (see LanguageSwitcher), and the
 * middleware keeps READING it to redirect unprefixed URLs to the preferred
 * locale. Cookies set in middleware travel on `set-cookie` AND on
 * `x-middleware-set-cookie` (re-applied by the server after a rewrite), so
 * both are stripped.
 */
function withoutLocaleCookieWrites(res: NextResponse): NextResponse {
  res.headers.delete('set-cookie');
  res.headers.delete('x-middleware-set-cookie');
  return res;
}

/**
 * Host routing composed with locale routing (docs/i18n/README.md §2.3).
 *
 * All host decisions run against the locale-STRIPPED public path so that
 * `/zh/gallery` follows the same host rules as `/gallery`; redirects
 * re-attach the locale prefix. Everything that stays on this host is then
 * delegated to the next-intl middleware, which owns locale detection and the
 * internal rewrite to the `/[locale]/...` segment.
 */
export default function middleware(req: NextRequest) {
  const hostHeader = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const host = normalizeHost(hostHeader);
  const { pathname, search } = req.nextUrl;
  const { locale, publicPath } = splitLocalePrefix(pathname);
  // URL prefix for non-default locales ('' for English, '/zh' for Chinese).
  const prefix = locale !== undefined && locale !== routing.defaultLocale ? `/${locale}` : '';

  if (isLegacyWwwLandingHost(host)) {
    const publicPathname = publicPath.startsWith('/landing-site') ? '/' : publicPath;
    const suffix = publicPathname === '/' ? '' : publicPathname;
    return NextResponse.redirect(`${LANDING_ORIGIN}${prefix}${suffix}${search}`, 308);
  }

  // Next's generated metadata URLs retain the physical `/[locale]/` segment,
  // including `/en/` under the public `as-needed` locale policy. Sending these
  // through next-intl would redirect English images to an unprefixed path, and
  // the hidden landing-site image would be canonicalized to `/`. Serve the
  // generated endpoint at the exact URL emitted in og:image instead. The app
  // layout links its locale's web manifest the same way.
  if (
    locale !== undefined &&
    (/\/opengraph-image(?:[-/]|$)/.test(publicPath) || publicPath === '/manifest.webmanifest')
  ) {
    return NextResponse.next();
  }

  // `/landing-site` is an INTERNAL route — the landing lives publicly only at
  // cosmicsignature.com/ (and /zh). Any direct external request is either
  // canonicalized (on the marketing host) or 404'd (anywhere else) so search
  // engines never see a duplicate URL for the same content.
  if (publicPath.startsWith('/landing-site')) {
    if (isLandingHost(host)) {
      const url = req.nextUrl.clone();
      url.pathname = prefix || '/';
      return NextResponse.redirect(url, 308);
    }
    return new NextResponse('Not Found', { status: 404 });
  }

  if (isLandingHost(host)) {
    if (publicPath === '/' || publicPath === '') {
      // Let next-intl issue locale-detection redirects (e.g. `/` -> `/zh`
      // for a returning Chinese-locale visitor) against the PUBLIC URL, so
      // the internal landing-site path never leaks into a Location header.
      const detection = intlMiddleware(req);
      if (detection && isRedirect(detection)) {
        return withoutLocaleCookieWrites(detection);
      }
      // No redirect needed: rewrite directly to the locale-segmented internal
      // route. Running next-intl a second time here can retain the original
      // root router state and render `/[locale]` while advertising
      // `/landing-site` metadata.
      const internalUrl = req.nextUrl.clone();
      internalUrl.pathname = `/${locale ?? routing.defaultLocale}/landing-site`;
      return NextResponse.rewrite(internalUrl);
    }

    if (isAppOnlyPath(publicPath)) {
      const target = `${APP_ORIGIN}${prefix}${pageAliasTarget(publicPath) ?? publicPath}${search}`;
      return NextResponse.redirect(target, 308);
    }
  }

  if (isAppHost(host) && isLandingOnlyPath(publicPath)) {
    return NextResponse.redirect(`${LANDING_ORIGIN}${prefix}${publicPath}${search}`, 308);
  }

  // API routes live outside the [locale] segment and must not be rewritten.
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const response = withoutLocaleCookieWrites(intlMiddleware(req));

  // One URL per page and per record: `/source-code` moves to `/code` and
  // `/detail/025` to `/detail/25` here, before routing, so no cached render
  // has to raise the redirect (lib/paramRoutes.ts).
  const canonical = isRedirect(response)
    ? null
    : (pageAliasTarget(publicPath) ?? canonicalParamPath(publicPath));
  if (canonical) {
    const target = req.nextUrl.clone();
    target.pathname = `${prefix}${canonical}`;
    return NextResponse.redirect(target, 308);
  }

  // A page asked for a parameter it does not serve (/detail/abc,
  // /learn/no-such-guide) is the global 404 too, answered before routing
  // (lib/paramRoutes.ts). The rewrite keeps next-intl's request headers (the
  // resolved locale) and the visitor's URL.
  if (!isRedirect(response) && isRejectedParamPath(publicPath)) {
    const target = req.nextUrl.clone();
    target.pathname = `/${locale ?? routing.defaultLocale}${UNMATCHED_INTERNAL_PATH}`;
    const notFound = NextResponse.rewrite(target, { headers: response.headers });
    notFound.headers.delete('link');
    return notFound;
  }

  // A path no page starts with is a 404 (app/global-not-found.tsx): it has no
  // editions in other languages to advertise.
  if (!isKnownPublicPath(publicPath)) response.headers.delete('link');
  return response;
}
