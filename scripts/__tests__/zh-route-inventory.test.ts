import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { ZH_ROUTE_INVENTORY } from '../../e2e/zh-route-inventory';

const LOCALE_APP_ROOT = join(process.cwd(), 'app', '[locale]');

function collectPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectPageFiles(path);
    return entry.name === 'page.tsx' ? [relative(LOCALE_APP_ROOT, path)] : [];
  });
}

function publicPathForPageFile(pageFile: string): string {
  const withoutGroup = pageFile.replace(/^\((?:app|landing)\)\//, '');
  const withoutPage = withoutGroup.replace(/\/?page\.tsx$/, '');
  if (withoutPage === '' || withoutPage === 'landing-site') return '/';
  return `/${withoutPage}`;
}

describe('canonical localized route inventory', () => {
  it('accounts for every app/[locale] page exactly once', () => {
    const actual = collectPageFiles(LOCALE_APP_ROOT).sort();
    const inventoried = ZH_ROUTE_INVENTORY.map((route) => route.pageFile).sort();

    expect(actual).toHaveLength(65);
    expect(inventoried).toHaveLength(65);
    expect(inventoried).toEqual(actual);
  });

  it('keeps public route templates synchronized with page locations', () => {
    for (const route of ZH_ROUTE_INVENTORY) {
      expect(route.publicPath).toBe(publicPathForPageFile(route.pageFile));
    }
  });

  it('uses unique route IDs and deterministic dynamic fixtures', () => {
    expect(new Set(ZH_ROUTE_INVENTORY.map((route) => route.id)).size).toBe(
      ZH_ROUTE_INVENTORY.length,
    );
    expect(
      new Set(ZH_ROUTE_INVENTORY.map((route) => `${route.host}:${route.publicPath}`)).size,
    ).toBe(ZH_ROUTE_INVENTORY.length);

    for (const route of ZH_ROUTE_INVENTORY) {
      expect(route.fixturePath).not.toMatch(/\[[^\]]+\]/);
      expect(route.expectedText).toMatch(/[\u3400-\u9fff]/);
    }
  });

  it('keeps all required route clusters represented', () => {
    expect(new Set(ZH_ROUTE_INVENTORY.map((route) => route.cluster))).toEqual(
      new Set(['global', 'landing', 'core', 'transactions', 'statistics', 'trust', 'long-tail']),
    );
  });
});
