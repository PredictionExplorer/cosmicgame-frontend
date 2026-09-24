import { render, renderHook, screen, waitFor } from '@testing-library/react';

import {
  imprintedCount,
  resetLandingShowcaseCache,
  useLandingShowcaseTokens,
} from '@/components/landing-v2/useLandingShowcaseTokens';
import { showcaseArtworks, showcaseSources, shortSeed } from '@/components/landing-v2/showcase-art';
import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';

function respond(body: unknown, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValue({ ok, json: async () => body });
}

describe('useLandingShowcaseTokens', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetLandingShowcaseCache();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reads the collection once per page view, however many sections ask', async () => {
    respond({ CosmicSignatureTokenList: [{ TokenId: 3, Seed: 'cc' }] });
    function Probe({ id }: { id: string }) {
      const { status, tokens } = useLandingShowcaseTokens();
      return <p data-testid={id}>{`${status}:${tokens.length}`}</p>;
    }
    render(
      <>
        <Probe id="a" />
        <Probe id="b" />
        <Probe id="c" />
      </>,
    );
    await waitFor(() => expect(screen.getByTestId('c')).toHaveTextContent('ready:1'));
    expect(screen.getByTestId('a')).toHaveTextContent('ready:1');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('drops records without a seed', async () => {
    respond({
      CosmicSignatureTokenList: [
        { TokenId: 3, Seed: 'cc' },
        { TokenId: 2 },
        { TokenId: 1, Seed: '' },
      ],
    });
    const { result } = renderHook(() => useLandingShowcaseTokens());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.tokens.map((token) => token.TokenId)).toEqual([3]);
  });

  it.each([
    ['an error status', () => respond({}, false)],
    ['a network failure', () => (global.fetch as jest.Mock).mockRejectedValue(new Error('down'))],
  ])('reports failure on %s', async (_label, arrange) => {
    arrange();
    const { result } = renderHook(() => useLandingShowcaseTokens());
    await waitFor(() => expect(result.current.status).toBe('failed'));
    expect(result.current.tokens).toEqual([]);
  });
});

describe('imprintedCount', () => {
  it('is the newest token id plus one, since ids run from zero', () => {
    expect(
      imprintedCount({
        status: 'ready',
        tokens: [
          { TokenId: 47, Seed: 'a' },
          { TokenId: 12, Seed: 'b' },
        ],
      }),
    ).toBe(48);
  });

  it('is unknown until the collection answers, and zero for an empty one', () => {
    expect(imprintedCount({ status: 'loading', tokens: [] })).toBeNull();
    expect(imprintedCount({ status: 'failed', tokens: [] })).toBeNull();
    expect(imprintedCount({ status: 'ready', tokens: [] })).toBe(0);
  });
});

describe('showcase art helpers', () => {
  it('puts the bundled featured pieces first, then the collection, without repeats', () => {
    const artworks = showcaseArtworks([
      { TokenId: 50, Seed: '0xABC' },
      { TokenId: 23, Seed: FEATURED_LANDING_ART[0].Seed, TokenName: 'Named', Staked: true },
    ]);
    expect(artworks.map((art) => art.TokenId)).toEqual([23, 24, 50]);
    // The featured piece takes the collection's live name and anchoring state.
    expect(artworks[0]).toMatchObject({ TokenName: 'Named', Staked: true });
    expect(artworks[2]!.Seed).toBe('ABC');
  });

  it('serves a featured piece from its bundled preview and others through the published files', () => {
    expect(showcaseSources(showcaseArtworks([])[0]!)).toEqual([
      [{ src: FEATURED_LANDING_ART[0].imageSrc, width: 960 }],
    ]);
    const [set, webImage, source] = showcaseSources({ TokenId: 50, Seed: 'abc' });
    expect(set).toEqual([
      { src: expect.stringContaining('/0xabc/thumb_card.webp'), width: 640 },
      { src: expect.stringContaining('/0xabc/images/web/full.webp'), width: 3456 },
    ]);
    expect(webImage).toEqual(expect.stringContaining('/0xabc/images/web/full.webp'));
    expect(source).toEqual(expect.stringContaining('/cosmicsignature/0xabc.png'));
  });

  it('shortens a seed for a caption', () => {
    expect(shortSeed(`0x${FEATURED_LANDING_ART[1].Seed}`)).toBe('5084a873…4dfc33ad');
    expect(shortSeed('abc')).toBe('abc');
  });
});
