/**
 * @jest-environment node
 */
import type { ReactElement } from 'react';

import { getLearnSlugs } from '@/content/learn';

import { routing } from '@/i18n/routing';
import { OG_TEXT_BOXES, planCosmicOgCard, type CosmicOgCardProps } from '@/lib/og/CosmicOgCard';
import { getOgCopy } from '@/lib/og/copy';

import { readingShareCard } from '../../readingCard';
import {
  aboutReadingCard,
  learnArticleReadingCard,
  quizReadingCard,
  readingCards,
  whitePaperReadingCard,
  type ReadingCard,
} from '../../readingCardCopy';
import { learnArticleCard, learnArticleCardAlt } from '../articleCard';

/** next/og cannot rasterize under jest: capture the card element instead. */
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
  loadLatestArtworks: jest.fn(async () => []),
  loadTokenInfo: jest.fn(async () => null),
}));

const lastCard = () => mockCards[mockCards.length - 1]!.props;

type ImageRoute = {
  default: (props: { params: Promise<{ locale: string }> }) => Promise<unknown>;
  generateImageMetadata: (props: {
    params: Promise<{ locale: string }>;
  }) => Promise<Array<{ alt: string }>>;
};

describe('Learn guide share cards', () => {
  beforeEach(() => {
    mockCards.length = 0;
  });

  it('shows the guide’s own Signature and title', async () => {
    await learnArticleCard('en', 'how-gestures-work');
    const card = lastCard();
    expect(card.title).toBe('How gestures work in Cosmic Signature');
    expect(card.eyebrow).toBe('LEARN');
    expect(card.fact).toBe('Guide 3 of 11');
    expect(card.domain).toBe('cosmicsignature.com');
    expect(card.art).toEqual([
      {
        src: expect.stringMatching(/^data:image\/png;base64,/),
        label: 'Signature #000014 · Cycle 0',
      },
    ]);
    expect(learnArticleCardAlt('en', 'how-gestures-work')).toBe(
      'How gestures work in Cosmic Signature',
    );
  });

  it('gives every guide a different plate', async () => {
    const plates = new Set<string>();
    for (const slug of getLearnSlugs()) {
      await learnArticleCard('en', slug);
      plates.add(lastCard().art?.[0]?.label ?? '');
    }
    expect(plates.size).toBe(getLearnSlugs().length);
  });

  it('falls back to the brand card for an unknown guide', async () => {
    await learnArticleCard('en', 'no-such-guide');
    expect(lastCard().title).toBe(getOgCopy('en', 'default').title);
    expect(learnArticleCardAlt('en', 'no-such-guide')).toBe(getOgCopy('en', 'default').alt);
  });

  it('gives the white paper, the quiz and About cards of their own', async () => {
    const whitePaper = require('../../white-paper/opengraph-image') as ImageRoute;
    await whitePaper.default({ params: Promise.resolve({ locale: 'en' }) });
    expect(lastCard()).toEqual(
      expect.objectContaining({
        eyebrow: 'WHITE PAPER',
        title: 'Cosmic Signature',
        subhead: 'A Procedural On-Chain Art Protocol on Arbitrum',
        art: [expect.objectContaining({ label: 'Signature #000024 · Cycle 1' })],
      }),
    );

    const quiz = require('../../quiz/opengraph-image') as ImageRoute;
    await quiz.default({ params: Promise.resolve({ locale: 'en' }) });
    expect(lastCard().title).toBe(quizReadingCard('en').copy.title);

    const about = require('../../about/opengraph-image') as ImageRoute;
    await about.default({ params: Promise.resolve({ locale: 'en' }) });
    expect(lastCard()).toEqual(
      expect.objectContaining({
        title: aboutReadingCard('en').copy.title,
        art: [expect.objectContaining({ label: 'Signature #000002 · Cycle 0' })],
      }),
    );
  });

  it.each([
    ['about', aboutReadingCard],
    ['quiz', quizReadingCard],
    ['white-paper', whitePaperReadingCard],
  ] as const)('%s: the image metadata alt is the copy the card draws', async (path, cardOf) => {
    const image = require(`../../${path}/opengraph-image`) as ImageRoute;
    for (const locale of routing.locales) {
      const [metadata] = await image.generateImageMetadata({ params: Promise.resolve({ locale }) });
      expect(metadata?.alt).toBe(cardOf(locale).alt);
    }
  });
});

/**
 * V136 regression guard: the card faces are subsets, cut from the reading
 * cards' own copy (./readingCardCopy.ts), so every locale's cards draw their
 * page's title, never the brand fallback, and fit their boxes whole.
 */
describe.each(routing.locales)('%s reading share cards', (locale) => {
  const cards = readingCards(locale).map((card) => [card.copy.title, card] as const);

  it('publishes a card for About, the quiz, the white paper and every guide', () => {
    expect(cards).toHaveLength(3 + getLearnSlugs().length);
    for (const slug of getLearnSlugs()) {
      expect(learnArticleReadingCard(locale, slug)).not.toBeNull();
    }
  });

  it.each(cards)('draws its own copy and fits: %s', async (_title, card: ReadingCard) => {
    await readingShareCard(locale, card);
    const props = lastCard();
    expect(props.title).toBe(card.copy.title);
    expect(props.subhead).toBe(card.copy.subhead);
    expect(props.fact).toBe(card.copy.fact);
    // The alt text names what the card draws: its own title.
    expect(card.alt.startsWith(props.title ?? '')).toBe(true);

    const plan = planCosmicOgCard(props);
    const box = OG_TEXT_BOXES[plan.layout];
    expect(plan.stack.title).toEqual(expect.objectContaining({ truncated: false, split: 'none' }));
    expect(plan.stack.eyebrow?.lines).toHaveLength(1);
    if (plan.stack.subhead) {
      expect(plan.stack.subhead).toEqual(expect.objectContaining({ truncated: false }));
    }
    expect(plan.stack.height).toBeLessThanOrEqual(box.height);
  });
});
