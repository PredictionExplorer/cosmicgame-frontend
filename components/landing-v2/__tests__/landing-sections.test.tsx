import { render, screen, within } from '@testing-library/react';

import { getLandingContent, landingContentEn } from '@/content/landing';
import { protocolFacts } from '@/content/protocol-facts';

import { routing } from '@/i18n/routing';
import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';
import { Anchoring } from '@/components/landing-v2/Anchoring';
import { ClosingBand } from '@/components/landing-v2/ClosingBand';
import { pickCollection } from '@/components/landing-v2/CollectionPlates';
import { CosmicCouncil } from '@/components/landing-v2/CosmicCouncil';
import { LandingFAQ } from '@/components/landing-v2/LandingFAQ';
import { PublicGoods } from '@/components/landing-v2/PublicGoods';
import { TheArt } from '@/components/landing-v2/TheArt';
import { TheCycle } from '@/components/landing-v2/TheCycle';
import { Verifiability } from '@/components/landing-v2/Verifiability';
import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';
import {
  useLandingShowcaseTokens,
  type LandingShowcase,
} from '@/components/landing-v2/useLandingShowcaseTokens';

jest.mock('@/components/landing-v2/useLandingShowcaseTokens', () => ({
  ...jest.requireActual('@/components/landing-v2/useLandingShowcaseTokens'),
  useLandingShowcaseTokens: jest.fn(),
}));

const mockShowcase = jest.mocked(useLandingShowcaseTokens);
const content = landingContentEn;

function collection(count: number, anchored: readonly number[] = []): LandingShowcase {
  return {
    status: 'ready',
    tokens: Array.from({ length: count }, (_, index) => {
      const TokenId = 60 - index;
      return { TokenId, Seed: `seed${TokenId}`, RoundNum: 2, Staked: anchored.includes(TokenId) };
    }),
  };
}

const plateIds = (list: HTMLElement) =>
  within(list)
    .getAllByRole('link')
    .map((link) => link.getAttribute('href')?.split('/').pop());

