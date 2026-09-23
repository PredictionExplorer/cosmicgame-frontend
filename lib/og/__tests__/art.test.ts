/**
 * @jest-environment node
 */
// lexicon-allow-start: fixtures mirror the Go server's wire fields and URL paths
import {
  OG_DATA_REVALIDATE_SECONDS,
  OG_FETCH_TIMEOUT_MS,
  artworkUrl,
  loadCycleArtwork,
  loadGesture,
  loadLatestArtworks,
  loadParticipantArtworks,
  loadTokenArtwork,
} from '@/lib/og/art';
import { loadScaledArtwork } from '@/lib/og/fetchImage';

jest.mock('@/lib/og/fetchImage', () => ({
  loadScaledArtwork: jest.fn(async () => Buffer.from('png')),
  pngDataUri: (bytes: Uint8Array) =>
    `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`,
}));

const SEED = 'ab'.repeat(32);

/** Answers API reads by path (the part after the configured API base) with JSON bodies. */
function serve(routes: Record<string, unknown>) {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const path = Object.keys(routes).find((key) => url.endsWith(`/${key}`));
    const body = path === undefined ? undefined : routes[path];
    return {
      ok: body !== undefined,
      status: body !== undefined ? 200 : 404,
      json: async () => body,
    };
  }) as unknown as typeof fetch;
}

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('share-card artwork', () => {
  it('reads a token’s name, cycle and render, scaled to the plate', async () => {
    serve({
      'cst/info/25': {
        TokenInfo: { TokenId: 25, TokenName: ' Twisted Mind ', RoundNum: 1, Seed: SEED },
      },
    });
    await expect(loadTokenArtwork(25)).resolves.toEqual({
      tokenId: 25,
      name: 'Twisted Mind',
      cycle: 1,
      src: `data:image/png;base64,${Buffer.from('png').toString('base64')}`,
    });
    expect(loadScaledArtwork).toHaveBeenCalledWith(artworkUrl(SEED), 680);
    expect(artworkUrl(SEED)).toMatch(new RegExp(`/images/new/cosmicsignature/0x${SEED}\\.png$`));
  });

  it('gives up on unknown tokens, malformed seeds and missing renders', async () => {
    serve({ 'cst/info/2': { TokenInfo: { TokenId: 2, Seed: 'not-a-seed' } } });
    await expect(loadTokenArtwork(1)).resolves.toBeNull();
    await expect(loadTokenArtwork(2)).resolves.toBeNull();
    serve({ 'cst/info/3': { TokenInfo: { TokenId: 3, Seed: `0x${SEED}` } } });
    (loadScaledArtwork as jest.Mock).mockResolvedValueOnce(null);
    await expect(loadTokenArtwork(3)).resolves.toBeNull();
  });

  it('lists the newest imprints newest first', async () => {
    serve({
      'statistics/dashboard': { MainStats: { NumCSTokenMints: 48 } },
      'cst/info/47': { TokenInfo: { TokenId: 47, Seed: SEED } },
      'cst/info/46': { TokenInfo: { TokenId: 46, Seed: SEED } },
    });
    const artworks = await loadLatestArtworks(3);
    expect(artworks.map((artwork) => artwork.tokenId)).toEqual([47, 46]);
    serve({ 'statistics/dashboard': { MainStats: { NumCSTokenMints: 0 } } });
    await expect(loadLatestArtworks(3)).resolves.toEqual([]);
  });

  it('finds a cycle’s Signature through the cycle record', async () => {
    serve({
      'rounds/info/1': { RoundInfo: { MainPrize: { NftTokenId: 24, Seed: SEED } } },
      'cst/info/24': { TokenInfo: { TokenId: 24, TokenName: 'NUMBA', RoundNum: 1, Seed: SEED } },
    });
    await expect(loadCycleArtwork(1)).resolves.toEqual(
      expect.objectContaining({ tokenId: 24, name: 'NUMBA', cycle: 1 }),
    );
    // Not finalized yet: no Signature to show.
    serve({ 'rounds/info/2': { RoundInfo: { MainPrize: {} } } });
    await expect(loadCycleArtwork(2)).resolves.toBeNull();
  });

  it('shows up to three of a participant’s Signatures', async () => {
    serve({
      'cst/list/by_user/0xabc/0/3': {
        UserTokens: [
          { TokenId: 47, Seed: SEED },
          { TokenId: 43, Seed: SEED },
        ],
      },
    });
    const artworks = await loadParticipantArtworks('0xabc', 3);
    expect(artworks.map((artwork) => artwork.tokenId)).toEqual([47, 43]);
  });

  it('resolves a gesture’s position, cycle and method from its event id', async () => {
    serve({ 'bid/info/29447': { BidInfo: { BidPosition: 1139, RoundNum: 2, BidType: 2 } } });
    await expect(loadGesture(29447)).resolves.toEqual({ position: 1139, cycle: 2, method: 2 });
    serve({ 'bid/info/1': { BidInfo: { BidPosition: -1 } } });
    await expect(loadGesture(1)).resolves.toBeNull();
  });

  it('reads through the Data Cache and gives up on a slow origin', async () => {
    serve({ 'bid/info/7': { BidInfo: { BidPosition: 0 } } });
    await loadGesture(7);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit & {
        next?: { revalidate?: number };
      },
    ];
    expect(init.next?.revalidate).toBe(OG_DATA_REVALIDATE_SECONDS);
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(OG_FETCH_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('degrades to nothing when the API is unreachable', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    await expect(loadLatestArtworks(1)).resolves.toEqual([]);
    await expect(loadGesture(1)).resolves.toBeNull();
  });
});
// lexicon-allow-end
