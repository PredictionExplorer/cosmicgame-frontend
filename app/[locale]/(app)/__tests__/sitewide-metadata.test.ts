import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import enMeta from '@/messages/en/meta.json';
import zhMeta from '@/messages/zh/meta.json';

const APP_LOCALE_ROOT = join(process.cwd(), 'app', '[locale]');
const INHERITED_OR_NON_DOCUMENT_ROUTES = new Set([
  'app/[locale]/(app)/[...notFound]/page.tsx',
  'app/[locale]/(app)/source-code/page.tsx',
  'app/[locale]/(landing)/landing-site/page.tsx',
]);

function collectPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectPageFiles(path) : entry.name === 'page.tsx' ? [path] : [];
  });
}

function metadataPairs(
  value: unknown,
  prefix = '',
): Array<{ key: string; title: string; description: string }> {
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  const title =
    typeof record.title === 'string'
      ? record.title
      : typeof record.titleFor === 'string'
        ? record.titleFor
        : null;
  const description =
    typeof record.description === 'string'
      ? record.description
      : typeof record.descriptionFor === 'string'
        ? record.descriptionFor
        : null;
  const own = title && description ? [{ key: prefix, title, description }] : [];
  return [
    ...own,
    ...Object.entries(record).flatMap(([key, child]) =>
      metadataPairs(child, prefix ? `${prefix}.${key}` : key),
    ),
  ];
}

describe('site-wide localized page metadata', () => {
  const pageFiles = collectPageFiles(APP_LOCALE_ROOT);
  const metadataRoutes = pageFiles.filter((path) => {
    const repoPath = relative(process.cwd(), path);
    return !INHERITED_OR_NON_DOCUMENT_ROUTES.has(repoPath);
  });

  it('audits all 65 locale pages and all 62 metadata-producing routes', () => {
    expect(pageFiles).toHaveLength(65);
    expect(metadataRoutes).toHaveLength(62);
  });

  it.each(metadataRoutes)('%s reads locale-aware metadata from the meta namespace', (path) => {
    const source = readFileSync(path, 'utf8');
    expect(source).toContain('generateMetadata');
    expect(source).toContain('createMetadata');
    expect(source).toMatch(/getTranslations\((?:\{[\s\S]*?namespace:\s*'meta'[\s\S]*?\}|'meta')\)/);
    expect(source).toMatch(/params:\s*Promise<\{[^}]*locale:\s*string/);
    expect(source).toMatch(/createMetadata\([\s\S]*?\blocale\b[\s\S]*?\)/);
    expect(source).not.toMatch(/export\s+const\s+metadata\b/);
    expect(source).not.toMatch(/\b(?:title|description)\s*:\s*['"`]/);
  });

  it('keeps complete English and Chinese title/description key parity', () => {
    const enPairs = metadataPairs(enMeta);
    const zhPairs = metadataPairs(zhMeta);
    expect(zhPairs.map(({ key }) => key).sort()).toEqual(enPairs.map(({ key }) => key).sort());
    expect(enPairs.length).toBeGreaterThanOrEqual(60);
  });

  it('gives every Chinese metadata pair localized copy instead of an English fallback', () => {
    for (const { title, description } of metadataPairs(zhMeta)) {
      expect(`${title}${description}`).toMatch(/[\u3400-\u9fff]/);
    }
  });
});