describe('landing sections', () => {
  beforeEach(() => {
    mockShowcase.mockReturnValue({ tokens: [], status: 'loading' });
  });

  it('never start hidden: no section content renders at opacity 0 before JavaScript', () => {
    // Regression (F056): framer-motion `initial={{ opacity: 0 }}` reveals
    // left the Allocation Tracks, Anchoring, Public Goods, Council and
    // Verifiability blank until an IntersectionObserver fired.
    const sections = [
      <TheArt key="art" art={content.art} />,
      <TheCycle key="cycle" cycle={content.cycle} />,
      <AllocationTracks key="tracks" tracks={content.tracks} />,
      <PublicGoods key="pg" publicGoods={content.publicGoods} />,
      <Anchoring key="anchoring" anchoring={content.anchoring} showcase={content.art.showcase} />,
      <CosmicCouncil key="council" council={content.council} />,
      <Verifiability key="verifiability" verifiability={content.verifiability} />,
      <LandingFAQ key="faq" faq={content.faq} />,
      <ClosingBand key="closing" closing={content.closing} showcase={content.art.showcase} />,
    ];
    for (const section of sections) {
      const { container, unmount } = render(section);
      for (const element of Array.from(container.querySelectorAll<HTMLElement>('*'))) {
        expect(element.style.opacity === '' || Number(element.style.opacity) > 0).toBe(true);
        expect(element.getAttribute('class') ?? '').not.toMatch(/(?:^|\s)opacity-0(?:\s|$)/);
      }
      unmount();
    }
  });

  describe('<PublicGoods />', () => {
    it('shows the one figure with its facts, and the tax note as a footnote', () => {
      render(<PublicGoods publicGoods={content.publicGoods} />);
      expect(screen.getByText(content.publicGoods.card.percentage)).toBeInTheDocument();
      for (const row of content.publicGoods.card.tableRows) {
        expect(screen.getByText(row.label).nextSibling).toHaveTextContent(row.value);
      }
      expect(screen.getByText(content.publicGoods.disclaimer)).toHaveClass('type-caption');
    });

    it('states the share once, in the figure, in every locale', () => {
      // Regression: the heading, the body, the figure and its caption all said "7%".
      const share = new RegExp(`${protocolFacts.publicGoodsPercentage}\\s?%`, 'g');
      for (const locale of routing.locales) {
        const { container, unmount } = render(
          <PublicGoods publicGoods={getLandingContent(locale).publicGoods} />,
        );
        expect({ locale, count: container.textContent?.match(share)?.length }).toEqual({
          locale,
          count: 1,
        });
        unmount();
      }
    });

    it('opens Protocol Guild in a new tab, announced', () => {
      render(<PublicGoods publicGoods={content.publicGoods} />);
      const link = screen.getByRole('link', { name: new RegExp(content.publicGoods.cta.label) });
      expect(link).toHaveAttribute('href', content.publicGoods.cta.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('pickCollection', () => {
    it('keeps anchored Signatures only, including a featured one the collection reports', () => {
      const showcase: LandingShowcase = {
        status: 'ready',
        tokens: [
          { TokenId: 30, Seed: 'aa', Staked: false },
          { TokenId: 24, Seed: FEATURED_LANDING_ART[1].Seed, Staked: true },
          { TokenId: 23, Seed: FEATURED_LANDING_ART[0].Seed, Staked: false },
        ],
      };
      expect(pickCollection(showcase, 'anchored', 3).map((art) => art?.TokenId)).toEqual([24]);
      expect(pickCollection(showcase, 'recent', 2).map((art) => art?.TokenId)).toEqual([30, 24]);
    });

    it('never presents the bundled featured pieces as the newest on their own authority', () => {
      const answered: LandingShowcase = {
        status: 'ready',
        tokens: [{ TokenId: 30, Seed: 'aa', Staked: false }],
      };
      expect(pickCollection(answered, 'recent', 6).map((art) => art?.TokenId)).toEqual([30]);
      expect(pickCollection({ status: 'ready', tokens: [] }, 'recent', 6)).toEqual([]);
    });

    it('leaves out the plates another strip already shows', () => {
      const showcase: LandingShowcase = {
        status: 'ready',
        tokens: [31, 30, 29, 28].map((id) => ({ TokenId: id, Seed: `s${id}`, Staked: id > 29 })),
      };
      const anchored = pickCollection(showcase, 'anchored', 3).map((art) => art!.TokenId);
      expect(anchored).toEqual([31, 30]);
      expect(
        pickCollection(showcase, 'recent', 6, new Set(anchored)).map((art) => art?.TokenId),
      ).toEqual([29, 28]);
    });

    it('waits at the full count while loading and shows nothing when the read fails', () => {
      expect(pickCollection({ tokens: [], status: 'loading' }, 'anchored', 3)).toEqual([
        null,
        null,
        null,
      ]);
      expect(pickCollection({ tokens: [], status: 'failed' }, 'recent', 6)).toEqual([]);
    });
  });

  describe('<Anchoring />', () => {
    const renderAnchoring = () =>
      render(<Anchoring anchoring={content.anchoring} showcase={content.art.showcase} />);

    it('shows Signatures that are anchored right now, newest first', () => {
      mockShowcase.mockReturnValue(collection(8, [58, 55, 54, 53]));
      renderAnchoring();
      expect(plateIds(screen.getByTestId('collection-anchored'))).toEqual(['58', '55', '54']);
    });

    it('never tops the anchored plates up with pieces that are not anchored', () => {
      // Regression: fewer than three anchored pieces were padded with the
      // newest imprints, presented as anchored.
      mockShowcase.mockReturnValue(collection(8, [55]));
      renderAnchoring();
      const strip = screen.getByTestId('collection-anchored');
      expect(plateIds(strip)).toEqual(['55']);
      expect(within(strip).queryAllByTestId('pending-plate')).toHaveLength(0);
    });

    it('waits with skeleton plates, not bundled art, until the collection answers', () => {
      // Regression: the bundled #24 and #23 stood in as "anchored" pieces.
      renderAnchoring();
      const strip = screen.getByTestId('collection-anchored');
      expect(within(strip).queryAllByRole('link')).toHaveLength(0);
      expect(within(strip).getAllByTestId('pending-plate')).toHaveLength(3);
    });

    it('drops the plates, keeping the words, when nothing anchored can be shown', () => {
      mockShowcase.mockReturnValue({ tokens: [], status: 'failed' });
      const { unmount } = renderAnchoring();
      expect(screen.queryByTestId('collection-anchored')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: content.anchoring.heading })).toBeInTheDocument();
      unmount();

      mockShowcase.mockReturnValue(collection(8));
      renderAnchoring();
      expect(screen.queryByTestId('collection-anchored')).not.toBeInTheDocument();
    });

    it('keeps the rule to two sentences and glosses Random Walk NFTs', () => {
      renderAnchoring();
      expect(content.anchoring.body.match(/\.(\s|$)/g)).toHaveLength(2);
      expect(screen.getByText(/from the companion collection/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: content.anchoring.cta.label })).toHaveAttribute(
        'href',
        'https://app.cosmicsignature.com/anchoring',
      );
    });
  });

  describe('<Verifiability />', () => {
    it('links every claim to the page that proves it', () => {
      render(<Verifiability verifiability={content.verifiability} />);
      const evidence = screen.getByRole('list', { name: content.verifiability.evidenceLabel });
      const hrefs = within(evidence)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'));
      expect(hrefs).toEqual([
        'https://app.cosmicsignature.com/contracts',
        'https://app.cosmicsignature.com/code',
        'https://app.cosmicsignature.com/audits',
        'https://app.cosmicsignature.com/security',
      ]);
    });

    it('names the repositories, not "this repository", where it scopes the licence', () => {
      const cc0 = content.verifiability.pillars[0]!;
      expect(cc0.title).toBe('CC0 1.0');
      expect(cc0.body).toMatch(/Cosmic Signature repositories/);
      expect(cc0.body).not.toMatch(/this repository/);
    });

    it('opens with one sentence and leaves the licence to the CC0 pillar', () => {
      expect(content.verifiability.body.split(/(?<=\.)\s/)).toHaveLength(1);
      expect(content.verifiability.body).not.toMatch(/CC0|license/i);
    });
  });

  describe('<CosmicCouncil />', () => {
    it('keeps the intro to one line and lets the rules carry the numbers', () => {
      render(<CosmicCouncil council={content.council} />);
      expect(content.council.body).not.toMatch(/\d/);
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText(/at least 100 CST/)).toBeInTheDocument();
    });
  });

  describe('<ClosingBand />', () => {
    it('ends the page with the newest Signatures and a way to make a gesture', () => {
      mockShowcase.mockReturnValue(collection(8));
      render(<ClosingBand closing={content.closing} showcase={content.art.showcase} />);
      expect(plateIds(screen.getByTestId('collection-recent'))).toEqual([
        '60',
        '59',
        '58',
        '57',
        '56',
        '55',
      ]);
      // Not a second "Open the app": the sticky header offers that one right above.
      expect(screen.queryByRole('link', { name: 'nav.cta.openApp' })).not.toBeInTheDocument();
      const gesture = screen.getByRole('link', { name: content.cycle.gestureCta.label });
      expect(gesture).toHaveAttribute('href', 'https://app.cosmicsignature.com#make-gesture');
      // Navigation, not a transaction: the section call to action's solid lg,
      // the same size as The Cycle's (the hero alone takes the gradient at xl).
      expect(gesture.className).not.toMatch(/bg-signature-gradient/);
      expect(gesture.className).not.toMatch(/\bh-14\b/);
      expect(screen.getByRole('link', { name: content.closing.galleryCta.label })).toHaveAttribute(
        'href',
        'https://app.cosmicsignature.com/gallery',
      );
    });

    it('holds six skeleton plates until the collection answers', () => {
      render(<ClosingBand closing={content.closing} showcase={content.art.showcase} />);
      const strip = screen.getByTestId('collection-recent');
      expect(within(strip).queryAllByRole('link')).toHaveLength(0);
      expect(within(strip).getAllByTestId('pending-plate')).toHaveLength(6);
    });

    it('drops the strip, not the way back, when the collection cannot be read', () => {
      // Regression: two bundled plates sat in a six-plate grid with empty columns.
      mockShowcase.mockReturnValue({ tokens: [], status: 'failed' });
      render(<ClosingBand closing={content.closing} showcase={content.art.showcase} />);
      expect(screen.queryByTestId('collection-recent')).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: content.closing.galleryCta.label }),
      ).toBeInTheDocument();
    });
  });
});
