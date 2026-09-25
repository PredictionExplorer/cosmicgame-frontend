import { notFound } from 'next/navigation';

import { permanentRedirect } from '@/i18n/navigation';

import TokenLayout from '../layout';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
jest.mock('@/i18n/navigation', () => ({
  permanentRedirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

const render = (id: string, locale = 'en') =>
  TokenLayout({ children: 'page', params: Promise.resolve({ locale, id }) });

const originalFetch = global.fetch;

describe('token route layout', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });
  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('answers a malformed id with not found', async () => {
    await expect(render('not-a-token')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('moves a zero-padded id to the one URL a Signature has', async () => {
    await expect(render('025', 'zh')).rejects.toThrow('NEXT_REDIRECT');
    expect(permanentRedirect).toHaveBeenCalledWith({ href: '/detail/25', locale: 'zh' });
  });

  // Whether the token exists is the page's to say: it renders the Signature's
  // not-found state on the server, where a segment's notFound() would reach the
  // browser as the bare error shell.
  it('renders the page for a canonical id without reading the record', async () => {
    await expect(render('25')).resolves.toBe('page');
    await expect(render('999999999')).resolves.toBe('page');
    expect(notFound).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
