import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { loadGesture, loadLatestArtworks, loadTokenArtwork, type OgArtwork } from '@/lib/og/art';
import { COSMIC_OG_SIZE, CosmicOgCard, type CosmicOgCardProps } from '@/lib/og/CosmicOgCard';
import { getOgTypography } from '@/lib/og/fonts';
import { OG_COLORS } from '@/lib/og/palette';

/**
 * `next/og`'s ImageResponse rasterizes through satori + resvg/sharp, which
 * cannot run under jsdom. The stub captures the element and options so the
 * route modules can be checked for the card they compose; the real renderer
 * is exercised by the dev-server screenshots (`/[locale]/opengraph-image…`).
 */
type Captured = {
  element: ReactElement<CosmicOgCardProps>;
  options: { width: number; height: number; fonts: Array<{ name: string; weight: number }> };
};
const mockImageResponseCalls: Captured[] = [];

jest.mock('next/og', () => ({
  __esModule: true,
  ImageResponse: class MockImageResponse {
    constructor(element: unknown, options: unknown) {
      mockImageResponseCalls.push({
        element: element as ReactElement<CosmicOgCardProps>,
        options: options as Captured['options'],
      });
    }
  },
}));

jest.mock('@/lib/og/art', () => ({
  OG_DATA_REVALIDATE_SECONDS: 3600,
  loadCycleArtwork: jest.fn(async () => null),
  loadGesture: jest.fn(async () => null),
  loadLatestArtworks: jest.fn(async () => []),
  loadParticipantArtworks: jest.fn(async () => []),
  loadTokenArtwork: jest.fn(async () => null),
}));

const ART: OgArtwork = { tokenId: 47, name: null, cycle: 1, src: 'data:image/png;base64,AAAA' };

beforeEach(() => {
  mockImageResponseCalls.length = 0;
  (loadLatestArtworks as jest.Mock).mockResolvedValue([ART]);
});

/** Every string and number child in a React tree, components expanded. */
function collectStrings(node: ReactNode): string[] {
  if (node == null || typeof node === 'boolean') return [];
  if (typeof node === 'string') return [node];
  if (typeof node === 'number') return [String(node)];
  if (Array.isArray(node)) return node.flatMap(collectStrings);
  if (isValidElement(node)) return collectStrings(expand(node));
  return [];
}

/** Renders function components (the card is pure) down to host elements. */
function expand(element: ReactElement): ReactNode {
  if (typeof element.type === 'function') {
    return expand(
      (element.type as (props: unknown) => ReactElement)(element.props) as ReactElement,
    );
  }
  const props = element.props as { children?: ReactNode };
  return props.children;
}

/** Every host element's inline style in a React tree. */
function collectStyles(node: ReactNode, out: Array<Record<string, unknown>> = []) {
  if (Array.isArray(node)) node.forEach((child) => collectStyles(child, out));
  else if (isValidElement(node)) {
    if (typeof node.type === 'function') {
      collectStyles((node.type as (props: unknown) => ReactNode)(node.props), out);
    } else {
      const props = node.props as { style?: Record<string, unknown>; children?: ReactNode };
      if (props.style) out.push(props.style);
      collectStyles(props.children, out);
    }
  }
  return out;
}

function collectImages(node: ReactNode, out: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((child) => collectImages(child, out));
  else if (isValidElement(node)) {
    if (typeof node.type === 'function') {
      collectImages((node.type as (props: unknown) => ReactNode)(node.props), out);
    } else {
      const props = node.props as { src?: string; children?: ReactNode };
      if (node.type === 'img' && props.src) out.push(props.src);
      collectImages(props.children, out);
    }
  }
  return out;
}

const base = (overrides: Partial<CosmicOgCardProps> = {}): CosmicOgCardProps => ({
  typography: getOgTypography('en'),
  markSrc: 'data:image/svg+xml;base64,MARK',
  title: 'A Headline.',
  domain: 'app.cosmicsignature.com',
  ...overrides,
});

const card = (props: CosmicOgCardProps) => <CosmicOgCard {...props} />;

function lastCard() {
  const last = mockImageResponseCalls[mockImageResponseCalls.length - 1];
  expect(last).toBeDefined();
  expect(last!.element.type).toBe(CosmicOgCard);
  return last!;
}

