import getNAVs, { type NavDescriptor } from '../nav';

function flattenRoutes(items: NavDescriptor[]): string[] {
  return items.flatMap((item) => [
    ...(item.route ? [item.route] : []),
    ...(item.children ? flattenRoutes(item.children) : []),
  ]);
}

describe('getNAVs', () => {
  it('keeps CST transfer tools out of the main navigation', () => {
    const routes = flattenRoutes(getNAVs(null, '0x1111111111111111111111111111111111111111'));

    expect(routes).not.toContain('/transfer-cst');
    expect(routes).not.toContain('/transfer-cosmic-signature-nfts');
    expect(routes).not.toContain('/internal/cst-outreach-transfer');
  });
});
