import axios from 'axios';

import { getMetadata, PageMetadata } from '../metadata';
import { reportError } from '../errors';

jest.mock('axios');
jest.mock('../errors', () => ({ reportError: jest.fn() }));
jest.mock('../urls', () => ({
  getProxiedUrl: (url: string) => url,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedReportError = reportError as jest.MockedFunction<typeof reportError>;

beforeEach(() => {
  jest.clearAllMocks();
});

const fullHtml = `
<html>
<head>
  <title>My Page</title>
  <meta name="description" content="A description">
  <meta name="keywords" content="foo,bar">
  <meta property="og:image" content="https://example.com/img.png">
</head>
<body></body>
</html>`;

describe('getMetadata', () => {
  it('parses title, description, keywords, and image from HTML', async () => {
    mockedAxios.get.mockResolvedValue({ data: fullHtml });

    const result = await getMetadata('https://example.com');

    expect(result).toEqual({
      title: 'My Page',
      description: 'A description',
      keywords: 'foo,bar',
      image: 'https://example.com/img.png',
    });
  });

  it('passes the URL directly to axios (no proxy)', async () => {
    mockedAxios.get.mockResolvedValue({ data: '<html></html>' });

    await getMetadata('https://test.com');

    expect(mockedAxios.get).toHaveBeenCalledWith('https://test.com');
  });

  it('returns empty strings for missing meta tags', async () => {
    mockedAxios.get.mockResolvedValue({ data: '<html><head></head></html>' });

    const result = await getMetadata('https://empty.com');

    expect(result).toEqual({ title: '', description: '', keywords: '', image: '' });
  });

  it('returns empty title when title tag is missing', async () => {
    mockedAxios.get.mockResolvedValue({
      data: '<html><head><meta name="description" content="desc"></head></html>',
    });

    const result = await getMetadata('https://no-title.com');

    expect(result).toEqual({ title: '', description: 'desc', keywords: '', image: '' });
  });

  it('returns null and calls reportError on network failure', async () => {
    const err = new Error('Network Error');
    mockedAxios.get.mockRejectedValue(err);

    const result = await getMetadata('https://fail.com');

    expect(result).toBeNull();
    expect(mockedReportError).toHaveBeenCalledWith(err, 'fetch page metadata');
  });

  it('returns null and calls reportError on non-Error thrown value', async () => {
    mockedAxios.get.mockRejectedValue('string error');

    const result = await getMetadata('https://fail2.com');

    expect(result).toBeNull();
    expect(mockedReportError).toHaveBeenCalledWith('string error', 'fetch page metadata');
  });

  it('returns empty title for empty title tags', async () => {
    mockedAxios.get.mockResolvedValue({
      data: '<html><head><title></title></head></html>',
    });

    const result = await getMetadata('https://empty-title.com');

    expect(result?.title).toBe('');
  });

  it('extracts description using single-quoted attributes', async () => {
    mockedAxios.get.mockResolvedValue({
      data: `<html><head><meta name='description' content='single quoted'></head></html>`,
    });

    const result = await getMetadata('https://single-quote.com');

    expect(result?.description).toBe('single quoted');
  });

  it('does not pick up property="description" (only name="description")', async () => {
    mockedAxios.get.mockResolvedValue({
      data: `<html><head><meta property="description" content="wrong attr"></head></html>`,
    });

    const result = await getMetadata('https://property-desc.com');

    expect(result?.description).toBe('');
  });

  it('result has exactly the four PageMetadata keys', async () => {
    mockedAxios.get.mockResolvedValue({ data: fullHtml });

    const result = await getMetadata('https://example.com');

    expect(Object.keys(result!).sort()).toEqual(['description', 'image', 'keywords', 'title']);
  });

  it('PageMetadata type is assignable from a successful result', async () => {
    mockedAxios.get.mockResolvedValue({ data: fullHtml });

    const result = await getMetadata('https://example.com');
    const typed: PageMetadata = result!;

    expect(typeof typed.title).toBe('string');
    expect(typeof typed.description).toBe('string');
    expect(typeof typed.keywords).toBe('string');
    expect(typeof typed.image).toBe('string');
  });

  it('does not match reversed attribute order (content before name)', async () => {
    mockedAxios.get.mockResolvedValue({
      data: '<html><head><meta content="reversed" name="description"></head></html>',
    });

    const result = await getMetadata('https://reversed.com');

    expect(result?.description).toBe('');
  });

  it('returns empty title when title spans multiple lines', async () => {
    mockedAxios.get.mockResolvedValue({
      data: '<html><head><title>Line1\nLine2</title></head></html>',
    });

    const result = await getMetadata('https://multiline-title.com');

    expect(result?.title).toBe('');
  });

  it('returns only the first og:image when multiple are present', async () => {
    mockedAxios.get.mockResolvedValue({
      data: `<html><head>
        <meta property="og:image" content="https://first.com/a.png">
        <meta property="og:image" content="https://second.com/b.png">
      </head></html>`,
    });

    const result = await getMetadata('https://multi-og.com');

    expect(result?.image).toBe('https://first.com/a.png');
  });

  it('preserves whitespace inside meta content values', async () => {
    mockedAxios.get.mockResolvedValue({
      data: '<html><head><meta name="description" content=" spaced value "></head></html>',
    });

    const result = await getMetadata('https://spaced.com');

    expect(result?.description).toBe(' spaced value ');
  });
});
