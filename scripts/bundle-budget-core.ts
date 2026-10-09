import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Full app-home client payload budget. Next 16's client-reference manifest
 * exposes the shared app shell and route chunks that older checks omitted.
 *
 * Measured baseline after the RES-100 work: ~610 KB gzip (was ~709 KB before
 * the wallet stack moved behind a connect-intent dynamic import). The budget
 * keeps ~30 KB of headroom — enough for ordinary feature work, small enough
 * that re-adding an eager wallet SDK or a chart library fails CI.
 */
export const DEFAULT_BUDGET_KB = 640;

/**
 * Landing-home client payload budget. The landing must stay lean: it ships
 * no wallet stack and no WebGL (its hero atmosphere is static CSS).
 *
 * Measured at ~253 KB gzip once the three.js hero was removed (it was
 * ~289 KB with it). The budget keeps ~17 KB of headroom, so bringing a
 * WebGL scene or a chart library back to the marketing host fails CI.
 */
export const DEFAULT_LANDING_BUDGET_KB = 270;

/**
 * Reading-page client payload budget: the app's legal and trust pages, How
 * It Works and the site map, which read no wallet and draw no chart. Each
 * once shipped ~540 KB gzip, as much as the dApp; measured at ~360 KB once
 * the wallet reads, the command palette, the chain polling and
 * framer-motion's runtime left the shell and the route templates. The budget
 * keeps ~20 KB of headroom, so pulling any of them back into every page
 * fails CI.
 */
export const DEFAULT_READING_BUDGET_KB = 380;

/** The reading pages the reading budget holds, as route-bundle-stats names them. */
export const READING_ROUTES = [
  '/[locale]/terms',
  '/[locale]/privacy',
  '/[locale]/security',
  '/[locale]/audits',
  '/[locale]/code',
  '/[locale]/risk-disclosures',
  '/[locale]/how-it-works',
  '/[locale]/site-map',
] as const;

interface RouteBundleStats {
  route: string;
  /** Chunk paths relative to the project root (`.next/static/chunks/…`). */
  firstLoadChunkPaths: string[];
}

/**
 * A route's first-load JS chunks from the build's own diagnostics
 * (`.next/diagnostics/route-bundle-stats.json`), as absolute paths.
 */
export function getRouteJsFilesFromStats(nextDir: string, route: string): string[] {
  const statsPath = path.join(nextDir, 'diagnostics', 'route-bundle-stats.json');
  if (!existsSync(statsPath)) {
    throw new Error('Could not find route-bundle-stats.json. Run a production build first.');
  }
  const stats = JSON.parse(readFileSync(statsPath, 'utf8')) as RouteBundleStats[];
  const entry = stats.find((candidate) => candidate.route === route);
  if (entry == null) throw new Error(`No bundle stats for ${route}.`);
  const projectRoot = path.dirname(nextDir);
  return entry.firstLoadChunkPaths
    .filter((chunk) => chunk.endsWith('.js'))
    .map((chunk) => path.resolve(projectRoot, chunk));
}

export type BuildManifest = {
  pages?: Record<string, string[]>;
  polyfillFiles?: string[];
  rootMainFiles?: string[];
  pages404?: string[];
  lowPriorityFiles?: string[];
};

type ClientReferenceManifest = {
  entryJSFiles?: Record<string, string[]>;
};

/** Maps a manifest asset path (`/_next/static/...` or `static/...`) to a file under `.next/`. */
export function resolveNextAsset(nextDir: string, asset: string): string {
  const normalized = asset.replace(/^\/_next\//, '').replace(/^\/+/, '');
  return path.join(nextDir, normalized);
}

/** Picks the home-route JS assets from a Next.js build manifest, deduplicated. */
export function pickHomeAssets(manifest: BuildManifest | null): string[] | null {
  const manifestRoute =
    manifest?.pages?.['/'] ??
    manifest?.pages?.['app/page'] ??
    manifest?.pages?.['app/page.js'] ??
    manifest?.pages?.['/_app'] ??
    null;
  if (manifestRoute == null) return null;
  const jsAssets = [...new Set(manifestRoute.filter((asset) => asset.endsWith('.js')))];
  // Turbopack writes a root build-manifest with an EMPTY `/_app` entry;
  // treat that as "not found" so the Turbopack per-route fallback runs.
  return jsAssets.length > 0 ? jsAssets : null;
}

/** Reads the first available Next.js build manifest under `nextDir`, or null. */
export function readManifest(nextDir: string): BuildManifest | null {
  for (const candidate of [
    path.join(nextDir, 'app-build-manifest.json'),
    path.join(nextDir, 'server', 'app-build-manifest.json'),
    path.join(nextDir, 'build-manifest.json'),
  ]) {
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, 'utf8')) as BuildManifest;
    }
  }
  return null;
}

async function listJsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listJsFiles(fullPath);
      return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
    }),
  );
  return files.flat();
}

function readClientReferenceManifest(manifestPath: string): ClientReferenceManifest | null {
  if (!existsSync(manifestPath)) return null;

  const source = readFileSync(manifestPath, 'utf8');
  const assignmentStart = source.indexOf('globalThis.__RSC_MANIFEST[');
  const valueStart = assignmentStart < 0 ? -1 : source.indexOf(' = ', assignmentStart);
  if (valueStart < 0) return null;

  const serialized = source
    .slice(valueStart + 3)
    .trim()
    .replace(/;$/, '');

  try {
    return JSON.parse(serialized) as ClientReferenceManifest;
  } catch {
    return null;
  }
}

