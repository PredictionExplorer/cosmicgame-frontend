import { render, renderHook, screen, waitFor } from '@testing-library/react';

import {
  SHOWCASE_TTL_MS,
  imprintedCount,
  resetLandingShowcaseCache,
  useLandingShowcaseTokens,
} from '@/components/landing-v2/useLandingShowcaseTokens';
import { showcaseArtworks, showcaseSources } from '@/components/landing-v2/showcase-art';
import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';

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

  it('asks again on the next mount after a failure, never keeping it for the session (V044)', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('down'));
    const first = renderHook(() => useLandingShowcaseTokens());
    await waitFor(() => expect(first.result.current.status).toBe('failed'));
    first.unmount();

    respond({ CosmicSignatureTokenList: [{ TokenId: 3, Seed: 'cc' }] });
    const second = renderHook(() => useLandingShowcaseTokens());
    await waitFor(() => expect(second.result.current.status).toBe('ready'));
    expect(global.fetch).toHaveBeenCalledTimes(2);
    // Each read is bounded by a timeout signal where the browser has one.
    const init = (global.fetch as jest.Mock).mock.calls[1]?.[1] as RequestInit | undefined;
    expect(init).toEqual(expect.objectContaining({ signal: expect.anything() }));
  });

  it('reuses a good answer for a while, then reads the collection again', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    try {
      respond({ CosmicSignatureTokenList: [{ TokenId: 3, Seed: 'cc' }] });
      const first = renderHook(() => useLandingShowcaseTokens());
      await waitFor(() => expect(first.result.current.status).toBe('ready'));
      first.unmount();
      renderHook(() => useLandingShowcaseTokens()).unmount();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      now.mockReturnValue(1_000_000 + SHOWCASE_TTL_MS + 1);
      const later = renderHook(() => useLandingShowcaseTokens());
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(later.result.current.status).toBe('ready'));
    } finally {
      now.mockRestore();
    }
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

  it('is unknown until the collection answers', () => {
    expect(imprintedCount({ status: 'loading', tokens: [] })).toBeNull();
    expect(imprintedCount({ status: 'failed', tokens: [] })).toBeNull();
  });

  it('is unknown, never 0, when the answer has no usable token beside the bundled Signatures', () => {
    expect(imprintedCount({ status: 'ready', tokens: [] })).toBeNull();
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
    // One seed normalisation everywhere (utils/urls bareSeed): no prefix, lower case.
    expect(artworks[2]!.Seed).toBe('abc');
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

  it('takes the featured Signatures from the bundled plates, the one record of them', () => {
    expect(FEATURED_LANDING_ART.map((art) => art.TokenId)).toEqual([23, 24]);
    expect(FEATURED_LANDING_ART[1]).toEqual({
      TokenId: 24,
      Seed: SIGNATURE_PLATES[24].seed,
      RoundNum: 1,
      ImprintedAt: 1_786_491_506,
      imageSrc: '/images/landing/signature-24.webp',
    });
  });
});
