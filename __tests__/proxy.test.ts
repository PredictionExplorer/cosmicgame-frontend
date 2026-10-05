/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';

import { routing } from '@/i18n/routing';
import { splitLocalePrefix } from '@/lib/hostRouting';

import middleware from '../proxy';

/**
 * next-intl ships its middleware as ES modules only, which jest does not
 * transform, so this stands in for it with the same three outcomes under
 * `localePrefix: 'as-needed'`: a redirect to the preferred locale's prefix,
 * a rewrite of an unprefixed path to the default locale's segment, or the
 * prefixed path as is. Each passes the resolved locale on a request header.
 */
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: () => (req: NextRequest) => {
    const { locale, publicPath } = splitLocalePrefix(req.nextUrl.pathname);
    const preferred = req.cookies.get('NEXT_LOCALE')?.value;
    if (!locale && preferred && preferred !== routing.defaultLocale) {
      return NextResponse.redirect(new URL(`/${preferred}${publicPath}`, req.url));
    }
    const resolved = locale ?? routing.defaultLocale;
    const headers = new Headers(req.headers);
    headers.set('X-NEXT-INTL-LOCALE', resolved);
    const response = locale
      ? NextResponse.next({ request: { headers } })
      : NextResponse.rewrite(new URL(`/${resolved}${publicPath}`, req.url), {
          request: { headers },
        });
    response.headers.set('Link', '<https://app.cosmicsignature.com/zh>; rel="alternate"');
    return response;
  },
}));

function run(path: string, { cookie, host = 'app.cosmicsignature.com' } = {} as RunOptions) {
  const headers = new Headers({ host });
  if (cookie) headers.set('cookie', cookie);
  return middleware(new NextRequest(`https://${host}${path}`, { headers }));
}

interface RunOptions {
  cookie?: string;
  host?: string;
}

const rewriteOf = (response: Response) => {
  const target = response.headers.get('x-middleware-rewrite');
  return target ? new URL(target).pathname : null;
};

describe('proxy: a page asked for a parameter it does not serve', () => {
  it.each([
    ['/detail/abc', 'en'],
    ['/zh/detail/abc', 'zh'],
    ['/zh-TW/allocation/01', 'zh-TW'],
    ['/embed/endurance/abc', 'en'],
    ['/ko/anchor-action/2/5', 'ko'],
    ['/system-event/2/350/200', 'en'],
  ])('answers %s with the global 404 in %s', (path, locale) => {
    const response = run(path);
    expect(rewriteOf(response)).toBe(`/${locale}/_not-found`);
    // The 404 still reads the locale next-intl resolved.
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe(locale);
    // A missing page has no editions in other languages to advertise.
    expect(response.headers.get('link')).toBeNull();
  });

  // Prerendered with dynamicParams = false, which would log an internal
  // NoFallbackError for every unknown slug if the request reached routing.
  it.each([
    ['/learn/no-such-guide', 'en'],
    ['/ja/quiz/expert', 'ja'],
  ])('answers the landing’s %s with the global 404 in %s', (path, locale) => {
    const response = run(path, { host: 'cosmicsignature.com' });
    expect(rewriteOf(response)).toBe(`/${locale}/_not-found`);
    expect(response.headers.get('link')).toBeNull();
  });

  it('leaves a well-formed id to its page', () => {
    expect(rewriteOf(run('/detail/25'))).toBe('/en/detail/25');
    const prefixed = run('/zh/allocation/12');
    expect(rewriteOf(prefixed)).toBeNull();
    expect(prefixed.headers.get('link')).not.toBeNull();
  });

  it('lets the redirect to the preferred locale happen first', () => {
    const response = run('/detail/abc', { cookie: 'NEXT_LOCALE=ja' });
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/ja/detail/abc');
  });
});

// Raised inside the page's cached render, the redirect's Location header
// reached the browser twice whenever the render was not cached yet.
describe('proxy: a Signature asked for by its zero-padded number', () => {
  it.each([
    ['/detail/0001', '/detail/1'],
    ['/zh/detail/0001', '/zh/detail/1'],
    ['/en/detail/025', '/detail/25'],
  ])('moves %s to %s before routing, keeping the query', (path, target) => {
    const response = run(`${path}?ref=share`);
    expect(response.status).toBe(308);
    expect(response.headers.getSetCookie()).toEqual([]);
    const location = new URL(response.headers.get('location')!);
    expect(location.pathname).toBe(target);
    expect(location.search).toBe('?ref=share');
  });

  it('lets the redirect to the preferred locale happen first', () => {
    const response = run('/detail/025', { cookie: 'NEXT_LOCALE=ja' });
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/ja/detail/025');
  });
});

// An alias has no page: rendered, it showed the app shell only to raise the
// redirect, and without the app's environment it rendered that shell instead.
describe('proxy: a page asked for by an alias', () => {
  it.each([
    ['/source-code', '/code'],
    ['/zh-TW/source-code', '/zh-TW/code'],
    ['/en/source-code', '/code'],
  ])('moves %s to %s before routing, keeping the query', (path, target) => {
    const response = run(`${path}?ref=share`);
    expect(response.status).toBe(308);
    expect(response.headers.getSetCookie()).toEqual([]);
    const location = new URL(response.headers.get('location')!);
    expect(location.pathname).toBe(target);
    expect(location.search).toBe('?ref=share');
  });

  it('sends the landing host straight to the page on the app host', () => {
    const response = run('/ja/source-code?ref=share', { host: 'cosmicsignature.com' });
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'https://app.cosmicsignature.com/ja/code?ref=share',
    );
  });

  it('lets the redirect to the preferred locale happen first', () => {
    const response = run('/source-code', { cookie: 'NEXT_LOCALE=uk' });
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/uk/source-code');
  });
});
