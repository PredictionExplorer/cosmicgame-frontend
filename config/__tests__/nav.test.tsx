import { TRANSLATED_LOCALES, type AppLocale } from '@/i18n/routing';

import getNAVs, { type NavDescriptor } from '../nav';
import navMessages from '../../messages/en/nav.json';

function t(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (current, part) =>
        typeof current === 'object' && current !== null
          ? (current as Record<string, unknown>)[part]
          : undefined,
      navMessages,
    );
  if (typeof value !== 'string') throw new Error(`Missing test message: ${key}`);
  return value;
}

function navs(
  status: Parameters<typeof getNAVs>[0] = null,
  account: string | null = null,
  locale: AppLocale = 'en',
) {
  return getNAVs(status, account, t, locale);
}

function flattenRoutes(items: NavDescriptor[]): string[] {
  return items.flatMap((item) => [
    ...(item.route ? [item.route] : []),
    ...(item.children ? flattenRoutes(item.children) : []),
  ]);
}

function flattenChildren(items: NavDescriptor[]): NavDescriptor[] {
  return items.flatMap((item) => item.children ?? []);
}

describe('getNAVs', () => {
  it('keeps CST transfer tools out of the main navigation', () => {
    const routes = flattenRoutes(navs(null, '0x1111111111111111111111111111111111111111'));

    expect(routes).not.toContain('/transfer-cst');
    expect(routes).not.toContain('/transfer-cosmic-signature-nfts');
    expect(routes).not.toContain('/internal/cst-outreach-transfer');
  });

  it('exposes the three top-level groups in order', () => {
    const titles = navs().map((nav) => nav.title);
    expect(titles).toEqual(['Gallery', 'Explore', 'Help']);
  });

  it('keeps all in-app destinations reachable', () => {
    const routes = flattenRoutes(navs());

    for (const route of [
      '/gallery',
      '/current-cycle',
      '/allocation',
      '/anchoring',
      '/marketing',
      '/statistics',
      '/contracts',
      '/how-it-works',
      '/faq',
    ]) {
      expect(routes).toContain(route);
    }
  });

  it('gives every panel child an icon and a description', () => {
    for (const child of flattenChildren(navs())) {
      expect(child.icon).toBeDefined();
      expect(typeof child.description).toBe('string');
      expect((child.description ?? '').length).toBeGreaterThan(0);
    }
  });

  it('flags every cross-host destination as external', () => {
    for (const child of flattenChildren(navs())) {
      const isCrossHost = /^https?:\/\//.test(child.route ?? '');
      expect(!!child.external).toBe(isCrossHost);
    }
  });

  it('features the Discover destination inside the Help group', () => {
    const help = navs().find((nav) => nav.title === 'Help');
    const featured = help?.children?.filter((child) => child.featured) ?? [];

    expect(featured).toHaveLength(1);
    expect(featured[0]!.route).toBe('https://cosmicsignature.com');
    expect(featured[0]!.title).toBe('Discover Cosmic Signature');
    expect(featured[0]!.external).toBe(true);
  });

  it.each(TRANSLATED_LOCALES)(
    'carries the %s locale prefix to cross-host destinations',
    (locale) => {
      const help = navs(null, null, locale).find((nav) => nav.title === 'Help');
      const routes = help?.children?.map((child) => child.route) ?? [];
      expect(routes).toContain(`https://cosmicsignature.com/${locale}/about`);
      expect(routes).toContain(`https://cosmicsignature.com/${locale}/learn`);
      expect(routes).toContain(`https://cosmicsignature.com/${locale}`);
    },
  );

  it('adds My Allocations only when the account has something to collect', () => {
    const routesWithout = flattenRoutes(navs({ ETHRaffleToClaim: 0 }, '0x1'));
    expect(routesWithout).not.toContain('/my-allocations');

    const routesWith = flattenRoutes(navs({ ETHRaffleToClaim: 1 }, '0x1'));
    expect(routesWith).toContain('/my-allocations');

    const routesNoAccount = flattenRoutes(navs({ ETHRaffleToClaim: 1 }, null));
    expect(routesNoAccount).not.toContain('/my-allocations');
  });
});
