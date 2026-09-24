import type { ReactElement } from 'react';

import { routing } from '@/i18n/routing';
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
  OG_TEXT_BOXES,
  planCosmicOgCard,
  type CosmicOgCardProps,
  type OgCardPlan,
} from '@/lib/og/CosmicOgCard';
import type { TextBlock } from '@/lib/og/layout';

/**
 * F158/F228 regression guard: every share-card route, in every locale and in
 * every art scenario it can meet, laid out with the faces it embeds. Nothing
 * a route draws from its own copy may be cut: not the title, not the
 * subhead, not the eyebrow's single line, not the fact line or wall label;
 * and no word of it may be split across lines.
 *
 * The routes render through the real `createCosmicOgImage`, so the measure
 * is built from the checked-in font files exactly as in production; only
 * `ImageResponse` (satori + resvg, which cannot run under jsdom) and the
 * network reads are stubbed. `planCosmicOgCard` is the layout the card draws.
 */

const mockCards: Array<ReactElement<CosmicOgCardProps>> = [];

jest.mock('next/og', () => ({
  __esModule: true,
  ImageResponse: class MockImageResponse {
    constructor(element: unknown) {
      mockCards.push(element as ReactElement<CosmicOgCardProps>);
    }
  },
}));

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

jest.mock('next-intl/server', () => ({
  getTranslations: async () => Object.assign((key: string) => key, { has: () => false }),
}));

// The global viem mock keeps addresses as given; the cards need real checksums.
jest.mock('viem', () => {
  const utils = jest.requireActual('viem/utils') as typeof import('viem/utils');
  return { getAddress: utils.getAddress, isAddress: utils.isAddress };
});

const mocked = (fn: unknown) => fn as jest.Mock;

/** Realistic extremes: six-digit token numbers, three-digit cycles, a two-word name. */
const art = (tokenId: number, name: string | null = null): OgArtwork => ({
  tokenId,
  name,
  cycle: 118,
  src: 'data:image/png;base64,AAAA',
});
const ARTWORKS = [art(999_999), art(999_998, 'Twisted Mind'), art(999_997)];

type Params = Record<string, string>;
interface Scenario {
  name: string;
  route: string;
  params?: Params;
  setup?: () => void;
}

const route = (path: string) => `../../../app/[locale]/${path}/opengraph-image`;
const withArt = (count: number) => () =>
  mocked(loadLatestArtworks).mockResolvedValue(ARTWORKS.slice(0, count));

const SCENARIOS: Scenario[] = [
  { name: 'app home, plate', route: route('(app)'), setup: withArt(1) },
  { name: 'app home, text', route: route('(app)'), setup: withArt(0) },
  { name: 'landing home, plate', route: route('(landing)/landing-site'), setup: withArt(1) },
  { name: 'landing home, text', route: route('(landing)/landing-site'), setup: withArt(0) },
  { name: 'current cycle, plate', route: route('(app)/current-cycle'), setup: withArt(1) },
  { name: 'current cycle, text', route: route('(app)/current-cycle'), setup: withArt(0) },
  { name: 'anchoring, plate', route: route('(app)/anchoring'), setup: withArt(1) },
  { name: 'anchoring, text', route: route('(app)/anchoring'), setup: withArt(0) },
  { name: 'faq, text', route: route('(app)/faq') },
  { name: 'how it works, text', route: route('(app)/how-it-works') },
  { name: 'gallery, strip of three', route: route('(app)/gallery'), setup: withArt(3) },
  { name: 'gallery, strip of two', route: route('(app)/gallery'), setup: withArt(2) },
  { name: 'gallery, plate', route: route('(app)/gallery'), setup: withArt(1) },
  { name: 'gallery, text', route: route('(app)/gallery'), setup: withArt(0) },
  {
    name: 'named token, plate',
    route: route('(app)/detail/[id]'),
    params: { id: '999998' },
    setup: () => mocked(loadTokenArtwork).mockResolvedValue(ARTWORKS[1]),
  },
  {
    name: 'unnamed token, plate',
    route: route('(app)/detail/[id]'),
    params: { id: '999999' },
    setup: () => mocked(loadTokenArtwork).mockResolvedValue(ARTWORKS[0]),
  },
  {
    name: 'named token, text',
    route: route('(app)/detail/[id]'),
    params: { id: '999998' },
    setup: () => mocked(loadTokenInfo).mockResolvedValue(ARTWORKS[1]),
  },
  { name: 'unknown token, text', route: route('(app)/detail/[id]'), params: { id: '999999' } },
  {
    name: 'gesture, text',
    route: route('(app)/gesture/[id]'),
    params: { id: '299447' },
    setup: () => mocked(loadGesture).mockResolvedValue({ position: 99_999, cycle: 999, method: 1 }),
  },
  { name: 'unknown gesture, text', route: route('(app)/gesture/[id]'), params: { id: '1' } },
  {
    name: 'allocation, plate',
    route: route('(app)/allocation/[id]'),
    params: { id: '999' },
    setup: () => mocked(loadCycleArtwork).mockResolvedValue(ARTWORKS[1]),
  },
  { name: 'allocation, text', route: route('(app)/allocation/[id]'), params: { id: '999' } },
  ...[0, 1, 2, 3].map((count) => ({
    name: `participant with ${count} Signatures`,
    route: route('(app)/user/[address]'),
    params: { address: '0xa169574d0d353e3010997a3e64846b7d1b2a63b6' },
    setup: () => mocked(loadParticipantArtworks).mockResolvedValue(ARTWORKS.slice(0, count)),
  })),
];

