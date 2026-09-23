import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  REQUIRED_SHARE_TAGS,
  isIndexable,
  metaTags,
  prerenderedDocuments,
  shareMetadataProblems,
} from '../share-metadata-check-core';

const IMAGE = 'https://app.cosmicsignature.com/en/opengraph-image-abc/default?1';

function documentWith(tags: Record<string, string>): string {
  const meta = Object.entries(tags)
    .map(([key, content]) =>
      key.startsWith('og:')
        ? `<meta property="${key}" content="${content}"/>`
        : `<meta name="${key}" content="${content}"/>`,
    )
    .join('');
  return `<!DOCTYPE html><html><head><title>T</title>${meta}</head><body><meta name="og:image" content="ignored"/></body></html>`;
}

const COMPLETE = {
  robots: 'index, follow',
  'og:title': 'Security',
  'og:description': 'How the protocol is secured.',
  'og:image': IMAGE,
  'og:image:width': '1200',
  'og:image:height': '630',
  'og:image:alt': 'Cosmic Signature',
  'og:site_name': 'Cosmic Signature',
  'og:type': 'website',
  'og:url': 'https://app.cosmicsignature.com/security',
  'twitter:card': 'summary_large_image',
  'twitter:site': '@CosmicSignature',
  'twitter:image': IMAGE,
};

describe('share metadata check', () => {
  it('reads meta tags from the head only', () => {
    const tags = metaTags(documentWith(COMPLETE));
    expect(tags.get('og:image')).toBe(IMAGE);
    expect(tags.get('twitter:site')).toBe('@CosmicSignature');
    expect(tags.size).toBe(Object.keys(COMPLETE).length);
  });

  it('accepts a complete indexable page', () => {
    expect(shareMetadataProblems(documentWith(COMPLETE))).toEqual([]);
  });

  it('reports every missing preview tag on an indexable page', () => {
    const problems = shareMetadataProblems(documentWith({ robots: 'index, follow' }));
    expect(problems).toEqual(
      expect.arrayContaining(REQUIRED_SHARE_TAGS.map((t) => `missing ${t}`)),
    );
  });

  it('reports the regression this guard exists for: a page that dropped its image and site name', () => {
    const {
      'og:image': _image,
      'twitter:image': _twitter,
      'og:site_name': _site,
      ...rest
    } = COMPLETE;
    expect(shareMetadataProblems(documentWith(rest))).toEqual([
      'missing og:image',
      'missing og:site_name',
      'missing twitter:image',
    ]);
  });

  it('rejects SVG and relative share images', () => {
    expect(
      shareMetadataProblems(documentWith({ ...COMPLETE, 'og:image': '/images/logo.svg' })),
    ).toEqual([
      'og:image is not absolute: /images/logo.svg',
      'og:image is an SVG: /images/logo.svg',
    ]);
  });

  it('skips noindex pages', () => {
    expect(isIndexable(metaTags(documentWith({ robots: 'noindex, follow' })))).toBe(false);
    expect(shareMetadataProblems(documentWith({ robots: 'noindex, follow' }))).toEqual([]);
  });

  it('walks prerendered documents and ignores the error shells', () => {
    const root = mkdtempSync(join(tmpdir(), 'share-check-'));
    try {
      mkdirSync(join(root, 'en', 'learn'), { recursive: true });
      writeFileSync(join(root, 'en', 'faq.html'), '');
      writeFileSync(join(root, 'en', 'learn', 'x.html'), '');
      writeFileSync(join(root, 'en', 'faq.rsc'), '');
      writeFileSync(join(root, '_not-found.html'), '');
      expect(prerenderedDocuments(root)).toEqual(['en/faq.html', 'en/learn/x.html']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
