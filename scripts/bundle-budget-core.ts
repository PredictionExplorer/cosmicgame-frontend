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
 * no wallet stack and its three.js hero is a desktop-only dynamic chunk that
 * this manifest-based measurement intentionally excludes.
 */
export const DEFAULT_LANDING_BUDGET_KB = 320;

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
