import { createMetadata } from '@/utils/seo';

describe('createMetadata', () => {
  it('returns title and description at the top level', () => {
    const result = createMetadata('My Title', 'My Description');

    expect(result.title).toBe('My Title');
    expect(result.description).toBe('My Description');
  });

  // When no `imageUrl` is provided we intentionally omit `images` from
  // both OG and Twitter blocks so Next.js can resolve the file-system
  // `opengraph-image.tsx` PNG. Setting an SVG fallback here is what
  // broke Discord / Slack / X / Facebook / LinkedIn previews previously.
  it('omits images when no imageUrl is provided so file-system OG can resolve', () => {
    const result = createMetadata('Title', 'Desc');

    expect(result.openGraph).toBeDefined();
    expect((result.openGraph as { images?: unknown }).images).toBeUndefined();
    expect((result.twitter as { images?: unknown }).images).toBeUndefined();
  });

  it('uses custom image URL when provided', () => {
    const customUrl = 'https://example.com/custom.png';
    const result = createMetadata('Title', 'Desc', customUrl);

    expect(result.openGraph).toEqual(
      expect.objectContaining({
        images: [{ url: customUrl, width: 1200, height: 630, alt: 'Title' }],
      }),
    );
    expect(result.twitter).toEqual(expect.objectContaining({ images: [customUrl] }));
  });

  it('includes openGraph title and description', () => {
    const result = createMetadata('Page Title', 'Page Desc');

    expect(result.openGraph).toEqual(
      expect.objectContaining({ title: 'Page Title', description: 'Page Desc' }),
    );
  });

  it('includes twitter meta with summary_large_image card', () => {
    const result = createMetadata('Title', 'Desc', 'https://img.com/pic.png');

    expect(result.twitter).toEqual({
      card: 'summary_large_image',
      title: 'Title',
      description: 'Desc',
      images: ['https://img.com/pic.png'],
    });
  });

  it('twitter card defaults to summary_large_image even without an image', () => {
    const result = createMetadata('Title', 'Desc');

    expect(result.twitter).toEqual(
      expect.objectContaining({ card: 'summary_large_image', title: 'Title' }),
    );
  });

  it('does not include alternates when path is omitted', () => {
    const result = createMetadata('Title', 'Desc');

    expect(result.alternates).toBeUndefined();
  });

  it('includes canonical URL when path is provided', () => {
    const result = createMetadata('Title', 'Desc', undefined, '/faq');

    expect(result.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/faq',
    });
  });

  it('generates canonical for root path', () => {
    const result = createMetadata('Title', 'Desc', undefined, '/');

    expect(result.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/',
    });
  });

  it('generates canonical for dynamic paths', () => {
    const result = createMetadata('Title', 'Desc', 'https://img.com/pic.png', '/detail/42');

    expect(result.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/detail/42',
    });
  });

  it('preserves both image and canonical when both are provided', () => {
    const result = createMetadata('T', 'D', 'https://img.com/x.png', '/foo');

    expect((result.openGraph as { images: unknown[] }).images).toEqual([
      { url: 'https://img.com/x.png', width: 1200, height: 630, alt: 'T' },
    ]);
    expect((result.twitter as { images: string[] }).images).toEqual(['https://img.com/x.png']);
    expect(result.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/foo',
    });
  });

  it('normalizes non-root trailing slashes in canonical paths', () => {
    const result = createMetadata('T', 'D', undefined, '/anchoring/');
    expect(result.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/anchoring',
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

  it('strips query strings from canonical paths', () => {
    const result = createMetadata('T', 'D', undefined, '/gallery?page=1&sort=newest');

    expect(result.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/gallery',
    });
  });

  it('echoes title and description into both openGraph and twitter blocks', () => {
    const result = createMetadata('Page Title', 'Page Description');

    expect(result.openGraph).toEqual(
      expect.objectContaining({ title: 'Page Title', description: 'Page Description' }),
    );
    expect(result.twitter).toEqual(
      expect.objectContaining({ title: 'Page Title', description: 'Page Description' }),
    );
  });

  it('does not leak the openGraph object into the twitter object (no shared reference)', () => {
    const result = createMetadata('T', 'D');
    expect(result.openGraph).not.toBe(result.twitter);
  });

  // The intent of the imageless contract: route-level
  // `opengraph-image.tsx` PNGs must not be overridden by a parent layout
  // metadata that defaults `images`. This test pins that contract so a
  // future "let's add a logo fallback" PR cannot reintroduce the bug.
  it('omits images even when an empty-string imageUrl is somehow passed', () => {
    const result = createMetadata('T', 'D', '');

    // Empty string is `!== undefined`, so the contract is "use it" — but
    // an empty src is meaningless to crawlers. We document the existing
    // behavior here so any change is intentional.
    expect((result.openGraph as { images: unknown[] }).images).toEqual([
      { url: '', width: 1200, height: 630, alt: 'T' },
    ]);
  });

  it('handles unicode characters in title and description', () => {
    const result = createMetadata(
      'Cosmic Signature \u2014 Cycle #42',
      'Every gesture shapes the cycle\u2019s final Signature.',
    );
    expect(result.title).toContain('\u2014');
    expect(result.description).toContain('\u2019');
    expect((result.openGraph as { title: string }).title).toContain('\u2014');
  });

  it('omits canonical when path is explicitly undefined', () => {
    const result = createMetadata('T', 'D', undefined, undefined);
    expect(result.alternates).toBeUndefined();
  });

  it('adds indexable robots directives by default', () => {
    const result = createMetadata('T', 'D', undefined, '/faq');

    expect(result.robots).toEqual({
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
    const result = createMetadata('T', 'D', undefined, '/my-tokens', { index: false });

    expect(result.robots).toEqual({
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    });
  });
});
