import { expectedLanguageAlternates } from '@/test-utils/i18n';
import { PARENT_SHARE_IMAGE, documentTitleOf, resolvingMetadata } from '@/test-utils/metadata';

import {
  SITE_NAME,
  TITLE_BRAND_SEPARATOR,
  X_HANDLE,
  createMetadata,
  createPageMetadata,
  documentTitle,
} from '@/utils/seo';

describe('documentTitle', () => {
  it('closes a page title with the brand', () => {
    expect(documentTitle('FAQ')).toBe('FAQ · Cosmic Signature');
    expect(TITLE_BRAND_SEPARATOR).toBe(' · ');
  });

  it('never repeats the brand when the page title already names it', () => {
    expect(documentTitle('Cosmic Signature')).toBe('Cosmic Signature');
    expect(documentTitle('What Is Cosmic Signature?')).toBe('What Is Cosmic Signature?');
    expect(documentTitle('Twisted Mind · Cosmic Signature #25')).toBe(
      'Twisted Mind · Cosmic Signature #25',
    );
  });
});

describe('createMetadata', () => {
  it('leads the document title with the page and keeps og:title brand-free', () => {
    const result = createMetadata('My Title', 'My Description');

    expect(result.title).toEqual({ absolute: 'My Title · Cosmic Signature' });
    expect(documentTitleOf(result)).toBe('My Title · Cosmic Signature');
    expect(result.description).toBe('My Description');
    expect(result.openGraph).toEqual(expect.objectContaining({ title: 'My Title' }));
    expect(result.twitter).toEqual(expect.objectContaining({ title: 'My Title' }));
  });

  // Next.js merges `openGraph` / `twitter` shallowly, so every page must
  // re-emit what the layouts set; otherwise Discord, Telegram and Slack drop
  // the provider line and X the account attribution on every inner page.
  it('always emits og:site_name, og:type and twitter:site', () => {
    const result = createMetadata('Title', 'Desc');

    expect(result.openGraph).toEqual(
      expect.objectContaining({ siteName: SITE_NAME, type: 'website' }),
    );
    expect(result.twitter).toEqual(
      expect.objectContaining({ site: X_HANDLE, card: 'summary_large_image' }),
    );
    expect(SITE_NAME).toBe('Cosmic Signature');
    expect(X_HANDLE).toBe('@CosmicSignature');
  });

  it('marks editorial pages as articles', () => {
    const result = createMetadata('Article', 'Desc', undefined, '/learn/x', { ogType: 'article' });
    expect(result.openGraph).toEqual(expect.objectContaining({ type: 'article' }));
  });

  it('sets og:url to the canonical URL', () => {
    expect(createMetadata('T', 'D', undefined, '/faq').openGraph).toEqual(
      expect.objectContaining({ url: 'https://app.cosmicsignature.com/faq' }),
    );
    expect(
      createMetadata('T', 'D', undefined, '/learn', { canonicalHost: 'landing', locale: 'ja' })
        .openGraph,
    ).toEqual(expect.objectContaining({ url: 'https://cosmicsignature.com/ja/learn' }));
    expect(createMetadata('T', 'D').openGraph).not.toHaveProperty('url');
  });

  // Without `imageUrl` the co-located `opengraph-image.tsx` PNG fills
  // og:image after this object merges; an SVG fallback here is what broke
  // Discord / Slack / X / Facebook / LinkedIn previews before.
  it('omits images when no imageUrl is provided so file-system OG can resolve', () => {
    const result = createMetadata('Title', 'Desc');

    expect((result.openGraph as { images?: unknown }).images).toBeUndefined();
    expect((result.twitter as { images?: unknown }).images).toBeUndefined();
  });

  it('uses a custom image URL when provided', () => {
    const customUrl = 'https://example.com/custom.png';
    const result = createMetadata('Title', 'Desc', customUrl);

    expect(result.openGraph).toEqual(
      expect.objectContaining({
        images: [{ url: customUrl, width: 1200, height: 630, alt: 'Title' }],
      }),
    );
    expect(result.twitter).toEqual({
      card: 'summary_large_image',
      site: '@CosmicSignature',
      title: 'Title',
      description: 'Desc',
      images: [customUrl],
    });
  });

  it('does not include alternates when path is omitted', () => {
    expect(createMetadata('Title', 'Desc').alternates).toBeUndefined();
    expect(createMetadata('T', 'D', undefined, undefined).alternates).toBeUndefined();
  });

  it('includes canonical URLs for static, root and dynamic paths', () => {
    expect(createMetadata('Title', 'Desc', undefined, '/faq').alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/faq',
    });
    expect(createMetadata('Title', 'Desc', undefined, '/').alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/',
    });
    expect(createMetadata('Title', 'Desc', undefined, '/detail/42').alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/detail/42',
    });
  });

  it('normalizes trailing slashes and strips query strings from canonical paths', () => {
    expect(createMetadata('T', 'D', undefined, '/anchoring/').alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/anchoring',
    });
    expect(createMetadata('T', 'D', undefined, '/gallery?page=1&sort=newest').alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/gallery',
    });
  });

  it('can generate a landing-host canonical', () => {
    const result = createMetadata('T', 'D', undefined, '/learn/what-is-cosmic-signature', {
      canonicalHost: 'landing',
    });

    expect(result.alternates).toEqual({
      canonical: 'https://cosmicsignature.com/learn/what-is-cosmic-signature',
    });
  });

  it('emits locale canonicals, hreflang alternates, and Open Graph locale', () => {
    const result = createMetadata('标题', '说明', undefined, '/learn', {
      canonicalHost: 'landing',
      locale: 'zh',
    });

    expect(result.alternates).toEqual({
      canonical: 'https://cosmicsignature.com/zh/learn',
      languages: expectedLanguageAlternates('https://cosmicsignature.com', '/learn'),
    });
    expect(result.openGraph).toEqual(expect.objectContaining({ locale: 'zh_CN' }));
  });

  it('emits Ukrainian canonicals and Open Graph locale', () => {
    const result = createMetadata('Заголовок', 'Опис', undefined, '/gallery', { locale: 'uk' });

    expect(result.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/uk/gallery',
      languages: expectedLanguageAlternates('https://app.cosmicsignature.com', '/gallery'),
    });
    expect(result.openGraph).toEqual(expect.objectContaining({ locale: 'uk_UA' }));
  });

  it('does not share one object between the openGraph and twitter blocks', () => {
    const result = createMetadata('T', 'D');
    expect(result.openGraph).not.toBe(result.twitter);
  });

  it('keeps unicode in titles and descriptions', () => {
    const result = createMetadata(
      'Cycle #42 — Allocations',
      'Every gesture shapes the cycle’s final Signature.',
    );
    expect(documentTitleOf(result)).toBe('Cycle #42 — Allocations · Cosmic Signature');
    expect(result.description).toContain('’');
  });

  it('adds indexable robots directives by default', () => {
    expect(createMetadata('T', 'D', undefined, '/faq').robots).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    });
  });

  it('can mark thin or private pages as noindex,follow', () => {
    expect(createMetadata('T', 'D', undefined, '/my-tokens', { index: false }).robots).toEqual({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    });
  });
});