beforeEach(() => {
  mockCards.length = 0;
  for (const fn of [loadCycleArtwork, loadGesture, loadTokenArtwork, loadTokenInfo]) {
    mocked(fn).mockResolvedValue(null);
  }
  mocked(loadLatestArtworks).mockResolvedValue([]);
  mocked(loadParticipantArtworks).mockResolvedValue([]);
});

async function renderPlan(scenario: Scenario, locale: string) {
  scenario.setup?.();
  const image = require(scenario.route) as {
    default: (props: { params: Promise<Params> }) => Promise<unknown>;
  };
  await image.default({ params: Promise.resolve({ locale, ...scenario.params }) });
  const element = mockCards[mockCards.length - 1];
  if (!element) throw new Error(`${scenario.name} rendered no card`);
  return { props: element.props, plan: planCosmicOgCard(element.props) };
}

function stackBlocks(plan: OgCardPlan): TextBlock[] {
  const { eyebrow, title, subhead } = plan.stack;
  return [eyebrow, title, subhead].filter((block): block is TextBlock => Boolean(block));
}

describe.each(routing.locales)('%s share cards fit their boxes whole', (locale) => {
  it.each(SCENARIOS.map((scenario) => [scenario.name, scenario] as const))(
    '%s',
    async (_name, scenario) => {
      const { props, plan } = await renderPlan(scenario, locale);
      const box = OG_TEXT_BOXES[plan.layout];

      expect(plan.stack.title).toEqual(
        expect.objectContaining({ truncated: false, split: 'none' }),
      );
      if (props.eyebrow) expect(plan.stack.eyebrow?.lines).toHaveLength(1);
      if (props.subhead && plan.layout !== 'strip') {
        expect(plan.stack.subhead).toEqual(
          expect.objectContaining({ truncated: false, split: 'none' }),
        );
      }
      expect(plan.stack.height).toBeLessThanOrEqual(box.height);
      for (const block of stackBlocks(plan)) {
        expect(block.width).toBeLessThanOrEqual(box.width);
      }
      if (plan.layout === 'text') expect(plan.fact).toBe(props.fact ?? '');
      if (plan.layout === 'plate' && plan.label) expect(plan.label.truncated).toBe(false);
    },
  );
});

// Owner-given names are the one text a card does not control.
describe('a token whose owner gave it a very long name', () => {
  const name = 'The Slow Unfolding of Three Bodies Across an Unremarkable Tuesday Afternoon Sky';

  it.each(['en', 'uk', 'ja'])(
    '%s: the title is cut to its lines with an ellipsis',
    async (locale) => {
      const { plan } = await renderPlan(
        {
          name: 'long name',
          route: route('(app)/detail/[id]'),
          params: { id: '999998' },
          setup: () => mocked(loadTokenArtwork).mockResolvedValue({ ...ARTWORKS[1], name }),
        },
        locale,
      );
      expect(plan.layout).toBe('plate');
      expect(plan.stack.title.truncated).toBe(true);
      expect(plan.stack.title.lines.length).toBeLessThanOrEqual(4);
      expect(plan.stack.title.lines.at(-1)).toMatch(/(\.\.\.|…)$/);
      expect(plan.stack.title.width).toBeLessThanOrEqual(OG_TEXT_BOXES.plate.width);
      expect(plan.stack.height).toBeLessThanOrEqual(OG_TEXT_BOXES.plate.height);
    },
  );
});
