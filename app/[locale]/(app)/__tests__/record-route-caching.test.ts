import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { CACHE_WINDOW } from '@/lib/cacheWindow';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'app');
const APP_GROUP = path.join(APP_DIR, '[locale]', '(app)');

/**
 * The public record pages: one page per record, address or cycle, drawn from
 * the API. Each is a cached render (on-demand ISR), so a visit is a CDN hit
 * rather than a serverless render with API reads.
 */
const RECORD_ROUTES = [
  'allocation/[id]',
  'anchor-action/[IsRwalk]/[actionId]',
  'cosmic-signature-transfer/[address]',
  'cosmic-token-transfer/[address]',
  'detail/[id]',
  'distributions-by-token/[address]/[tokenId]',
  'eth-contribution/detail/[id]',
  'eth-contribution/round/[round]',
  'gesture/[id]',
  'marketing/[address]',
  'system-event/[round]/[start]/[end]',
  'user/[address]',
  'user/stellar-selection-eth/[address]',
  'user/stellar-selection-nft/[address]',
];

/**
 * Record routes still rendered on every request: each answers a record that
 * does not exist with its segment's `notFound()`, whose boundary reads the
 * request locale, which a cached render cannot.
 */
const RENDERED_PER_REQUEST = ['detail/[id]', 'eth-contribution/detail/[id]'];
const CACHED_RECORD_ROUTES = RECORD_ROUTES.filter((route) => !RENDERED_PER_REQUEST.includes(route));

/** Every page.tsx under `dir`. */
function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return pages(full);
    return entry === 'page.tsx' ? [full] : [];
  });
}

/** A page rendered on demand for the cache: params it does not know at build time, and ISR. */
const isOnDemandIsr = (source: string) =>
  /export function generateStaticParams\(\)\s*{\s*return \[\];?\s*}/.test(source) &&
  /export const revalidate\s*=/.test(source);

/** The literal a page exports as its `revalidate`, or null. */
function revalidateOf(source: string): number | null {
  const match = /export const revalidate\s*=\s*([\d_]+);/.exec(source);
  return match ? Number(match[1]!.replaceAll('_', '')) : null;
}

/** The loading boundaries that wrap a page: its own segment's and every parent segment's. */
function loadingBoundaries(page: string): string[] {
  const out: string[] = [];
  for (let dir = path.dirname(page); dir.startsWith(APP_DIR); dir = path.dirname(dir)) {
    const loading = path.join(dir, 'loading.tsx');
    if (existsSync(loading)) out.push(loading);
    if (dir === APP_DIR) break;
  }
  return out;
}

/** The repository file a local import names, or null for a package. */
function resolveImport(from: string, specifier: string): string | null {
  let base: string;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(from), specifier);
  else return null;
  for (const suffix of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
    const file = base + suffix;
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

/** The value imports of a module (`import type` erases at build time and runs nothing). */
function valueImports(source: string): { names: string; specifier: string }[] {
  const statements = source.matchAll(
    /^\s*(?:import|export)\s+(?!type\s)([^'";]*?)\s*from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm,
  );
  return [...statements].map((match) => ({
    names: match[1] ?? '',
    specifier: match[2] ?? match[3]!,
  }));
}

const CLIENT_MODULE = /^(?:\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/))*\s*['"]use client['"]/;

/**
 * Whether a module reads next-intl's request locale when it renders on the
 * server, itself or through the server modules it imports: next-intl's
 * server API, or its hooks called outside a client module. A client module
 * reads the locale of the provider above it, never the request, so the
 * walk stops there. Returns the import chain that does, or null.
 */
function readsRequestLocale(file: string, seen = new Set<string>()): string[] | null {
  if (seen.has(file)) return null;
  seen.add(file);
  const source = readFileSync(file, 'utf8');
  if (CLIENT_MODULE.test(source)) return null;
  for (const { names, specifier } of valueImports(source)) {
    if (specifier === 'next-intl/server') return [file];
    if (specifier === 'next-intl' && /\buse[A-Z]\w*/.test(names)) return [file];
    const local = resolveImport(file, specifier);
    const chain = local ? readsRequestLocale(local, seen) : null;
    if (chain) return [file, ...chain];
  }
  return null;
}

const relative = (file: string) => path.relative(ROOT, file);

describe('record routes', () => {
  it('lists every page of the app that takes a parameter', () => {
    const parameterPages = pages(APP_GROUP)
      .map((page) => path.relative(APP_GROUP, path.dirname(page)))
      .filter((route) => route.includes('['));
    expect(parameterPages.sort()).toEqual([...RECORD_ROUTES].sort());
  });

  it.each(CACHED_RECORD_ROUTES)('%s is rendered on demand for the cache', (route) => {
    const source = readFileSync(path.join(APP_GROUP, route, 'page.tsx'), 'utf8');
    expect(isOnDemandIsr(source)).toBe(true);
  });

  // A route exports the longest window its records can take; a render lowers it
  // (`capCacheWindow`) for what will change.
  it.each(RECORD_ROUTES)('%s keeps its render for one of the cache windows', (route) => {
    const source = readFileSync(path.join(APP_GROUP, route, 'page.tsx'), 'utf8');
    expect(Object.values(CACHE_WINDOW)).toContain(revalidateOf(source));
  });
});

describe('on-demand ISR routes', () => {
  // Regression: /user/[address] opted into ISR while its loading.tsx translated its copy. A
  // loading boundary gets no params, so next-intl read the locale from the request headers,
  // which a cached render cannot do: every profile answered 500 (DYNAMIC_SERVER_USAGE). The
  // statistics boundary did the same through the skeletons it drew, which is why the walk
  // follows the boundary's imports.
  const routes = pages(APP_DIR).filter((page) => isOnDemandIsr(readFileSync(page, 'utf8')));

  it('finds the cached record routes among them', () => {
    expect(routes.map((page) => path.relative(APP_GROUP, path.dirname(page)))).toEqual(
      expect.arrayContaining(CACHED_RECORD_ROUTES),
    );
  });

  it.each(routes.map((page) => [relative(page), page]))(
    '%s has no loading boundary that reads the request locale',
    (_name, page) => {
      for (const loading of loadingBoundaries(page)) {
        expect({
          loading: relative(loading),
          chain: readsRequestLocale(loading)?.map(relative) ?? null,
          importsNextIntl: /from 'next-intl/.test(readFileSync(loading, 'utf8')),
        }).toEqual({ loading: relative(loading), chain: null, importsNextIntl: false });
      }
    },
  );

  // The walk the check above relies on.
  it('sees a translated skeleton behind a module that draws it', () => {
    const chain = (file: string) => readsRequestLocale(path.join(ROOT, file))?.map(relative);
    expect(chain('components/nft/NFTDetailSkeleton.tsx')).toEqual([
      'components/nft/NFTDetailSkeleton.tsx',
    ]);
    // Two steps away: the chart skeleton draws the shared skeletons, which translate.
    expect(chain('components/statistics/charts/ChartFigureSkeleton.tsx')).toEqual([
      'components/statistics/charts/ChartFigureSkeleton.tsx',
      'components/ui/skeleton.tsx',
    ]);
    // The page shell reads nothing of the locale, so a boundary may draw it.
    expect(chain('components/ui/page-shell.tsx')).toBeUndefined();
  });
});
