import { notFound } from 'next/navigation';

import { permanentRedirect } from '@/i18n/navigation';

import TokenLayout from '../layout';
import { parseTokenId } from '../tokenId';

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

function respond(status: number, body: unknown = {}) {
  global.fetch = jest.fn(async () => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  })) as unknown as typeof fetch;
}

const originalFetch = global.fetch;

describe('parseTokenId', () => {
  it.each([
    ['0', 0],
    ['25', 25],
    ['000025', 25],
  ])('reads %s as %d', (id, expected) => {
    expect(parseTokenId(id)).toBe(expected);
  });

  it.each(['not-a-token', '-1', '1.5', '', '1e3', '99999999999999999999'])('refuses %p', (id) => {
    expect(parseTokenId(id)).toBeNull();
  });
});

describe('token route layout', () => {
  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  // Every decision lands before the loading boundary streams, so the
  // response carries the real status.
  it('answers a malformed id with not found', async () => {
    respond(200, { TokenInfo: { TokenId: 1 } });
    await expect(render('not-a-token')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('moves a zero-padded id to the one URL a Signature has', async () => {
    respond(200, { TokenInfo: { TokenId: 25 } });
    await expect(render('025', 'zh')).rejects.toThrow('NEXT_REDIRECT');
    expect(permanentRedirect).toHaveBeenCalledWith({ href: '/detail/25', locale: 'zh' });
  });

  // The API answers a token it does not hold with 400 {"error":"record not found"}.
  it.each([400, 404])(
    'answers a token the API does not hold (%d) with not found',
    async (status) => {
      respond(status, { error: 'record not found' });
      await expect(render('999999999')).rejects.toThrow('NEXT_NOT_FOUND');
    },
  );

  it('renders the page for a token the API holds', async () => {
    respond(200, { TokenInfo: { TokenId: 25 } });
    await expect(render('25')).resolves.toBe('page');
    expect(notFound).not.toHaveBeenCalled();
  });

  it('leaves the page to load the record itself when the read fails', async () => {
    respond(502);
    await expect(render('26')).resolves.toBe('page');
    // Other API errors share the 400 status: only "record not found" is a 404.
    respond(400, { error: 'database timeout' });
    await expect(render('28')).resolves.toBe('page');
    global.fetch = jest.fn(async () => ({
      status: 400,
      ok: false,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    })) as unknown as typeof fetch;
    await expect(render('29')).resolves.toBe('page');
    global.fetch = jest.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    await expect(render('27')).resolves.toBe('page');
    expect(notFound).not.toHaveBeenCalled();
  });
});
