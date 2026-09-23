import { documentTitleOf } from '@/test-utils/metadata';

import { generateMetadata } from '../page';

jest.mock('../DetailPage', () => ({ __esModule: true, default: () => null }));

const props = (id: string, locale = 'en') => ({ params: Promise.resolve({ locale, id }) });

function respondWithToken(token: Record<string, unknown> | null, status = 200) {
  global.fetch = jest.fn(async () => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => ({ TokenInfo: token }),
  })) as unknown as typeof fetch;
}

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

describe('token page metadata', () => {
  // F226/F313: the tab and the share read the piece's name, the brand once.
  it('leads with the token’s name when it has one', async () => {
    respondWithToken({ TokenId: 25, TokenName: ' Twisted Mind ', Seed: 'ab' });
    const metadata = await generateMetadata(props('25'));
    expect(documentTitleOf(metadata)).toBe('Twisted Mind · Cosmic Signature #25');
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({ title: 'Twisted Mind · Cosmic Signature #25' }),
    );
  });

  it('names an unnamed token by its number, without repeating the brand', async () => {
    respondWithToken({ TokenId: 24, TokenName: '', Seed: 'ab' });
    const metadata = await generateMetadata(props('24'));
    expect(documentTitleOf(metadata)).toBe('Cosmic Signature #24');
    expect(metadata.description).toMatch(/seeded on Arbitrum/);
    expect(metadata.description).not.toMatch(/rendered spectrally on Arbitrum/);
  });

  // The co-located opengraph-image.tsx is the share image; the page never
  // points og:image at the multi-megabyte source render.
  it('leaves og:image to the artwork card', async () => {
    respondWithToken({ TokenId: 24, Seed: 'ab' });
    const metadata = await generateMetadata(props('24', 'ja'));
    expect((metadata.openGraph as { images?: unknown }).images).toBeUndefined();
    expect((metadata.twitter as { images?: unknown }).images).toBeUndefined();
  });
});
