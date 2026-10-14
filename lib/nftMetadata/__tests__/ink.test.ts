import { getSeedPackageUrl, mediaFailoverUrl } from '@/utils/urls';

import {
  chooseDefaultInkFilm,
  fetchInkFilms,
  InkFilmsError,
  normalizeInkSeed,
  type InkFilm,
} from '../ink';

jest.mock('@/utils/urls', () => ({
  ...jest.requireActual('@/utils/urls'),
  mediaFailoverUrl: jest.fn(),
}));

const seed = '09e2fdfc0261b33baa2d71294977cff267c25cd234b9e07ad133c622a974e65b';
const manifestUrl = getSeedPackageUrl(seed, 'metadata/assets.json');
const alternateUrl = manifestUrl.replace('http://test-api.example', 'https://media.example');
const mockFailover = jest.mocked(mediaFailoverUrl);
const originalFetch = global.fetch;
const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

const short = {
  role: 'ember_web',
  path: 'videos/web/ember.mp4',
  kind: 'video',
  format: 'mp4',
  duration_seconds: 30.033333333333335,
};
const medium = {
  ...short,
  role: 'ember_medium_web',
  path: 'videos/web/ember_medium.mp4',
  duration_seconds: 113.35,
};
const slow = {
  ...short,
  role: 'ember_slow_web',
  path: 'videos/web/ember_slow.mp4',
  duration_seconds: 283.35,
};
const poster = {
  role: 'ember_web_full',
  path: 'images/web/ember_full.webp',
  kind: 'image',
  format: 'webp',
};
const preview = {
  ...poster,
  role: 'ember_web_preview',
  path: 'images/web/ember_preview.webp',
};
const sourceImage = {
  role: 'ember_source_master',
  path: 'images/source/ember.png',
  kind: 'image',
  format: 'png',
};
const manifest = (assets: unknown[] = [short, medium, slow, poster]) => ({
  schema_version: 2,
  generated_at: '2026-10-10T13:23:00.544726286-05:00',
  assets,
});
const response = (body: unknown = manifest(), status = 200): Response =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

beforeEach(() => {
  mockFetch.mockReset().mockResolvedValue(response());
  mockFailover.mockReset().mockReturnValue(null);
  global.fetch = mockFetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
});

