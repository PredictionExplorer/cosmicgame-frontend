import {
  loadCycleArtwork,
  loadGesture,
  loadLatestArtworks,
  loadParticipantArtworks,
  loadTokenArtwork,
  loadTokenInfo,
  type OgArtwork,
} from '@/lib/og/art';
import {
  allocationCard,
  allocationCardAlt,
  galleryCard,
  gestureCard,
  gestureCardAlt,
  latestArtworkCard,
  ogImageMetadata,
  participantCard,
  participantCardAlt,
  shortAddress,
  textCard,
  tokenCard,
  tokenCardAlt,
} from '@/lib/og/cards';
import { createCosmicOgImage, type OgCardContent } from '@/lib/og/createCosmicOgImage';
import { OG_DOMAINS } from '@/lib/og/hosts';
import { fetchNftMetadata } from '@/lib/nftMetadata';

jest.mock('@/lib/og/art', () => ({
  OG_DATA_REVALIDATE_SECONDS: 3600,
  OG_FETCH_TIMEOUT_MS: 8000,
  loadCycleArtwork: jest.fn(),
  loadGesture: jest.fn(),
  loadLatestArtworks: jest.fn(),
  loadParticipantArtworks: jest.fn(),
  loadTokenArtwork: jest.fn(),
  loadTokenInfo: jest.fn(),
}));

jest.mock('@/lib/og/createCosmicOgImage', () => ({
  createCosmicOgImage: jest.fn(async () => ({})),
}));

jest.mock('@/lib/nftMetadata', () => ({
  ...jest.requireActual('@/lib/nftMetadata'),
  fetchNftMetadata: jest.fn(),
}));

// A translator that knows no trait labels: values render as the wire names.
jest.mock('next-intl/server', () => ({
  getTranslations: async () => Object.assign((key: string) => key, { has: () => false }),
}));

// The global viem mock keeps addresses as given; these tests need real checksums.
jest.mock('viem', () => {
  const utils = jest.requireActual('viem/utils') as typeof import('viem/utils');
  return { getAddress: utils.getAddress, isAddress: utils.isAddress };
});

const mocked = <T extends (...args: never[]) => unknown>(fn: T) => fn as unknown as jest.Mock;

const artwork = (overrides: Partial<OgArtwork> = {}): OgArtwork => ({
  tokenId: 47,
  name: null,
  cycle: 1,
  src: 'data:image/png;base64,AAAA',
  ...overrides,
});

/** The content the last card was rendered with. */
function lastCard(): { locale: string; content: OgCardContent } {
  const calls = mocked(createCosmicOgImage).mock.calls as Array<[string, OgCardContent]>;
  const [locale, content] = calls[calls.length - 1]!;
  return { locale, content };
}

beforeEach(() => {
  jest.clearAllMocks();
  mocked(loadLatestArtworks).mockResolvedValue([artwork()]);
  mocked(loadTokenArtwork).mockResolvedValue(artwork({ tokenId: 24 }));
  mocked(loadTokenInfo).mockResolvedValue(null);
  mocked(loadCycleArtwork).mockResolvedValue(artwork({ tokenId: 24, name: 'Twisted Mind' }));
  mocked(loadParticipantArtworks).mockResolvedValue([]);
  mocked(loadGesture).mockResolvedValue({ position: 1139, cycle: 2, method: 2 });
});

