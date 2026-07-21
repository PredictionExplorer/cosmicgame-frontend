import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  DEFAULT_BUDGET_KB,
  computeGzipKb,
  evaluateBudget,
  getHomeJsFiles,
  pickHomeAssets,
  pickTurbopackHomeAssets,
  readManifest,
  resolveNextAsset,
} from '../bundle-budget-core';

describe('bundle budget core', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), 'bundle-budget-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('resolveNextAsset', () => {
    it('maps /_next/ asset URLs into the build directory', () => {
      expect(resolveNextAsset('/repo/.next', '/_next/static/chunks/main.js')).toBe(
        path.join('/repo/.next', 'static/chunks/main.js'),
      );
    });

    it('maps bare static paths into the build directory', () => {
      expect(resolveNextAsset('/repo/.next', 'static/chunks/page.js')).toBe(
        path.join('/repo/.next', 'static/chunks/page.js'),
      );
    });
  });

  describe('pickHomeAssets', () => {
    it('returns null when no manifest or home route exists', () => {
      expect(pickHomeAssets(null)).toBeNull();
      expect(pickHomeAssets({ pages: { '/other': ['a.js'] } })).toBeNull();
    });

    it('picks the app-router home route, JS only, deduplicated', () => {
      const assets = pickHomeAssets({
        pages: {
          'app/page': ['static/a.js', 'static/a.js', 'static/styles.css', 'static/b.js'],
        },
      });

      expect(assets).toEqual(['static/a.js', 'static/b.js']);
    });

    it('falls back across known home route keys', () => {
      expect(pickHomeAssets({ pages: { '/': ['static/root.js'] } })).toEqual(['static/root.js']);
      expect(pickHomeAssets({ pages: { '/_app': ['static/legacy.js'] } })).toEqual([
        'static/legacy.js',
      ]);
    });

    it('treats an empty route entry as not found (Turbopack root manifest)', () => {
      expect(pickHomeAssets({ pages: { '/_app': [] } })).toBeNull();
    });
  });

  describe('pickTurbopackHomeAssets', () => {
    it('returns null when the per-route manifest does not exist', () => {
      expect(pickTurbopackHomeAssets(tempDir)).toBeNull();
    });

    it('combines Next 16 shared and app-home client chunks', () => {
      writeFileSync(
        path.join(tempDir, 'build-manifest.json'),
        JSON.stringify({
          pages: { '/_app': [] },
          rootMainFiles: ['static/chunks/runtime.js', 'static/chunks/shared.js'],
        }),
      );
      const routeDir = path.join(tempDir, 'server', 'app', '[locale]', '(app)');
      mkdirSync(routeDir, { recursive: true });
      writeFileSync(
        path.join(routeDir, 'page_client-reference-manifest.js'),
        [
          'globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};',
          `globalThis.__RSC_MANIFEST["/[locale]/(app)/page"] = ${JSON.stringify({
            entryJSFiles: {
              '[project]/app/[locale]/(app)/layout': ['static/chunks/shared.js'],
              '[project]/app/[locale]/(app)/page': [
                'static/chunks/shared.js',
                'static/chunks/home.js',
                'static/chunks/home.css',
              ],
            },
          })};`,
        ].join('\n'),
      );

      expect(pickTurbopackHomeAssets(tempDir)).toEqual([
        'static/chunks/runtime.js',
        'static/chunks/shared.js',
        'static/chunks/home.js',
      ]);
    });

    it('reads rootMainFiles from the per-route build manifest', () => {
      const routeDir = path.join(tempDir, 'server', 'app', 'page');
      mkdirSync(routeDir, { recursive: true });
      writeFileSync(
        path.join(routeDir, 'build-manifest.json'),
        JSON.stringify({
          rootMainFiles: ['static/chunks/main-1.js', 'static/chunks/main-1.js', 'static/x.css'],
        }),
      );

      expect(pickTurbopackHomeAssets(tempDir)).toEqual(['static/chunks/main-1.js']);
    });
  });

  describe('readManifest', () => {
    it('returns null when no manifest file exists', () => {
      expect(readManifest(tempDir)).toBeNull();
    });

    it('reads the app build manifest when present', () => {
      writeFileSync(
        path.join(tempDir, 'app-build-manifest.json'),
        JSON.stringify({ pages: { 'app/page': ['static/x.js'] } }),
      );

      expect(readManifest(tempDir)).toEqual({ pages: { 'app/page': ['static/x.js'] } });
    });
  });

  describe('getHomeJsFiles', () => {
    it('throws a helpful error when there is no build output', async () => {
      await expect(getHomeJsFiles(tempDir)).rejects.toThrow(/Run `yarn build`/);
    });

    it('resolves manifest assets to absolute chunk paths', async () => {
      writeFileSync(
        path.join(tempDir, 'app-build-manifest.json'),
        JSON.stringify({ pages: { 'app/page': ['static/chunks/home.js'] } }),
      );

      await expect(getHomeJsFiles(tempDir)).resolves.toEqual([
        path.join(tempDir, 'static/chunks/home.js'),
      ]);
    });

    it('falls back to the Turbopack per-route manifest when the root manifest is empty', async () => {
      writeFileSync(
        path.join(tempDir, 'build-manifest.json'),
        JSON.stringify({ pages: { '/_app': [] } }),
      );
      const routeDir = path.join(tempDir, 'server', 'app', 'page');
      mkdirSync(routeDir, { recursive: true });
      writeFileSync(
        path.join(routeDir, 'build-manifest.json'),
        JSON.stringify({ rootMainFiles: ['static/chunks/main-1.js'] }),
      );

      await expect(getHomeJsFiles(tempDir)).resolves.toEqual([
        path.join(tempDir, 'static/chunks/main-1.js'),
      ]);
    });
  });

  describe('evaluateBudget', () => {
    it('computes gzip size and passes when within budget', () => {
      const chunk = path.join(tempDir, 'home.js');
      writeFileSync(chunk, 'console.log("cosmic signature");'.repeat(50));

      const result = evaluateBudget([chunk], DEFAULT_BUDGET_KB);

      expect(result.withinBudget).toBe(true);
      expect(result.fileCount).toBe(1);
      expect(result.gzipKb).toBeGreaterThan(0);
      expect(result.gzipKb).toBeCloseTo(computeGzipKb([chunk]), 5);
      expect(result.summary).toMatch(/App home JS gzip: .* \(budget 750 KB\)/);
    });

    it('fails when the gzip size exceeds the budget', () => {
      const chunk = path.join(tempDir, 'huge.js');
      // Random-ish payload compresses poorly enough to exceed a 1 KB budget.
      writeFileSync(
        chunk,
        Array.from({ length: 4096 }, (_, i) => String((i * 2654435761) % 997)).join(','),
      );

      const result = evaluateBudget([chunk], 1);

      expect(result.withinBudget).toBe(false);
      expect(result.budgetKb).toBe(1);
    });

    it('ignores missing files and throws when none exist', () => {
      const real = path.join(tempDir, 'real.js');
      writeFileSync(real, 'export {}');

      const result = evaluateBudget([real, path.join(tempDir, 'missing.js')], 10);
      expect(result.fileCount).toBe(1);

      expect(() => evaluateBudget([path.join(tempDir, 'missing.js')], 10)).toThrow(
        /Run `yarn build`/,
      );
    });
  });

  it('keeps the full app-home budget at 750 KB gzip', () => {
    expect(DEFAULT_BUDGET_KB).toBe(750);
  });

  describe('directory fallback', () => {
    it('finds page chunks under static/chunks/app when no manifest exists', async () => {
      const appDir = path.join(tempDir, 'static', 'chunks', 'app');
      mkdirSync(appDir, { recursive: true });
      writeFileSync(path.join(appDir, 'page-abc123.js'), 'export {}');
      writeFileSync(path.join(appDir, 'layout-zzz.js'), 'export {}');

      const files = await getHomeJsFiles(tempDir);

      expect(files).toEqual([path.join(appDir, 'page-abc123.js')]);
    });
  });
});
