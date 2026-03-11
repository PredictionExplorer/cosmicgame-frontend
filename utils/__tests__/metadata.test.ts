import axios from 'axios';

import { getMetadata } from '../metadata';
import { reportError } from '../errors';

jest.mock('axios');
jest.mock('../errors', () => ({ reportError: jest.fn() }));
jest.mock('../urls', () => ({
  getProxiedUrl: (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`,
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

  it('passes the URL through getProxiedUrl', async () => {
    mockedAxios.get.mockResolvedValue({ data: '<html></html>' });

    await getMetadata('https://test.com');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `/api/proxy?url=${encodeURIComponent('https://test.com')}`,
    );
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
});