describe('share-card builders', () => {
  it('prints the public host', () => {
    expect(OG_DOMAINS).toEqual({ app: 'app.cosmicsignature.com', landing: 'cosmicsignature.com' });
    expect(ogImageMetadata('Alt')).toEqual([
      { id: 'default', alt: 'Alt', size: { width: 1200, height: 630 }, contentType: 'image/png' },
    ]);
  });

  it('hangs the newest Signature beside the brand line, with its wall label', async () => {
    await latestArtworkCard('en', 'default', 'landing');
    expect(lastCard().content).toEqual(
      expect.objectContaining({
        title: 'Every Gesture Shapes the Signature.',
        domain: 'cosmicsignature.com',
        art: [{ src: 'data:image/png;base64,AAAA', label: 'Signature #000047 · Cycle 1' }],
      }),
    );
    await latestArtworkCard('ja', 'default', 'app');
    expect(lastCard().content.art?.[0]?.label).toBe('シグネチャー#000047・サイクル1');
  });

  it('falls back to the text card when no artwork can be read', async () => {
    mocked(loadLatestArtworks).mockResolvedValue([]);
    await latestArtworkCard('en', 'currentCycle', 'app');
    expect(lastCard().content.art).toEqual([]);
    expect(lastCard().content.fact).toBe('Live on Arbitrum One');
  });

  it('renders text cards with their fact line', async () => {
    await textCard('uk', 'faq', 'app');
    expect(lastCard()).toEqual({
      locale: 'uk',
      content: expect.objectContaining({
        eyebrow: 'Поширені запитання',
        domain: 'app.cosmicsignature.com',
      }),
    });
  });

  it('lays the gallery out as a strip of the newest Signatures', async () => {
    mocked(loadLatestArtworks).mockResolvedValue([
      artwork({ tokenId: 47 }),
      artwork({ tokenId: 46 }),
      artwork({ tokenId: 45 }),
    ]);
    await galleryCard('en');
    expect(lastCard().content.art?.map((plate) => plate.number)).toEqual([
      '#000047',
      '#000046',
      '#000045',
    ]);
    expect(lastCard().content.subhead).toBeUndefined();
  });

  describe('token cards', () => {
    // F226: a named piece is shared with its name, its number and its cycle.
    it('show the piece with its name, number and cycle', async () => {
      mocked(loadTokenArtwork).mockResolvedValue(artwork({ tokenId: 25, name: 'Twisted Mind' }));
      await tokenCard('en', '25');
      expect(lastCard().content).toEqual(
        expect.objectContaining({
          eyebrow: '#000025 · Cycle 1',
          title: 'Twisted Mind',
          art: [expect.anything()],
        }),
      );
      await tokenCard('ja', '25');
      expect(lastCard().content.eyebrow).toBe('#000025・サイクル1');
    });

    it('name an unnamed piece by its number, with its cycle above', async () => {
      await tokenCard('zh', '24');
      expect(lastCard().content).toEqual(
        expect.objectContaining({ eyebrow: '第 1 个周期', title: '签名 #000024' }),
      );
    });

    // F226: the card must never show another Signature in this token's place.
    it('keep naming this token on the text layout when its render is unavailable', async () => {
      mocked(loadTokenArtwork).mockResolvedValue(null);
      mocked(loadTokenInfo).mockResolvedValue({ tokenId: 24, name: 'Twisted Mind', cycle: 3 });
      await tokenCard('en', '24');
      expect(lastCard().content).toEqual(
        expect.objectContaining({ eyebrow: '#000024 · Cycle 3', title: 'Twisted Mind', art: [] }),
      );
      mocked(loadTokenInfo).mockResolvedValue(null);
      await tokenCard('en', '24');
      expect(lastCard().content).toEqual(
        expect.objectContaining({ eyebrow: undefined, title: 'Signature #000024', art: [] }),
      );
      expect(loadLatestArtworks).not.toHaveBeenCalled();
    });

    it('reject non-canonical ids', async () => {
      await tokenCard('en', '024');
      expect(loadTokenArtwork).not.toHaveBeenCalled();
      expect(lastCard().content.title).toBe('Every Gesture Shapes the Signature.');
    });

    describe('alt text', () => {
      const traits = {
        name: 'x',
        attributes: [
          { trait_type: 'Structure', value: 'Orbit Ribbons' },
          { trait_type: 'Palette', value: 'Glacial Split' },
        ],
        properties: { token_id: 25 },
      };

      it('names the piece, its number, its cycle and its traits', async () => {
        mocked(fetchNftMetadata).mockResolvedValue(traits);
        mocked(loadTokenInfo).mockResolvedValue({ tokenId: 25, name: 'Twisted Mind', cycle: 1 });
        expect(await tokenCardAlt('en', '25')).toBe(
          '“Twisted Mind”, Cosmic Signature #25 from Cycle 1: Orbit Ribbons structure, Glacial Split palette',
        );
        expect(await tokenCardAlt('ja', '25')).toBe(
          'サイクル1のCosmic Signature #25「Twisted Mind」：構造はOrbit Ribbons、パレットはGlacial Split',
        );
        expect(await tokenCardAlt('ko', '25')).toBe(
          '사이클 1의 Cosmic Signature #25 “Twisted Mind” — 구조: Orbit Ribbons, 팔레트: Glacial Split',
        );
      });

      it('leaves out each part it cannot read', async () => {
        mocked(fetchNftMetadata).mockResolvedValue(traits);
        mocked(loadTokenInfo).mockResolvedValue({ tokenId: 25, name: null, cycle: 1 });
        expect(await tokenCardAlt('en', '25')).toBe(
          'Cosmic Signature #25 from Cycle 1: Orbit Ribbons structure, Glacial Split palette',
        );
        mocked(fetchNftMetadata).mockRejectedValue(new Error('offline'));
        mocked(loadTokenInfo).mockResolvedValue({ tokenId: 25, name: 'Twisted Mind', cycle: null });
        expect(await tokenCardAlt('en', '25')).toBe(
          '“Twisted Mind”, Cosmic Signature #25, a deterministic three-body artwork',
        );
        mocked(loadTokenInfo).mockResolvedValue(null);
        expect(await tokenCardAlt('en', '24')).toBe(
          'Cosmic Signature #24, a deterministic three-body artwork',
        );
        expect(await tokenCardAlt('en', 'abc')).toBe(
          'Cosmic Signature — Every Gesture Shapes the Signature.',
        );
      });
    });
  });

  // F311: the specific value belongs in the headline, not the smallest text.
  it('puts the gesture’s position and cycle in the headline and its method above', async () => {
    await gestureCard('en', '29447');
    expect(lastCard().content).toEqual(
      expect.objectContaining({ title: 'Gesture #1139 · Cycle 2', eyebrow: 'CST gesture' }),
    );
    expect(await gestureCardAlt('en', '29447')).toBe('Cosmic Signature — Gesture #1139 in Cycle 2');
    mocked(loadGesture).mockResolvedValue(null);
    await gestureCard('ko', '29447');
    expect(lastCard().content).toEqual(
      expect.objectContaining({ title: '시그니처에 흔적을 남깁니다.', eyebrow: '제스처' }),
    );
    expect(await gestureCardAlt('en', 'x')).toBe('Cosmic Signature — Gesture');
  });

  it('shows a cycle’s allocations beside the cycle’s Signature', async () => {
    await allocationCard('en', '1');
    expect(lastCard().content).toEqual(
      expect.objectContaining({
        title: 'Cycle 1 allocations',
        art: [{ src: 'data:image/png;base64,AAAA', label: 'Twisted Mind' }],
      }),
    );
    expect(allocationCardAlt('en', '1')).toBe('Cosmic Signature — Cycle 1 allocations');
    expect(allocationCardAlt('en', '-1')).toBe('Cosmic Signature — Allocation Distribution');
    mocked(loadCycleArtwork).mockResolvedValue(null);
    await allocationCard('zh-HK', '2');
    expect(lastCard().content).toEqual(
      expect.objectContaining({ title: '第 2 個週期的分配', art: [] }),
    );
  });

  describe('participant cards', () => {
    const address = '0xa169574d0d353e3010997a3e64846b7d1b2a63b6';

    it('checksum and shorten the address with the locale’s ellipsis', () => {
      expect(shortAddress('en', address)).toBe('0xA169...63B6');
      expect(shortAddress('ja', address)).toBe('0xA169…63B6');
      expect(shortAddress('en', 'nope')).toBeNull();
      expect(participantCardAlt('en', address)).toBe(
        'Cosmic Signature — Participant 0xA169574D0d353E3010997A3E64846b7D1B2a63B6',
      );
      expect(participantCardAlt('en', 'nope')).toBe('Cosmic Signature — Participant');
    });

    it('set the address in the mono face, with the Signatures they hold', async () => {
      await participantCard('en', address);
      expect(lastCard().content).toEqual(
        expect.objectContaining({ title: '0xA169...63B6', monoTitle: true, art: [] }),
      );
      mocked(loadParticipantArtworks).mockResolvedValue([artwork()]);
      await participantCard('en', address);
      expect(lastCard().content.art).toEqual([
        { src: 'data:image/png;base64,AAAA', label: 'Signature #000047 · Cycle 1' },
      ]);
      mocked(loadParticipantArtworks).mockResolvedValue([artwork(), artwork({ tokenId: 3 })]);
      await participantCard('en', address);
      expect(lastCard().content.art?.map((plate) => plate.number)).toEqual(['#000047', '#000003']);
    });

    it('fall back to the generic card for anything that is not an address', async () => {
      await participantCard('en', 'not-an-address');
      expect(loadParticipantArtworks).not.toHaveBeenCalled();
      expect(lastCard().content.title).toBe('Participant');
    });
  });
});
