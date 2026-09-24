import { TOKEN_1_METADATA_V2, TOKEN_43_METADATA_V1 } from '@/lib/nftMetadata/__fixtures__/metadata';
import {
  normalizeTraitEntry,
  parseCosmicSignatureMetadata,
  type TraitTranslator,
} from '@/lib/nftMetadata';

import {
  RENDER_WINDOW_SECONDS,
  SIGNATURE_THUMB_WIDTH,
  isRenderPending,
  composeSignatureAlt,
  signatureMedia,
  signatureSources,
} from '../signatureArt';
import enTraits from '../../../messages/en/traits.json';
import jaTraits from '../../../messages/ja/traits.json';
import koTraits from '../../../messages/ko/traits.json';

/** A `traits` translator over a real catalog, as next-intl would build it. */
function translator(catalog: Record<string, unknown>): TraitTranslator {
  const resolve = (key: string) =>
    key
      .split('.')
      .reduce<unknown>(
        (node, part) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
        catalog,
      );
  const t = ((key: string, values?: Record<string, string | number>) => {
    const message = resolve(key);
    if (typeof message !== 'string') throw new Error(`missing ${key}`);
    return message.replace(/\{(\w+)\}/g, (_m, name: string) => String(values?.[name] ?? ''));
  }) as TraitTranslator;
  t.has = (key: string) => typeof resolve(key) === 'string';
  return t;
}

const entry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
const legacyEntry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_43_METADATA_V1)!)!;

describe('signatureMedia', () => {
  it('derives every published file from the seed', () => {
    const media = signatureMedia('0xABC123')!;
    expect(media.renditions).toEqual([
      {
        src: expect.stringContaining('/cosmicsignature/0xABC123/thumb_card.webp'),
        width: SIGNATURE_THUMB_WIDTH,
      },
      // The media server publishes no size between the two, so the image
      // optimizer resizes the original for 720px plates at 2x and phones at 3x.
      {
        src: expect.stringMatching(/^\/_next\/image\?url=.*full\.webp&w=1200&/),
        width: 1200,
      },
      {
        src: expect.stringMatching(/^\/_next\/image\?url=.*full\.webp&w=1920&/),
        width: 1920,
      },
      {
        src: expect.stringContaining('/cosmicsignature/0xabc123/images/web/full.webp'),
        width: 3456,
      },
    ]);
    expect(media.webImage).toContain('/images/web/full.webp');
    expect(media.sourceImage).toMatch(/\/cosmicsignature\/0xABC123\.png$/);
    expect(media.video).toMatch(/\/cosmicsignature\/0xABC123\.mp4$/);
  });

  it('is null until the indexer has a seed', () => {
    expect(signatureMedia(undefined)).toBeNull();
    expect(signatureMedia(null)).toBeNull();
    expect(signatureMedia('')).toBeNull();
    expect(signatureMedia('0x')).toBeNull();
  });
});

describe('isRenderPending', () => {
  const imprintedAt = 1_700_000_000;

  it('is true only within the render window after imprinting', () => {
    expect(isRenderPending(imprintedAt, (imprintedAt + 60) * 1000)).toBe(true);
    expect(isRenderPending(imprintedAt, (imprintedAt + RENDER_WINDOW_SECONDS - 1) * 1000)).toBe(
      true,
    );
    expect(isRenderPending(imprintedAt, (imprintedAt + RENDER_WINDOW_SECONDS) * 1000)).toBe(false);
  });

  it('is false before the page knows the time, or without an imprint time', () => {
    expect(isRenderPending(imprintedAt, 0)).toBe(false);
    expect(isRenderPending(undefined, Date.now())).toBe(false);
    expect(isRenderPending(0, Date.now())).toBe(false);
  });
});

describe('signatureSources', () => {
  it('tries the responsive set, then the web image alone, then the source PNG', () => {
    const media = signatureMedia('abc')!;
    expect(signatureSources(media)).toEqual([media.renditions, media.webImage, media.sourceImage]);
    expect(signatureSources(null)).toEqual([]);
  });
});

describe('composeSignatureAlt', () => {
  const en = translator(enTraits);

  it('describes a named Signature by its name, number and traits', () => {
    expect(composeSignatureAlt(en, { id: '#000001', name: 'Twisted Mind', entry })).toBe(
      '“Twisted Mind”, Cosmic Signature #000001: Orbit Ribbons structure, Glacial Split palette, spectral class B',
    );
  });

  it('describes an unnamed Signature by its number', () => {
    expect(composeSignatureAlt(en, { id: '#000001', name: '  ', entry })).toBe(
      'Cosmic Signature #000001: Orbit Ribbons structure, Glacial Split palette, spectral class B',
    );
  });

  it('falls back to the name and number without published traits', () => {
    expect(composeSignatureAlt(en, { id: '#000043', entry: legacyEntry })).toBe(
      'Cosmic Signature #000043',
    );
    expect(composeSignatureAlt(en, { id: '#000043', name: 'Eve' })).toBe(
      '“Eve”, Cosmic Signature #000043',
    );
  });

  it('omits the spectral class when the token has none', () => {
    expect(
      composeSignatureAlt(en, { id: '#000001', entry: { ...entry, spectralClass: undefined } }),
    ).toBe('Cosmic Signature #000001: Orbit Ribbons structure, Glacial Split palette');
  });

  it('localizes through the traits catalog', () => {
    expect(composeSignatureAlt(translator(jaTraits), { id: '#000001', entry })).toMatch(
      /^Cosmic Signature #000001：構造は.+、パレットは.+、スペクトル型はB$/,
    );
    // Korean: no sound-dependent particle after a placeholder value.
    expect(composeSignatureAlt(translator(koTraits), { id: '#000001', entry })).toMatch(
      /^Cosmic Signature #000001 — 구조: .+, 팔레트: .+, 분광형: B$/,
    );
  });
});