describe('createPageMetadata', () => {
  it('carries the nearest ancestor share card over the shallow openGraph merge', async () => {
    const result = await createPageMetadata(
      resolvingMetadata(),
      'Security',
      'How the protocol is secured.',
      undefined,
      '/security',
      { locale: 'en' },
    );

    expect(result.openGraph).toEqual(
      expect.objectContaining({
        title: 'Security',
        siteName: 'Cosmic Signature',
        type: 'website',
        url: 'https://app.cosmicsignature.com/security',
        images: [PARENT_SHARE_IMAGE],
      }),
    );
    // twitter:image is filled from og:image by Next.js; the block itself names none.
    expect((result.twitter as { images?: unknown }).images).toBeUndefined();
    expect(result.twitter).toEqual(expect.objectContaining({ site: '@CosmicSignature' }));
    expect(documentTitleOf(result)).toBe('Security · Cosmic Signature');
  });

  it('prefers an explicit image over the parent card', async () => {
    const result = await createPageMetadata(
      resolvingMetadata(),
      'T',
      'D',
      'https://example.com/own.png',
    );
    expect((result.openGraph as { images: Array<{ url: string }> }).images[0]?.url).toBe(
      'https://example.com/own.png',
    );
  });

  it('leaves images unset when no ancestor resolved a card', async () => {
    const result = await createPageMetadata(resolvingMetadata({}), 'T', 'D', undefined, '/x');
    expect((result.openGraph as { images?: unknown }).images).toBeUndefined();
  });
});
