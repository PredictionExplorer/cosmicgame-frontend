import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { COSMIC_OG_SIZE, CosmicOgCard, type CosmicOgCardProps } from '@/lib/og/CosmicOgCard';

/**
 * `next/og`'s ImageResponse runs only on the edge runtime; we cannot
 * exercise its real renderer in jsdom. Stub it with a constructor that
 * captures its arguments so we can assert that each route module's
 * default function returns a value, and that we passed the brand
 * template plus the expected size.
 */
type Captured = {
  element: ReactElement<CosmicOgCardProps>;
  size: { width: number; height: number };
};
const mockImageResponseCalls: Captured[] = [];

jest.mock('next/og', () => ({
  __esModule: true,
  ImageResponse: class MockImageResponse {
    constructor(element: unknown, size: unknown) {
      mockImageResponseCalls.push({
        element: element as ReactElement<CosmicOgCardProps>,
        size: size as { width: number; height: number },
      });
    }
  },
}));

beforeEach(() => {
  mockImageResponseCalls.length = 0;
});

/** Recursively walks a React tree and gathers every string/number child. */
function collectStrings(node: ReactNode): string[] {
  if (node == null || typeof node === 'boolean') return [];
  if (typeof node === 'string') return [node];
  if (typeof node === 'number') return [String(node)];
  if (Array.isArray(node)) return node.flatMap(collectStrings);
  if (isValidElement(node)) {
    const props = (node as ReactElement<{ children?: ReactNode }>).props;
    return collectStrings(props?.children);
  }
  return [];
}

function lastCardProps(): CosmicOgCardProps {
  const last = mockImageResponseCalls[mockImageResponseCalls.length - 1];
  expect(last).toBeDefined();
  expect(last!.element.type).toBe(CosmicOgCard);
  return last!.element.props;
}

function lastCardSize(): { width: number; height: number } {
  const last = mockImageResponseCalls[mockImageResponseCalls.length - 1];
  expect(last).toBeDefined();
  return last!.size;
}

// ---------------------------------------------------------------------------
// CosmicOgCard component
// ---------------------------------------------------------------------------

describe('CosmicOgCard component', () => {
  it('returns a React element when called with the minimum required props', () => {
    const el = CosmicOgCard({ title: 'Hello world.' });
    expect(isValidElement(el)).toBe(true);
  });

  it('renders the supplied title in the tree', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'A Headline.' }));
    expect(strings).toContain('A Headline.');
  });

  it('uses the default eyebrow "Cosmic Signature" when none is provided', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'X' }));
    expect(strings).toContain('Cosmic Signature');
  });

  it('uses a custom eyebrow when provided', () => {
    const strings = collectStrings(CosmicOgCard({ eyebrow: 'FAQ', title: 'X' }));
    expect(strings).toContain('FAQ');
    expect(strings).not.toContain('Cosmic Signature');
  });

  it('omits the subhead element when none is provided', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'X' }));
    expect(strings).not.toContain('Some subhead');
  });

  it('renders the subhead when provided', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'X', subhead: 'A nice subhead.' }));
    expect(strings).toContain('A nice subhead.');
  });

  it('omits the subhead when an empty string is passed (falsy guard)', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'X', subhead: '' }));
    expect(strings.filter((s) => s === '')).toHaveLength(0);
  });

  it('uses the three default chip labels', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'X' }));
    expect(strings).toEqual(
      expect.arrayContaining(['CC0', 'Formally Verified', '7% Protocol Guild']),
    );
  });

  it('uses custom chips and drops the defaults', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'X', chips: ['Alpha', 'Beta', 'Gamma'] }));
    expect(strings).toEqual(expect.arrayContaining(['Alpha', 'Beta', 'Gamma']));
    expect(strings).not.toContain('CC0');
    expect(strings).not.toContain('Formally Verified');
  });

  it('handles an empty chips array without throwing', () => {
    expect(() => CosmicOgCard({ title: 'X', chips: [] })).not.toThrow();
  });

  it('uses the default canonical domain footer text', () => {
    const strings = collectStrings(CosmicOgCard({ title: 'X' }));
    expect(strings).toContain('cosmicsignature.com');
  });

  it('uses a custom footer end when provided', () => {
    const strings = collectStrings(
      CosmicOgCard({ title: 'X', footerEnd: 'app.cosmicsignature.com' }),
    );
    expect(strings).toContain('app.cosmicsignature.com');
    expect(strings).not.toContain('cosmicsignature.com');
  });

  // Inline style assertions guard against accidental Tailwind/CSS-class
  // refactors. Satori only renders inline `style`, so any class-based
  // styling silently produces a blank PNG.
  it('uses inline styles on the root element (Satori has no CSS class support)', () => {
    const el = CosmicOgCard({ title: 'X' }) as ReactElement<{ style: Record<string, unknown> }>;
    expect(el.props.style).toEqual(expect.objectContaining({ display: 'flex', padding: '80px' }));
  });

  it('uses the Helvetica fallback font (Satori does not load custom fonts here)', () => {
    const el = CosmicOgCard({ title: 'X' }) as ReactElement<{ style: { fontFamily: string } }>;
    expect(el.props.style.fontFamily).toMatch(/Helvetica/);
  });

  it('paints the deep-space gradient background', () => {
    const el = CosmicOgCard({ title: 'X' }) as ReactElement<{
      style: { background: string };
    }>;
    expect(el.props.style.background).toContain('radial-gradient');
    expect(el.props.style.background).toContain(
      'linear-gradient(180deg, #0D0521 0%, #1A0B3E 100%)',
    );
  });
});