function pickRouteEntryAssets(
  manifest: ClientReferenceManifest | null,
  routeKeySuffixes: readonly string[],
): string[] {
  const entries = manifest?.entryJSFiles;
  if (entries == null) return [];

  const routeKey = Object.keys(entries).find((key) =>
    routeKeySuffixes.some((suffix) => key.endsWith(suffix)),
  );
  if (routeKey == null) return [];

  return (entries[routeKey] ?? []).filter((asset) => asset.endsWith('.js'));
}

/**
 * Reads a route's client chunks from a Turbopack production build.
 * Next 16 emits route assets in a client-reference manifest and shared
 * runtime assets in the root build manifest. Older builds used a per-route
 * build manifest, which remains as a compatibility fallback.
 */
export function pickTurbopackRouteAssets(
  nextDir: string,
  clientReferenceManifests: readonly string[],
  routeKeySuffixes: readonly string[],
): string[] | null {
  const rootManifestPath = path.join(nextDir, 'build-manifest.json');
  const rootManifest = existsSync(rootManifestPath)
    ? (JSON.parse(readFileSync(rootManifestPath, 'utf8')) as BuildManifest)
    : null;
  const sharedAssets = (rootManifest?.rootMainFiles ?? []).filter((asset) => asset.endsWith('.js'));

  for (const candidate of clientReferenceManifests) {
    const routeAssets = pickRouteEntryAssets(
      readClientReferenceManifest(path.join(nextDir, candidate)),
      routeKeySuffixes,
    );
    if (routeAssets.length > 0) {
      return [...new Set([...sharedAssets, ...routeAssets])];
    }
  }

  const legacyManifestPath = path.join(nextDir, 'server', 'app', 'page', 'build-manifest.json');
  if (!existsSync(legacyManifestPath)) return null;
  const legacyManifest = JSON.parse(readFileSync(legacyManifestPath, 'utf8')) as BuildManifest;
  const legacyAssets = (legacyManifest.rootMainFiles ?? []).filter((asset) =>
    asset.endsWith('.js'),
  );
  return legacyAssets.length > 0 ? [...new Set(legacyAssets)] : null;
}

/** Resolves the app-home JS chunk files for a build, preferring the manifest. */
export async function getHomeJsFiles(nextDir: string): Promise<string[]> {
  const assets =
    pickHomeAssets(readManifest(nextDir)) ??
    pickTurbopackRouteAssets(
      nextDir,
      [
        path.join('server', 'app', '[locale]', '(app)', 'page_client-reference-manifest.js'),
        path.join('server', 'app', 'page_client-reference-manifest.js'),
      ],
      ['/app/[locale]/(app)/page', '/app/(app)/page', '/app/page'],
    );
  if (assets != null) {
    return assets.map((asset) => resolveNextAsset(nextDir, asset));
  }

  const appChunksDir = path.join(nextDir, 'static', 'chunks', 'app');
  if (existsSync(appChunksDir)) {
    return (await listJsFiles(appChunksDir)).filter((file) => /(?:^|\/)page-[^/]+\.js$/.test(file));
  }

  throw new Error('Could not find Next.js build manifests. Run `yarn build` before this check.');
}

/** Resolves the landing-home JS chunk files for a build. */
export function getLandingJsFiles(nextDir: string): string[] {
  const assets = pickTurbopackRouteAssets(
    nextDir,
    [
      path.join(
        'server',
        'app',
        '[locale]',
        '(landing)',
        'landing-site',
        'page_client-reference-manifest.js',
      ),
    ],
    ['/app/[locale]/(landing)/landing-site/page'],
  );
  if (assets == null) {
    throw new Error(
      'Could not find the landing-site client-reference manifest. Run a build first.',
    );
  }
  return assets.map((asset) => resolveNextAsset(nextDir, asset));
}

/** Sums the gzip-compressed size of the given files, in kilobytes. */
export function computeGzipKb(files: string[]): number {
  const gzipBytes = files.reduce((total, file) => total + gzipSync(readFileSync(file)).length, 0);
  return gzipBytes / 1024;
}

export interface BudgetResult {
  gzipKb: number;
  budgetKb: number;
  fileCount: number;
  withinBudget: boolean;
  summary: string;
}

/** Computes gzip size for the chunks and compares it to the budget. */
export function evaluateBudget(
  files: string[],
  budgetKb: number,
  label = 'App home',
): BudgetResult {
  const existing = files.filter(existsSync);
  if (existing.length === 0) {
    throw new Error('No home-page JavaScript chunks found. Run `yarn build` before this check.');
  }
  const gzipKb = computeGzipKb(existing);
  return {
    gzipKb,
    budgetKb,
    fileCount: existing.length,
    withinBudget: gzipKb <= budgetKb,
    summary:
      `${label} JS gzip: ${gzipKb.toFixed(1)} KB across ${existing.length} chunks ` +
      `(budget ${budgetKb.toFixed(0)} KB)`,
  };
}
