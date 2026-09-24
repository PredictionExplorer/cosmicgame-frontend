import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import enMeta from '@/messages/en/meta.json';
import zhMeta from '@/messages/zh/meta.json';
import { getLandingContent } from '@/content/landing';

import { routing } from '@/i18n/routing';
import { SITE_NAME, documentTitle } from '@/utils/seo';

const APP_LOCALE_ROOT = join(process.cwd(), 'app', '[locale]');
const INHERITED_OR_NON_DOCUMENT_ROUTES = new Set([
  'app/[locale]/(app)/[...notFound]/page.tsx',
  'app/[locale]/(app)/source-code/page.tsx',
  'app/[locale]/(landing)/landing-site/page.tsx',
]);

/**
 * Routes that are never shared as a link, so they carry no share card: the
 * standalone endurance chart is an iframe embed (noindex, nofollow).
 */
const NON_SHAREABLE_ROUTES = new Set(['app/[locale]/(app)/embed/endurance/[round]/page.tsx']);

function collectPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectPageFiles(path) : entry.name === 'page.tsx' ? [path] : [];
  });
}

const hasShareCard = (directory: string) => existsSync(join(directory, 'opengraph-image.tsx'));

/** The nearest directory from the page up to `app/[locale]` that ships a share card. */
function nearestShareCard(pageFile: string): string | null {
  for (let directory = dirname(pageFile); directory.startsWith(APP_LOCALE_ROOT); ) {
    if (hasShareCard(directory)) return relative(process.cwd(), directory);
    const up = dirname(directory);
    if (up === directory) break;
    directory = up;
  }
  return null;
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

  it('audits all 66 locale pages and all 63 metadata-producing routes', () => {
    expect(pageFiles).toHaveLength(66);
    expect(metadataRoutes).toHaveLength(63);
  });

  it.each(metadataRoutes)('%s reads locale-aware metadata from the meta namespace', (path) => {
    const source = readFileSync(path, 'utf8');
    expect(source).toContain('generateMetadata');
    expect(source).toMatch(/create(?:Page)?Metadata\(/);
    expect(source).toMatch(/getTranslations\((?:\{[\s\S]*?namespace:\s*'meta'[\s\S]*?\}|'meta')\)/);
    expect(source).toMatch(/params:\s*Promise<\{[^}]*locale:\s*string/);
    expect(source).toMatch(/create(?:Page)?Metadata\([\s\S]*?\blocale\b[\s\S]*?\)/);
    expect(source).not.toMatch(/export\s+const\s+metadata\b/);
    expect(source).not.toMatch(/\b(?:title|description)\s*:\s*['"`]/);
  });

  /*
   * Next.js merges `openGraph` shallowly, so a page's metadata decides its
   * own share image:
   *   - a page with a co-located `opengraph-image.tsx` uses `createMetadata`
   *     (copying the parent's image into it would hide the page's own card);
   *   - every other page uses `createPageMetadata(parent, …)`, which carries
   *     the nearest ancestor's card over, and some ancestor must have one.
   * The built HTML is checked the same way by `npm run seo:share-check`.
   */
  it.each(
    metadataRoutes.filter((path) => !NON_SHAREABLE_ROUTES.has(relative(process.cwd(), path))),
  )('%s keeps a share card', (path) => {
    const source = readFileSync(path, 'utf8');
    if (hasShareCard(dirname(path))) {
      expect(source).toContain('createMetadata(');
      expect(source).not.toContain('createPageMetadata(');
    } else {
      expect(source).toMatch(/createPageMetadata\(\s*parent,/);
      expect(source).toMatch(/generateMetadata\([\s\S]*?parent: ResolvingMetadata/);
      expect(source).not.toMatch(/\bcreateMetadata\(/);
      expect(nearestShareCard(path)).not.toBeNull();
    }
  });

  it('keeps complete English and Chinese title/description key parity', () => {
    const enPairs = metadataPairs(enMeta);
    const zhPairs = metadataPairs(zhMeta);
    expect(zhPairs.map(({ key }) => key).sort()).toEqual(enPairs.map(({ key }) => key).sort());
    expect(enPairs.length).toBeGreaterThanOrEqual(60);
  });

  // F313: open tabs read "FAQ: …", "Twisted Mind · …" instead of a column of
  // "Cosmic Signature …". Catalog titles name the page; createMetadata closes
  // the document title with the brand, exactly once.
  it.each(routing.locales)('%s titles lead with the page and name the brand once', (locale) => {
    const catalog = JSON.parse(
      readFileSync(join(process.cwd(), 'messages', locale, 'meta.json'), 'utf8'),
    ) as Record<string, unknown>;
    const titles = metadataPairs(catalog)
      .map(({ key, title }) => ({ key, title }))
      .filter(({ key }) => key !== 'shared');
    expect(titles.length).toBeGreaterThanOrEqual(60);
    for (const { key, title } of titles) {
      expect([key, title]).not.toEqual([
        key,
        expect.stringMatching(/(?:\||·)\s*Cosmic Signature$/),
      ]);
      expect([key, documentTitle(title).split(SITE_NAME).length - 1]).toEqual([key, 1]);
    }
  });

  // F161: a blanket "formally verified" keyword is the claim the hero keeps
  // off its marquee; verification is sourced on /security and /audits.
  it.each(routing.locales)('%s landing keywords make no verification claim', (locale) => {
    const { keywords } = getLandingContent(locale).meta;
    expect(keywords.length).toBeGreaterThan(5);
    for (const keyword of keywords) {
      expect(keyword).not.toMatch(/formal|形式|формальн|정형|hình thức|verif|验证|驗證/i);
    }
  });

  it('gives every Chinese metadata pair localized copy instead of an English fallback', () => {
    for (const { title, description } of metadataPairs(zhMeta)) {
      expect(`${title}${description}`).toMatch(/[\u3400-\u9fff]/);
    }
  });
});