describe('COSMIC_OG_SIZE', () => {
  it('is the canonical 1200x630 OpenGraph card size', () => {
    expect(COSMIC_OG_SIZE).toEqual({ width: 1200, height: 630 });
  });
});

// ---------------------------------------------------------------------------
// Static-tier opengraph-image route modules
// ---------------------------------------------------------------------------

type OgModule = {
  runtime: string;
  contentType: string;
  size: { width: number; height: number };
  alt: string;
  default: (...args: unknown[]) => unknown;
};

const STATIC_OG_MODULES: ReadonlyArray<readonly [string, () => Promise<unknown>]> = [
  ['app/opengraph-image', () => import('@/app/opengraph-image')],
  ['app/faq/opengraph-image', () => import('@/app/faq/opengraph-image')],
  ['app/how-it-works/opengraph-image', () => import('@/app/how-it-works/opengraph-image')],
  ['app/gallery/opengraph-image', () => import('@/app/gallery/opengraph-image')],
  ['app/anchoring/opengraph-image', () => import('@/app/anchoring/opengraph-image')],
  ['app/current-cycle/opengraph-image', () => import('@/app/current-cycle/opengraph-image')],
  ['app/landing-site/opengraph-image', () => import('@/app/landing-site/opengraph-image')],
];

const DYNAMIC_OG_MODULES: ReadonlyArray<readonly [string, () => Promise<unknown>]> = [
  ['app/allocation/[id]/opengraph-image', () => import('@/app/allocation/[id]/opengraph-image')],
  ['app/gesture/[id]/opengraph-image', () => import('@/app/gesture/[id]/opengraph-image')],
  ['app/user/[address]/opengraph-image', () => import('@/app/user/[address]/opengraph-image')],
];

describe('static-tier opengraph-image module shape', () => {
  it.each(STATIC_OG_MODULES)(
    '%s exports the canonical edge-runtime fields',
    async (_label, load) => {
      const mod = (await load()) as OgModule;
      expect(mod.runtime).toBe('edge');
      expect(mod.contentType).toBe('image/png');
      expect(mod.size).toEqual(COSMIC_OG_SIZE);
      expect(typeof mod.alt).toBe('string');
      expect(mod.alt.length).toBeGreaterThan(0);
      expect(typeof mod.default).toBe('function');
    },
  );

  it.each(STATIC_OG_MODULES)(
    '%s default() invokes ImageResponse with CosmicOgCard',
    async (_label, load) => {
      const mod = (await load()) as OgModule;
      mod.default();
      expect(mockImageResponseCalls).toHaveLength(1);
      expect(lastCardSize()).toEqual(COSMIC_OG_SIZE);
      expect(lastCardProps().title.length).toBeGreaterThan(0);
    },
  );

  it.each(STATIC_OG_MODULES)('%s alt text mentions the brand', async (_label, load) => {
    const mod = (await load()) as OgModule;
    expect(mod.alt).toMatch(/Cosmic Signature/);
  });
});