describe('CosmicOgCard', () => {
  it('draws the wordmark: the orbit mark and the brand in Clash Display', () => {
    const tree = card(base());
    expect(collectStrings(tree)).toContain('Cosmic Signature');
    expect(collectImages(tree)).toContain('data:image/svg+xml;base64,MARK');
    expect(collectStyles(tree).some((style) => style.fontFamily === "'Clash Display'")).toBe(true);
  });

  it('lays out text, plate and strip cards by how many artworks it has', () => {
    const plate = { src: 'data:image/png;base64,ART', label: 'Signature #000047 · Cycle 1' };
    const text = card(base({ eyebrow: 'FAQ', subhead: 'Sub.', fact: 'CC0 · Open source' }));
    expect(collectStrings(text)).toEqual(
      expect.arrayContaining(['FAQ', 'A Headline.', 'Sub.', 'CC0 · Open source']),
    );
    expect(collectImages(text)).toHaveLength(1);

    const single = card(base({ art: [plate], fact: 'Not drawn' }));
    expect(collectImages(single)).toContain('data:image/png;base64,ART');
    expect(collectStrings(single)).toContain('Signature #000047 · Cycle 1');
    expect(collectStrings(single)).not.toContain('Not drawn');

    const strip = card(
      base({
        art: [
          { src: 'a', number: '#000047' },
          { src: 'b', number: '#000046' },
          { src: 'c', number: '#000045' },
          { src: 'd', number: '#000044' },
        ],
      }),
    );
    expect(collectImages(strip)).toEqual(['data:image/svg+xml;base64,MARK', 'a', 'b', 'c']);
    expect(collectStrings(strip)).toEqual(expect.arrayContaining(['#000047', '#000045']));
  });

  it('paints the Midnight ground and pure-black plates, never the retired gradient', () => {
    const styles = collectStyles(card(base({ art: [{ src: 'x' }] })));
    expect(styles[0]).toEqual(expect.objectContaining({ backgroundColor: '#090A11' }));
    expect(styles.some((style) => style.background === OG_COLORS.plate)).toBe(true);
    const paint = JSON.stringify(styles);
    expect(paint).not.toMatch(/#0D0521|#1A0B3E|0, 229, 255|Helvetica/);
  });

  // F311: text at embed size stays legible.
  it('keeps every line of text at 28px or larger', () => {
    for (const art of [
      [],
      [{ src: 'x', label: 'L' }],
      [{ src: 'a', number: '#1' }, { src: 'b' }],
    ]) {
      const sizes = collectStyles(
        card(base({ eyebrow: 'E', subhead: 'S', fact: 'F', art })),
      ).flatMap((style) => (typeof style.fontSize === 'number' ? [style.fontSize] : []));
      expect(sizes.length).toBeGreaterThan(3);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(28);
    }
  });

  // F225: English titles used to fall through to next/og's Geist Regular.
  it('sets titles in the locale’s display face at the site’s heading weight', () => {
    const titleStyle = (locale: string, overrides: Partial<CosmicOgCardProps> = {}) =>
      collectStyles(
        card(base({ typography: getOgTypography(locale), title: 'T', ...overrides })),
      ).find((style) => typeof style.fontSize === 'number' && style.fontSize >= 40);
    expect(titleStyle('en')).toEqual(
      expect.objectContaining({
        fontFamily: "'Clash Display', 'Inter'",
        fontWeight: 500,
        letterSpacing: '-0.03em',
      }),
    );
    expect(titleStyle('uk')).toEqual(
      expect.objectContaining({ fontFamily: "'Onest'", fontWeight: 500 }),
    );
    expect(titleStyle('ja')).toEqual(
      expect.objectContaining({
        fontFamily: "'Clash Display', 'Noto Sans JP'",
        fontWeight: 700,
        letterSpacing: 0,
      }),
    );
    expect(titleStyle('en', { monoTitle: true })).toEqual(
      expect.objectContaining({ fontFamily: "'JetBrains Mono'" }),
    );
  });

  it('keeps Korean words and Japanese phrases whole as wrapping units', () => {
    const ko = card(
      base({ typography: getOgTypography('ko'), title: '모든 제스처가 시그니처를 빚어냅니다.' }),
    );
    expect(collectStrings(ko)).toEqual(expect.arrayContaining(['모든', '제스처가', '빚어냅니다.']));
    const ja = card(
      base({ typography: getOgTypography('ja'), title: '三体の軌跡を、オンチェーンで描く。' }),
    );
    expect(collectStrings(ja)).toEqual(expect.arrayContaining(['三体の', 'オンチェーンで']));
  });
});

describe('COSMIC_OG_SIZE', () => {
  it('is the canonical 1200x630 Open Graph card size', () => {
    expect(COSMIC_OG_SIZE).toEqual({ width: 1200, height: 630 });
  });
});

type RouteModule = {
  default: (props: { params: Promise<Record<string, string>> }) => Promise<unknown>;
  generateImageMetadata: (props: {
    params: Promise<Record<string, string>>;
  }) => Promise<
    Array<{ id: string; alt: string; size: { width: number; height: number }; contentType: string }>
  >;
  size: { width: number; height: number };
  contentType: string;
  revalidate?: number;
};

const load = (path: string) => require(path) as RouteModule;

const STATIC_ROUTES = {
  appHome: '../../app/[locale]/(app)/opengraph-image',
  landingGroup: '../../app/[locale]/(landing)/opengraph-image',
  landingHome: '../../app/[locale]/(landing)/landing-site/opengraph-image',
  about: '../../app/[locale]/(landing)/about/opengraph-image',
  learn: '../../app/[locale]/(landing)/learn/opengraph-image',
  gallery: '../../app/[locale]/(app)/gallery/opengraph-image',
  currentCycle: '../../app/[locale]/(app)/current-cycle/opengraph-image',
  anchoring: '../../app/[locale]/(app)/anchoring/opengraph-image',
  faq: '../../app/[locale]/(app)/faq/opengraph-image',
  howItWorks: '../../app/[locale]/(app)/how-it-works/opengraph-image',
} as const;

const params = (values: Record<string, string>) => ({ params: Promise.resolve(values) });

describe('opengraph-image routes', () => {
  it.each(Object.entries(STATIC_ROUTES))(
    '%s exports a 1200×630 PNG route with alt text',
    async (_name, path) => {
      const route = load(path);
      expect(route.size).toEqual({ width: 1200, height: 630 });
      expect(route.contentType).toBe('image/png');
      const [metadata] = await route.generateImageMetadata(params({ locale: 'en' }));
      expect(metadata).toEqual(
        expect.objectContaining({
          id: 'default',
          contentType: 'image/png',
          alt: expect.any(String),
        }),
      );
      await route.default(params({ locale: 'en' }));
      expect(lastCard().options).toEqual(expect.objectContaining({ width: 1200, height: 630 }));
    },
  );

  it('brand cards on both hosts show the newest Signature and regenerate hourly', async () => {
    for (const path of [STATIC_ROUTES.appHome, STATIC_ROUTES.landingGroup, STATIC_ROUTES.about]) {
      const route = load(path);
      expect(route.revalidate).toBe(3600);
      await route.default(params({ locale: 'en' }));
      expect(lastCard().element.props).toEqual(
        expect.objectContaining({
          title: 'Every Gesture Shapes the Signature.',
          art: [expect.objectContaining({ label: 'Signature #000047 · Cycle 1' })],
        }),
      );
    }
    await load(STATIC_ROUTES.landingHome).default(params({ locale: 'en' }));
    expect(lastCard().element.props.domain).toBe('cosmicsignature.com');
    await load(STATIC_ROUTES.appHome).default(params({ locale: 'en' }));
    expect(lastCard().element.props.domain).toBe('app.cosmicsignature.com');
  });

  it('embeds the locale’s faces and uppercases eyebrows in cased scripts', async () => {
    await load(STATIC_ROUTES.faq).default(params({ locale: 'uk' }));
    const { element, options } = lastCard();
    expect(element.props.eyebrow).toBe('ПОШИРЕНІ ЗАПИТАННЯ');
    expect(options.fonts.map((font) => font.name)).toEqual(
      expect.arrayContaining(['Onest', 'Inter', 'Clash Display', 'JetBrains Mono']),
    );
    await load(STATIC_ROUTES.faq).default(params({ locale: 'zh-TW' }));
    expect(lastCard().element.props.eyebrow).toBe('常見問題');
  });

  it('text routes carry their fact line instead of chips', async () => {
    await load(STATIC_ROUTES.howItWorks).default(params({ locale: 'en' }));
    expect(lastCard().element.props.fact).toBe('Calibration · Gestures · Allocations');
    expect(lastCard().element.props.art).toBeUndefined();
  });

  it('the token route renders the token, with trait-free alt text offline', async () => {
    (loadTokenArtwork as jest.Mock).mockResolvedValue({
      ...ART,
      tokenId: 24,
      name: 'Twisted Mind',
    });
    const route = load('../../app/[locale]/(app)/detail/[id]/opengraph-image');
    expect(route.revalidate).toBe(3600);
    await route.default(params({ locale: 'en', id: '24' }));
    expect(lastCard().element.props).toEqual(
      expect.objectContaining({ title: 'Twisted Mind', eyebrow: 'CYCLE 1' }),
    );
    const [metadata] = await route.generateImageMetadata(params({ locale: 'en', id: '24' }));
    expect(metadata?.alt).toMatch(/^Cosmic Signature #24/);
  });

  it('the gesture route falls back to the generic headline when the record is unknown', async () => {
    (loadGesture as jest.Mock).mockResolvedValue(null);
    const route = load('../../app/[locale]/(app)/gesture/[id]/opengraph-image');
    await route.default(params({ locale: 'en', id: 'x' }));
    expect(lastCard().element.props.title).toBe('An imprint on the Signature.');
  });

  it('the allocation and participant routes put the value in the headline', async () => {
    await load('../../app/[locale]/(app)/allocation/[id]/opengraph-image').default(
      params({ locale: 'en', id: '7' }),
    );
    expect(lastCard().element.props.title).toBe('Cycle 7 allocations');
    await load('../../app/[locale]/(app)/user/[address]/opengraph-image').default(
      params({ locale: 'en', address: '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c' }),
    );
    expect(lastCard().element.props).toEqual(
      expect.objectContaining({ title: '0x7406...Bc6c', monoTitle: true }),
    );
  });
});
