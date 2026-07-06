import getNAVs, { type NavDescriptor } from '../nav';

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
    const routes = flattenRoutes(getNAVs(null, '0x1111111111111111111111111111111111111111'));

    expect(routes).not.toContain('/transfer-cst');
    expect(routes).not.toContain('/transfer-cosmic-signature-nfts');
    expect(routes).not.toContain('/internal/cst-outreach-transfer');
  });

  it('exposes the three top-level groups in order', () => {
    const titles = getNAVs(null, null).map((nav) => nav.title);
    expect(titles).toEqual(['Gallery', 'Explore', 'Help']);
  });

  it('keeps all in-app destinations reachable', () => {
    const routes = flattenRoutes(getNAVs(null, null));

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
    for (const child of flattenChildren(getNAVs(null, null))) {
      expect(child.icon).toBeDefined();
      expect(typeof child.description).toBe('string');
      expect((child.description ?? '').length).toBeGreaterThan(0);
    }
  });

  it('flags every cross-host destination as external', () => {
    for (const child of flattenChildren(getNAVs(null, null))) {
      const isCrossHost = /^https?:\/\//.test(child.route ?? '');
      expect(!!child.external).toBe(isCrossHost);
    }
  });

  it('features the Discover destination inside the Help group', () => {
    const help = getNAVs(null, null).find((nav) => nav.title === 'Help');
    const featured = help?.children?.filter((child) => child.featured) ?? [];

    expect(featured).toHaveLength(1);
    expect(featured[0]!.route).toBe('https://cosmicsignature.com');
    expect(featured[0]!.title).toBe('Discover Cosmic Signature');
    expect(featured[0]!.external).toBe(true);
  });

  it('adds My Allocations only when the account has something to collect', () => {
    const routesWithout = flattenRoutes(getNAVs({ ETHRaffleToClaim: 0 }, '0x1'));
    expect(routesWithout).not.toContain('/my-allocations');

    const routesWith = flattenRoutes(getNAVs({ ETHRaffleToClaim: 1 }, '0x1'));
    expect(routesWith).toContain('/my-allocations');

    const routesNoAccount = flattenRoutes(getNAVs({ ETHRaffleToClaim: 1 }, null));
    expect(routesNoAccount).not.toContain('/my-allocations');
  });
});
