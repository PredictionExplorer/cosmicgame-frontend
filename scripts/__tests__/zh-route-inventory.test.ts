import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import {
  GLOBAL_NOT_FOUND_FILE,
  PROXY_ALIAS_FILE,
  ZH_ROUTE_INVENTORY,
} from '../../e2e/zh-route-inventory';
import { PAGE_ALIASES, pageAliasTarget } from '../../lib/paramRoutes';

const LOCALE_APP_ROOT = join(process.cwd(), 'app', '[locale]');

function collectPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectPageFiles(path);
    return entry.name === 'page.tsx' ? [relative(LOCALE_APP_ROOT, path)] : [];
  });
}

function publicPathForPageFile(pageFile: string): string {
  if (pageFile === GLOBAL_NOT_FOUND_FILE) return '/[...notFound]';
  const withoutGroup = pageFile.replace(/^\((?:app|embed|landing)\)\//, '');
  const withoutPage = withoutGroup.replace(/\/?page\.tsx$/, '');
  if (withoutPage === '' || withoutPage === 'landing-site') return '/';
  return `/${withoutPage}`;
}

const isAlias = (route: { pageFile: string }) => route.pageFile === PROXY_ALIAS_FILE;

describe('canonical localized route inventory', () => {
  it('accounts for every app/[locale] page and the global 404 exactly once', () => {
    const globalNotFound = relative(
      LOCALE_APP_ROOT,
      join(process.cwd(), 'app', 'global-not-found.tsx'),
    );
    expect(globalNotFound).toBe(GLOBAL_NOT_FOUND_FILE);
    const actual = [...collectPageFiles(LOCALE_APP_ROOT), globalNotFound].sort();
    const inventoried = ZH_ROUTE_INVENTORY.filter((route) => !isAlias(route))
      .map((route) => route.pageFile)
      .sort();

    expect(actual).toHaveLength(65);
    expect(inventoried).toHaveLength(65);
    expect(inventoried).toEqual(actual);
  });

  it('accounts for every alias proxy.ts answers exactly once', () => {
    expect(relative(LOCALE_APP_ROOT, join(process.cwd(), 'proxy.ts'))).toBe(PROXY_ALIAS_FILE);
    const aliases = ZH_ROUTE_INVENTORY.filter(isAlias);

    expect(aliases.map((route) => route.publicPath).sort()).toEqual(
      [...PAGE_ALIASES.keys()].sort(),
    );
    for (const route of aliases) {
      expect(route.redirectsTo).toBe(pageAliasTarget(route.publicPath));
    }
  });

  it('keeps public route templates synchronized with page locations', () => {
    for (const route of ZH_ROUTE_INVENTORY.filter((entry) => !isAlias(entry))) {
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
