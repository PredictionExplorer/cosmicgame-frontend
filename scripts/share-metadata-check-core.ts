/**
 * Post-build guard for link previews (`npm run seo:share-check`).
 *
 * Next.js merges `openGraph` / `twitter` shallowly, so one page that returns
 * its own Open Graph block without an image, a site name, or the X handle
 * silently loses them; no unit test sees the resolved `<head>`. This reads
 * the prerendered HTML in `.next/server/app` instead and reports every
 * indexable page whose preview would be incomplete. Noindex pages (wallet,
 * admin, embeds) are skipped: they are not meant to be shared.
 */

import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Tags every indexable page must carry for a complete preview on X, Discord, Telegram and Slack. */
export const REQUIRED_SHARE_TAGS = [
  'og:title',
  'og:description',
  'og:image',
  'og:image:width',
  'og:image:height',
  'og:image:alt',
  'og:site_name',
  'og:type',
  'og:url',
  'twitter:card',
  'twitter:site',
  'twitter:image',
] as const;

/** Next.js's own error shells render no page metadata. */
const IGNORED_DOCUMENTS = new Set(['_not-found.html', '_global-error.html']);

const META_TAG = /<meta\s+([^>]*?)\/?>/g;
const ATTRIBUTE = /([\w:-]+)="([^"]*)"/g;

/** `property` / `name` → `content` for every `<meta>` in the document head. */
export function metaTags(html: string): Map<string, string> {
  const head = html.split('</head>')[0] ?? html;
  const tags = new Map<string, string>();
  for (const [, attributes = ''] of head.matchAll(META_TAG)) {
    const values = new Map(
      Array.from(attributes.matchAll(ATTRIBUTE), ([, key = '', value = '']) => [key, value]),
    );
    const key = values.get('property') ?? values.get('name');
    const content = values.get('content');
    if (key && content !== undefined && !tags.has(key)) tags.set(key, content);
  }
  return tags;
}

/** Whether the page asks to be indexed (no `noindex` in `robots`). */
export function isIndexable(tags: ReadonlyMap<string, string>): boolean {
  return !/\bnoindex\b/i.test(tags.get('robots') ?? '');
}

/** Problems with one prerendered document's preview metadata (empty when complete). */
export function shareMetadataProblems(html: string): string[] {
  const tags = metaTags(html);
  if (!isIndexable(tags)) return [];
  const problems: string[] = REQUIRED_SHARE_TAGS.filter((tag) => !tags.get(tag)).map(
    (tag) => `missing ${tag}`,
  );
  const image = tags.get('og:image') ?? '';
  if (image && !/^https:\/\//.test(image)) problems.push(`og:image is not absolute: ${image}`);
  if (/\.svg(?:[?#]|$)/i.test(image)) problems.push(`og:image is an SVG: ${image}`);
  if (tags.get('twitter:card') !== 'summary_large_image') {
    problems.push(`twitter:card is ${tags.get('twitter:card') ?? 'unset'}`);
  }
  return problems;
}

/** Every prerendered HTML document under `appDir`, relative paths first-level sorted. */
export function prerenderedDocuments(appDir: string): string[] {
  const walk = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return walk(path);
      return entry.name.endsWith('.html') && !IGNORED_DOCUMENTS.has(entry.name) ? [path] : [];
    });
  return walk(appDir)
    .map((path) => relative(appDir, path))
    .sort();
}
