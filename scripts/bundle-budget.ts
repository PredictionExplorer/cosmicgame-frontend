import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const repoRoot = process.cwd();
const nextDir = path.join(repoRoot, '.next');
const defaultBudgetKb = 600;
const budgetKb = Number(process.env.APP_HOME_JS_GZIP_BUDGET_KB ?? defaultBudgetKb);

type Manifest = {
  pages?: Record<string, string[]>;
  polyfillFiles?: string[];
  rootMainFiles?: string[];
  pages404?: string[];
  lowPriorityFiles?: string[];
};

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

function resolveNextAsset(asset: string): string {
  const normalized = asset.replace(/^\/_next\//, '').replace(/^\/+/, '');
  return path.join(nextDir, normalized);
}

function readManifest(): Manifest | null {
  for (const candidate of [
    path.join(nextDir, 'app-build-manifest.json'),
    path.join(nextDir, 'server', 'app-build-manifest.json'),
    path.join(nextDir, 'build-manifest.json'),
  ]) {
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, 'utf8')) as Manifest;
    }
  }
  return null;
}

async function getHomeJsFiles(): Promise<string[]> {
  const manifest = readManifest();
  const manifestRoute =
    manifest?.pages?.['/'] ??
    manifest?.pages?.['app/page'] ??
    manifest?.pages?.['app/page.js'] ??
    manifest?.pages?.['/_app'] ??
    null;

  if (manifestRoute != null) {
    return [
      ...new Set(manifestRoute.filter((asset) => asset.endsWith('.js')).map(resolveNextAsset)),
    ];
  }

  const appChunksDir = path.join(nextDir, 'static', 'chunks', 'app');
  if (existsSync(appChunksDir)) {
    return (await listJsFiles(appChunksDir)).filter((file) => /(?:^|\/)page-[^/]+\.js$/.test(file));
  }

  throw new Error('Could not find Next.js build manifests. Run `yarn build` before this check.');
}

const jsFiles = (await getHomeJsFiles()).filter(existsSync);
if (jsFiles.length === 0) {
  throw new Error('No home-page JavaScript chunks found. Run `yarn build` before this check.');
}

const gzipBytes = jsFiles.reduce((total, file) => total + gzipSync(readFileSync(file)).length, 0);
const gzipKb = gzipBytes / 1024;

console.warn(
  `App home JS gzip: ${gzipKb.toFixed(1)} KB across ${jsFiles.length} chunks ` +
    `(budget ${budgetKb.toFixed(0)} KB)`,
);

if (gzipKb > budgetKb) {
  process.exitCode = 1;
}
