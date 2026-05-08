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

    expect(result.openGraph).toEqual(expect.objectContaining({ images: [customUrl] }));
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
      canonical: 'https://www.cosmicsignature.com/faq',
    });
  });

  it('generates canonical for root path', () => {
    const result = createMetadata('Title', 'Desc', undefined, '/');

    expect(result.alternates).toEqual({
      canonical: 'https://www.cosmicsignature.com/',
    });
  });

  it('generates canonical for dynamic paths', () => {
    const result = createMetadata('Title', 'Desc', 'https://img.com/pic.png', '/detail/42');

    expect(result.alternates).toEqual({
      canonical: 'https://www.cosmicsignature.com/detail/42',
    });
  });

  it('preserves both image and canonical when both are provided', () => {
    const result = createMetadata('T', 'D', 'https://img.com/x.png', '/foo');

    expect((result.openGraph as { images: string[] }).images).toEqual(['https://img.com/x.png']);
    expect((result.twitter as { images: string[] }).images).toEqual(['https://img.com/x.png']);
    expect(result.alternates).toEqual({
      canonical: 'https://www.cosmicsignature.com/foo',
    });
  });

  it('appends paths with trailing slashes verbatim (no normalization surprises)', () => {
    const result = createMetadata('T', 'D', undefined, '/anchoring/');
    expect(result.alternates).toEqual({
      canonical: 'https://www.cosmicsignature.com/anchoring/',
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
    expect((result.openGraph as { images: string[] }).images).toEqual(['']);
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
});
