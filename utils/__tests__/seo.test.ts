import { createOpenGraphProps } from '../seo';

jest.mock('../index', () => ({
  logoImgUrl: 'https://example.com/logo.png',
}));

describe('createOpenGraphProps', () => {
  it('returns title and description at the top level', () => {
    const result = createOpenGraphProps('My Title', 'My Description');

    expect(result.title).toBe('My Title');
    expect(result.description).toBe('My Description');
  });

  it('uses default logo image when no imageUrl is provided', () => {
    const result = createOpenGraphProps('Title', 'Desc');
    const ogImage = result.openGraphData.find((item) => item.property === 'og:image');

    expect(ogImage?.content).toBe('https://example.com/logo.png');
  });

  it('uses custom image URL when provided', () => {
    const customUrl = 'https://example.com/custom.png';
    const result = createOpenGraphProps('Title', 'Desc', customUrl);
    const ogImage = result.openGraphData.find((item) => item.property === 'og:image');

    expect(ogImage?.content).toBe(customUrl);
  });

  it('includes og:title and og:description', () => {
    const result = createOpenGraphProps('Page Title', 'Page Desc');
    const ogTitle = result.openGraphData.find((item) => item.property === 'og:title');
    const ogDesc = result.openGraphData.find((item) => item.property === 'og:description');

    expect(ogTitle?.content).toBe('Page Title');
    expect(ogDesc?.content).toBe('Page Desc');
  });

  it('includes twitter meta tags', () => {
    const result = createOpenGraphProps('Title', 'Desc', 'https://img.com/pic.png');
    const twitterTitle = result.openGraphData.find((item) => item.name === 'twitter:title');
    const twitterDesc = result.openGraphData.find((item) => item.name === 'twitter:description');
    const twitterImage = result.openGraphData.find((item) => item.name === 'twitter:image');

    expect(twitterTitle?.content).toBe('Title');
    expect(twitterDesc?.content).toBe('Desc');
    expect(twitterImage?.content).toBe('https://img.com/pic.png');
  });

  it('returns exactly 6 openGraphData items', () => {
    const result = createOpenGraphProps('T', 'D');

    expect(result.openGraphData).toHaveLength(6);
  });
});