describe('static-tier opengraph-image content', () => {
  it('app/opengraph-image renders the brand-line headline', async () => {
    const mod = (await import('@/app/opengraph-image')) as OgModule;
    mod.default();
    const props = lastCardProps();
    expect(props.eyebrow).toBe('Cosmic Signature');
    expect(props.title).toBe('Every Gesture Shapes the Signature.');
    expect(props.subhead).toMatch(/procedural on-chain art protocol/i);
  });

  it('faq card uses the FAQ eyebrow', async () => {
    const mod = (await import('@/app/faq/opengraph-image')) as OgModule;
    mod.default();
    const props = lastCardProps();
    expect(props.eyebrow).toBe('FAQ');
    expect(props.title).toMatch(/answering plainly/i);
  });

  it('how-it-works card uses the four-stage subhead and three short chips', async () => {
    const mod = (await import('@/app/how-it-works/opengraph-image')) as OgModule;
    mod.default();
    const props = lastCardProps();
    expect(props.eyebrow).toBe('How It Works');
    expect(props.title).toMatch(/four stages/i);
    expect(props.chips).toBeDefined();
    expect(props.chips!.length).toBeLessThanOrEqual(3);
  });

  it('gallery card mentions three-body trajectories', async () => {
    const mod = (await import('@/app/gallery/opengraph-image')) as OgModule;
    mod.default();
    const props = lastCardProps();
    expect(props.eyebrow).toBe('Gallery');
    expect(props.title).toMatch(/three-body trajectories/i);
  });

  it('anchoring card surfaces the per-cycle share message', async () => {
    const mod = (await import('@/app/anchoring/opengraph-image')) as OgModule;
    mod.default();
    const props = lastCardProps();
    expect(props.eyebrow).toBe('Anchoring');
    expect(props.title).toMatch(/each cycle/i);
  });

  it('current-cycle card frames the live cycle', async () => {
    const mod = (await import('@/app/current-cycle/opengraph-image')) as OgModule;
    mod.default();
    const props = lastCardProps();
    expect(props.eyebrow).toBe('Current Cycle');
    expect(props.title).toMatch(/Performance Cycle/);
  });

  it('landing-site card matches the site-wide default exactly', async () => {
    const root = (await import('@/app/opengraph-image')) as OgModule;
    const landing = (await import('@/app/landing-site/opengraph-image')) as OgModule;

    root.default();
    const rootProps = lastCardProps();

    landing.default();
    const landingProps = lastCardProps();

    // The marketing host shares the canonical card; if these diverge,
    // a refactor probably forgot to delete one of them.
    expect(landingProps.eyebrow).toBe(rootProps.eyebrow);
    expect(landingProps.title).toBe(rootProps.title);
    expect(landingProps.subhead).toBe(rootProps.subhead);
  });
});

// ---------------------------------------------------------------------------
// Dynamic-tier opengraph-image route modules
// ---------------------------------------------------------------------------

describe('dynamic-tier opengraph-image module shape', () => {
  it.each(DYNAMIC_OG_MODULES)(
    '%s exports the canonical edge-runtime fields',
    async (_label, load) => {
      const mod = (await load()) as OgModule;
      expect(mod.runtime).toBe('edge');
      expect(mod.contentType).toBe('image/png');
      expect(mod.size).toEqual(COSMIC_OG_SIZE);
      expect(typeof mod.alt).toBe('string');
      expect(mod.alt).toMatch(/Cosmic Signature/);
      expect(typeof mod.default).toBe('function');
    },
  );
});

describe('allocation/[id] dynamic OG card', () => {
  // Format: [id, expected eyebrow]
  const cases: ReadonlyArray<readonly [string, string]> = [
    ['0', 'Cycle #0'],
    ['1', 'Cycle #1'],
    ['42', 'Cycle #42'],
    ['999999', 'Cycle #999999'],
    ['  42  ', 'Cycle #42'], // parseInt accepts leading whitespace
    ['12abc', 'Cycle #12'], // parseInt stops at first non-digit
    ['12.9', 'Cycle #12'], // parseInt truncates
    ['-1', 'Allocation'], // negative falls back to generic eyebrow
    ['abc', 'Allocation'],
    ['', 'Allocation'],
    ['NaN', 'Allocation'],
    ['Infinity', 'Allocation'], // parseInt('Infinity') === NaN
  ];

  it.each(cases)('id=%j -> eyebrow=%j', async (id, expected) => {
    const mod = (await import('@/app/allocation/[id]/opengraph-image')) as OgModule;
    await mod.default({ params: Promise.resolve({ id }) });
    expect(lastCardProps().eyebrow).toBe(expected);
    expect(lastCardProps().title).toMatch(/allocation distribution/i);
  });

  it('preserves the size constant on every render', async () => {
    const mod = (await import('@/app/allocation/[id]/opengraph-image')) as OgModule;
    await mod.default({ params: Promise.resolve({ id: '7' }) });
    expect(lastCardSize()).toEqual(COSMIC_OG_SIZE);
  });
});

