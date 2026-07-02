import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

export const DEFAULT_BUDGET_KB = 600;

export type BuildManifest = {
  pages?: Record<string, string[]>;
  polyfillFiles?: string[];
  rootMainFiles?: string[];
  pages404?: string[];
  lowPriorityFiles?: string[];
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

/**
 * Reads the home route's client entry chunks from a Turbopack production
 * build, which writes per-route manifests under `server/app/page/` instead
 * of a root `app-build-manifest.json`.
 */
export function pickTurbopackHomeAssets(nextDir: string): string[] | null {
  const manifestPath = path.join(nextDir, 'server', 'app', 'page', 'build-manifest.json');
  if (!existsSync(manifestPath)) return null;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as BuildManifest;
  const rootMain = (manifest.rootMainFiles ?? []).filter((asset) => asset.endsWith('.js'));
  return rootMain.length > 0 ? [...new Set(rootMain)] : null;
}

/** Resolves the home-route JS chunk files for a build, preferring the manifest. */
export async function getHomeJsFiles(nextDir: string): Promise<string[]> {
  const assets = pickHomeAssets(readManifest(nextDir)) ?? pickTurbopackHomeAssets(nextDir);
  if (assets != null) {
    return assets.map((asset) => resolveNextAsset(nextDir, asset));
  }

  const appChunksDir = path.join(nextDir, 'static', 'chunks', 'app');
  if (existsSync(appChunksDir)) {
    return (await listJsFiles(appChunksDir)).filter((file) => /(?:^|\/)page-[^/]+\.js$/.test(file));
  }

  throw new Error('Could not find Next.js build manifests. Run `yarn build` before this check.');
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
export function evaluateBudget(files: string[], budgetKb: number): BudgetResult {
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
      `App home JS gzip: ${gzipKb.toFixed(1)} KB across ${existing.length} chunks ` +
      `(budget ${budgetKb.toFixed(0)} KB)`,
  };
}
