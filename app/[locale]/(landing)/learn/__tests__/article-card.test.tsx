/**
 * @jest-environment node
 */
import type { ReactElement } from 'react';

import { getLearnContent, getLearnSlugs } from '@/content/learn';

import { routing } from '@/i18n/routing';
import type { CosmicOgCardProps } from '@/lib/og/CosmicOgCard';
import { getOgCopy } from '@/lib/og/copy';

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

  it.each(routing.locales)(
    '%s: draws the guide title, or the brand line where the card faces lack a glyph',
    async (locale) => {
      const slug = 'what-is-cosmic-signature';
      await learnArticleCard(locale, slug);
      const card = lastCard();
      const article = getLearnContent(locale).articles.find((entry) => entry.slug === slug)!;
      expect([article.h1, getOgCopy(locale, 'default').title]).toContain(card.title);
      expect(card.art).toHaveLength(1);
    },
  );

  it('falls back to the brand card for an unknown guide', async () => {
    await learnArticleCard('en', 'no-such-guide');
    expect(lastCard().title).toBe(getOgCopy('en', 'default').title);
  });

  it('gives the white paper and the quiz cards of their own', async () => {
    const whitePaper = require('../../white-paper/opengraph-image') as {
      default: (props: { params: Promise<{ locale: string }> }) => Promise<unknown>;
    };
    await whitePaper.default({ params: Promise.resolve({ locale: 'en' }) });
    expect(lastCard()).toEqual(
      expect.objectContaining({
        eyebrow: 'WHITE PAPER',
        title: 'Cosmic Signature',
        subhead: 'A Procedural On-Chain Art Protocol on Arbitrum',
        art: [expect.objectContaining({ label: 'Signature #000024 · Cycle 1' })],
      }),
    );

    const quiz = require('../../quiz/opengraph-image') as typeof whitePaper;
    await quiz.default({ params: Promise.resolve({ locale: 'en' }) });
    expect(lastCard().title).toBe('How well do you know Cosmic Signature?');
  });
});