describe('gesture/[id] dynamic OG card', () => {
  const cases: ReadonlyArray<readonly [string, string]> = [
    ['0', 'Gesture #0'],
    ['1', 'Gesture #1'],
    ['9999', 'Gesture #9999'],
    ['  3  ', 'Gesture #3'],
    ['-5', 'Gesture'],
    ['hello', 'Gesture'],
    ['', 'Gesture'],
    ['NaN', 'Gesture'],
  ];

  it.each(cases)('id=%j -> eyebrow=%j', async (id, expected) => {
    const mod = (await import('@/app/gesture/[id]/opengraph-image')) as OgModule;
    await mod.default({ params: Promise.resolve({ id }) });
    expect(lastCardProps().eyebrow).toBe(expected);
    expect(lastCardProps().title).toMatch(/imprint on the signature/i);
  });
});

describe('user/[address] dynamic OG card', () => {
  // Format: [address, expected title]
  const VALID_ADDR = '0x1234567890abcdef1234567890abcdef12345678';
  const expectedTruncated = '0x1234\u20265678';

  const cases: ReadonlyArray<readonly [string, string]> = [
    [VALID_ADDR, expectedTruncated],
    [VALID_ADDR.toUpperCase(), expectedTruncated], // mixed case is normalized
    [`  ${VALID_ADDR}  `, expectedTruncated], // surrounding whitespace trimmed
    // First 6 chars of the lowercased input + horizontal ellipsis + last 4.
    ['0xABCDEF1234567890ABCDEF1234567890ABCDEF12', '0xabcd\u2026ef12'],
    ['0x1234', 'Participant'], // wrong length
    [VALID_ADDR.slice(2), 'Participant'], // missing 0x prefix
    [`0x${'Z'.repeat(40)}`, 'Participant'], // invalid hex chars
    [`0x${'1'.repeat(41)}`, 'Participant'], // too long
    ['', 'Participant'],
    ['not-an-address', 'Participant'],
    ['0x', 'Participant'],
  ];

  it.each(cases)('address=%j -> title=%j', async (address, expectedTitle) => {
    const mod = (await import('@/app/user/[address]/opengraph-image')) as OgModule;
    await mod.default({ params: Promise.resolve({ address }) });
    expect(lastCardProps().title).toBe(expectedTitle);
  });

  it('always uses the "Participant" eyebrow regardless of the address', async () => {
    const mod = (await import('@/app/user/[address]/opengraph-image')) as OgModule;
    await mod.default({ params: Promise.resolve({ address: VALID_ADDR }) });
    expect(lastCardProps().eyebrow).toBe('Participant');

    await mod.default({ params: Promise.resolve({ address: 'garbage' }) });
    expect(lastCardProps().eyebrow).toBe('Participant');
  });

  it('truncated addresses use a Unicode horizontal ellipsis rather than three dots', async () => {
    const mod = (await import('@/app/user/[address]/opengraph-image')) as OgModule;
    await mod.default({ params: Promise.resolve({ address: VALID_ADDR }) });
    const title = lastCardProps().title;
    expect(title).toContain('\u2026');
    expect(title).not.toContain('...');
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting invariants
// ---------------------------------------------------------------------------

describe('cross-cutting OG invariants', () => {
  const ALL_OG_MODULES = [...STATIC_OG_MODULES, ...DYNAMIC_OG_MODULES];

  it.each(ALL_OG_MODULES)('%s declares the edge runtime', async (_label, load) => {
    const mod = (await load()) as OgModule;
    expect(mod.runtime).toBe('edge');
  });

  it.each(ALL_OG_MODULES)('%s emits image/png', async (_label, load) => {
    const mod = (await load()) as OgModule;
    expect(mod.contentType).toBe('image/png');
  });

  it.each(ALL_OG_MODULES)('%s uses COSMIC_OG_SIZE', async (_label, load) => {
    const mod = (await load()) as OgModule;
    expect(mod.size).toBe(COSMIC_OG_SIZE);
  });

  it('every module imports the same shared template', async () => {
    // Touching the dynamic and static lists from the same suite catches
    // regressions where someone hand-rolls a card instead of reusing
    // CosmicOgCard.
    const types = new Set<unknown>();
    for (const [, load] of STATIC_OG_MODULES) {
      const mod = (await load()) as OgModule;
      mod.default();
      types.add(lastCardProps().title);
    }
    for (const [, load] of DYNAMIC_OG_MODULES) {
      const mod = (await load()) as OgModule;
      await mod.default({
        params: Promise.resolve({ id: '1', address: '0x' + 'a'.repeat(40) }),
      });
      types.add(lastCardProps().title);
    }
    // Each module produced exactly one CosmicOgCard call (no duplicates,
    // no missed calls). Ten modules total.
    expect(mockImageResponseCalls.length).toBe(
      STATIC_OG_MODULES.length + DYNAMIC_OG_MODULES.length,
    );
    for (const call of mockImageResponseCalls) {
      expect(call.element.type).toBe(CosmicOgCard);
    }
  });
});
