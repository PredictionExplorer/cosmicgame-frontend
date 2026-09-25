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

function run(path: string, cookie?: string) {
  const headers = new Headers({ host: 'app.cosmicsignature.com' });
  if (cookie) headers.set('cookie', cookie);
  return middleware(new NextRequest(`https://app.cosmicsignature.com${path}`, { headers }));
}

const rewriteOf = (response: Response) => {
  const target = response.headers.get('x-middleware-rewrite');
  return target ? new URL(target).pathname : null;
};

describe('proxy: an id page with an id it turns away', () => {
  it.each([
    ['/detail/abc', 'en'],
    ['/zh/detail/abc', 'zh'],
    ['/zh-TW/allocation/01', 'zh-TW'],
    ['/embed/endurance/abc', 'en'],
  ])('answers %s with the global 404 in %s', (path, locale) => {
    const response = run(path);
    expect(rewriteOf(response)).toBe(`/${locale}/_not-found`);
    // The 404 still reads the locale next-intl resolved.
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe(locale);
    // A missing page has no editions in other languages to advertise.
    expect(response.headers.get('link')).toBeNull();
  });

  it('leaves a well-formed id to its page', () => {
    expect(rewriteOf(run('/detail/25'))).toBe('/en/detail/25');
    const prefixed = run('/zh/allocation/12');
    expect(rewriteOf(prefixed)).toBeNull();
    expect(prefixed.headers.get('link')).not.toBeNull();
  });

  it('lets the redirect to the preferred locale happen first', () => {
    const response = run('/detail/abc', 'NEXT_LOCALE=ja');
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/ja/detail/abc');
  });
});
