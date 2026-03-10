import { createMetadata } from '@/utils/seo';

jest.mock('../index', () => ({
  logoImgUrl: 'https://example.com/logo.png',
}));

describe('createMetadata', () => {
  it('returns title and description at the top level', () => {
    const result = createMetadata('My Title', 'My Description');

    expect(result.title).toBe('My Title');
    expect(result.description).toBe('My Description');
  });

  it('uses default logo image when no imageUrl is provided', () => {
    const result = createMetadata('Title', 'Desc');

    expect(result.openGraph).toEqual(
      expect.objectContaining({ images: ['https://example.com/logo.png'] }),
    );
  });

  it('uses custom image URL when provided', () => {
    const customUrl = 'https://example.com/custom.png';
    const result = createMetadata('Title', 'Desc', customUrl);

    expect(result.openGraph).toEqual(expect.objectContaining({ images: [customUrl] }));
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
});