describe('fetchInkFilms', () => {
  it('discovers all advertised films in duration order using actual running times', async () => {
    mockFetch.mockResolvedValue(
      response(manifest([sourceImage, slow, medium, preview, short, poster])),
    );
    await expect(fetchInkFilms(`0x${seed.toUpperCase()}`)).resolves.toEqual({
      films: [
        {
          variant: 'short',
          url: getSeedPackageUrl(seed, short.path),
          durationSeconds: 30.033333333333335,
        },
        { variant: 'medium', url: getSeedPackageUrl(seed, medium.path), durationSeconds: 113.35 },
        { variant: 'slow', url: getSeedPackageUrl(seed, slow.path), durationSeconds: 283.35 },
      ],
      poster: getSeedPackageUrl(seed, poster.path),
      image: {
        url: getSeedPackageUrl(seed, poster.path),
        sourceUrl: getSeedPackageUrl(seed, sourceImage.path),
      },
    });
    // Discovery is one small JSON read, never a video or image availability probe.
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      manifestUrl,
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        cache: 'no-cache',
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it.each([
    [[short], ['short']],
    [
      [short, slow],
      ['short', 'slow'],
    ],
    [[medium], ['medium']],
    [[slow], ['slow']],
  ])('only exposes advertised versions (%j)', async (assets, variants) => {
    mockFetch.mockResolvedValue(response(manifest(assets)));
    const films = await fetchInkFilms(seed);
    expect(films?.films.map((film) => film.variant)).toEqual(variants);
    expect(films?.poster).toBeUndefined();
    expect(films?.image).toBeUndefined();
  });

  it('uses a preview as a poster without advertising a full ink image', async () => {
    mockFetch.mockResolvedValue(response(manifest([medium, preview])));
    const data = await fetchInkFilms(seed);
    expect(data?.poster).toBe(getSeedPackageUrl(seed, preview.path));
    expect(data?.image).toBeUndefined();
  });

  it('exposes a full image even when no films have been published', async () => {
    mockFetch.mockResolvedValue(response(manifest([poster])));
    await expect(fetchInkFilms(seed)).resolves.toEqual({
      films: [],
      poster: getSeedPackageUrl(seed, poster.path),
      image: { url: getSeedPackageUrl(seed, poster.path) },
    });
  });

  it.each([[sourceImage], [sourceImage, preview], [sourceImage, short]])(
    'uses the original PNG when no full WebP image is advertised',
    async (...assets) => {
      mockFetch.mockResolvedValue(response(manifest(assets)));
      const data = await fetchInkFilms(seed);
      expect(data?.image).toEqual({
        url: getSeedPackageUrl(seed, sourceImage.path),
        sourceUrl: getSeedPackageUrl(seed, sourceImage.path),
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    },
  );

  it('does not use a source image as a video poster', async () => {
    mockFetch.mockResolvedValue(response(manifest([short, sourceImage])));
    expect((await fetchInkFilms(seed))?.poster).toBeUndefined();
  });

  it('ignores unrelated, HQ, and unknown future roles', async () => {
    mockFetch.mockResolvedValue(
      response(
        manifest([
          { ...short, role: 'main_web', path: 'videos/web/main.mp4' },
          { ...short, role: 'ember_hq', path: 'videos/hq/ember.mp4' },
          { ...short, role: 'ember_future_web', path: 'https://untrusted.example/video.mp4' },
          medium,
        ]),
      ),
    );
    expect((await fetchInkFilms(seed))?.films.map((film) => film.variant)).toEqual(['medium']);
  });

  it('returns null without full ink media or for a confirmed missing manifest', async () => {
    mockFetch
      .mockResolvedValueOnce(response(manifest([])))
      .mockResolvedValueOnce(response(manifest([preview])))
      .mockResolvedValueOnce(response(null, 404));
    await expect(fetchInkFilms(seed)).resolves.toBeNull();
    await expect(fetchInkFilms(seed)).resolves.toBeNull();
    await expect(fetchInkFilms(seed)).resolves.toBeNull();
    expect(mockFailover).not.toHaveBeenCalled();
  });

  it.each([
    null,
    [],
    {},
    { schema_version: 9, assets: [] },
    { schema_version: 2, assets: null },
    manifest([null]),
  ])('rejects malformed or unsupported manifests (%j)', async (payload) => {
    mockFetch.mockResolvedValue(response(payload));
    await expect(fetchInkFilms(seed)).rejects.toMatchObject({ retryable: false });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    { ...medium, kind: 'image' },
    { ...medium, format: 'webm' },
    { ...medium, duration_seconds: undefined },
    { ...medium, duration_seconds: '113' },
    { ...medium, duration_seconds: 0 },
    { ...medium, duration_seconds: -1 },
    { ...medium, duration_seconds: Infinity },
    { ...medium, duration_seconds: NaN },
  ])('rejects unusable film metadata (%j)', async (asset) => {
    mockFetch.mockResolvedValue(response(manifest([asset])));
    await expect(fetchInkFilms(seed)).rejects.toThrow('invalid video');
  });

  it.each([
    '/videos/web/ember_medium.mp4',
    'videos/web/../ember_medium.mp4',
    'videos/web/ember_medium.mp4?redirect=https://untrusted.example',
    'videos/web/%2e%2e/ember_medium.mp4',
    'https://untrusted.example/ember_medium.mp4',
    '//untrusted.example/ember_medium.mp4',
    'videos/web/ember_slow.mp4',
  ])('rejects a recognized role with an untrusted or mismatched path (%s)', async (path) => {
    mockFetch.mockResolvedValue(response(manifest([{ ...medium, path }])));
    await expect(fetchInkFilms(seed)).rejects.toThrow('invalid video');
  });

  it.each([
    [medium, medium],
    [short, poster, poster],
    [sourceImage, sourceImage],
    [preview, preview],
    [short, { ...preview, path: '../poster.webp' }],
  ])('rejects duplicate recognized roles and invalid images', async (...assets) => {
    mockFetch.mockResolvedValue(response(manifest(assets)));
    await expect(fetchInkFilms(seed)).rejects.toMatchObject({ retryable: false });
  });

  it.each([poster, preview, sourceImage])(
    'rejects recognized image roles with the wrong format or kind ($role)',
    async (asset) => {
      for (const change of [{ format: 'jpeg' }, { format: undefined }, { kind: 'video' }]) {
        mockFetch.mockResolvedValue(response(manifest([{ ...asset, ...change }])));
        await expect(fetchInkFilms(seed)).rejects.toThrow('invalid image');
      }
    },
  );

  it.each([
    '/images/source/ember.png',
    'images/source/../ember.png',
    'images/source/ember.png?redirect=https://untrusted.example',
    'images/source/%2e%2e/ember.png',
    'https://untrusted.example/ember.png',
    '//untrusted.example/ember.png',
    'images/web/ember_full.webp',
  ])('rejects an untrusted or mismatched source image path (%s)', async (path) => {
    mockFetch.mockResolvedValue(response(manifest([{ ...sourceImage, path }])));
    await expect(fetchInkFilms(seed)).rejects.toThrow('invalid image');
  });

  it('rejects invalid JSON without retrying the media mirror', async () => {
    mockFailover.mockReturnValue(alternateUrl);
    mockFetch.mockResolvedValue({
      ...response(),
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    await expect(fetchInkFilms(seed)).rejects.toMatchObject({ retryable: false });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([408, 429, 500, 503])(
    'tries the media mirror after a temporary HTTP %i failure',
    async (status) => {
      mockFailover.mockReturnValue(alternateUrl);
      mockFetch.mockResolvedValueOnce(response(null, status)).mockResolvedValueOnce(response());
      const data = await fetchInkFilms(seed);
      expect(mockFetch.mock.calls.map(([url]) => url)).toEqual([manifestUrl, alternateUrl]);
      expect(data?.films[0]?.url).toBe(
        getSeedPackageUrl(seed, short.path).replace(
          'http://test-api.example',
          'https://media.example',
        ),
      );
      expect(data?.poster).toBe(
        getSeedPackageUrl(seed, poster.path).replace(
          'http://test-api.example',
          'https://media.example',
        ),
      );
      expect(data?.image?.url).toBe(
        getSeedPackageUrl(seed, poster.path).replace(
          'http://test-api.example',
          'https://media.example',
        ),
      );
    },
  );

  it('resolves source image URLs on the mirror after failing over', async () => {
    mockFailover.mockReturnValue(alternateUrl);
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(response(manifest([sourceImage])));
    const mirrorSourceUrl = getSeedPackageUrl(seed, sourceImage.path).replace(
      'http://test-api.example',
      'https://media.example',
    );
    await expect(fetchInkFilms(seed)).resolves.toMatchObject({
      image: { url: mirrorSourceUrl, sourceUrl: mirrorSourceUrl },
    });
  });

  it('fails over on a network error and never cycles back to the first server', async () => {
    mockFailover.mockReturnValue(alternateUrl);
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchInkFilms(seed)).rejects.toMatchObject({ retryable: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it.each([400, 401, 403])(
    'keeps permanent HTTP %i failures distinct from absence',
    async (status) => {
      mockFailover.mockReturnValue(alternateUrl);
      mockFetch.mockResolvedValue(response(null, status));
      await expect(fetchInkFilms(seed)).rejects.toMatchObject({ retryable: false });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    },
  );

  it('preserves cancellation before making a request', async () => {
    const controller = new AbortController();
    const reason = new DOMException('Artwork changed', 'AbortError');
    controller.abort(reason);
    await expect(fetchInkFilms(seed, { signal: controller.signal })).rejects.toBe(reason);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('cancels an active read without requesting a mirror', async () => {
    mockFailover.mockReturnValue(alternateUrl);
    mockFetch.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
            once: true,
          });
        }),
    );
    const controller = new AbortController();
    const reason = new DOMException('Artwork changed', 'AbortError');
    const pending = fetchInkFilms(seed, { signal: controller.signal });
    controller.abort(reason);
    await expect(pending).rejects.toBe(reason);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });

  it('bounds a stalled request and can recover from the media mirror', async () => {
    jest.useFakeTimers();
    mockFailover.mockReturnValue(alternateUrl);
    mockFetch
      .mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
              once: true,
            });
          }),
      )
      .mockResolvedValueOnce(response());
    const pending = fetchInkFilms(seed);
    await jest.advanceTimersByTimeAsync(8_000);
    await expect(pending).resolves.toMatchObject({ films: expect.any(Array) });
    expect(mockFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('rejects path-like seeds before making any request', async () => {
    await expect(fetchInkFilms('../other')).rejects.toBeInstanceOf(InkFilmsError);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('normalizeInkSeed', () => {
  it.each([
    null,
    undefined,
    '',
    '0x',
    '../seed',
    'a/b',
    'https://example.com',
    'g',
    'a'.repeat(65),
    -1,
    1.5,
    NaN,
    Infinity,
  ])('does not accept invalid package identifiers (%s)', (value) =>
    expect(normalizeInkSeed(value)).toBeUndefined(),
  );

  it('normalizes canonical and legacy seed representations', () => {
    expect(normalizeInkSeed(`  0x${seed.toUpperCase()}  `)).toBe(seed);
    expect(normalizeInkSeed('a')).toBe('a');
    expect(normalizeInkSeed(0)).toBe('0');
  });
});

describe('chooseDefaultInkFilm', () => {
  const film = (variant: InkFilm['variant']): InkFilm => ({
    variant,
    url: variant,
    durationSeconds: 30,
  });

  it('prefers medium, falling back to short, then slow, then nothing', () => {
    expect(chooseDefaultInkFilm([film('slow'), film('short'), film('medium')])?.variant).toBe(
      'medium',
    );
    expect(chooseDefaultInkFilm([film('slow'), film('short')])?.variant).toBe('short');
    expect(chooseDefaultInkFilm([film('slow')])?.variant).toBe('slow');
    expect(chooseDefaultInkFilm([])).toBeUndefined();
  });
});
