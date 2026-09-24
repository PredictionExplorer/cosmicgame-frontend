import { render, screen, within } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';
import { Anchoring } from '@/components/landing-v2/Anchoring';
import { ClosingBand } from '@/components/landing-v2/ClosingBand';
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
const UNAVAILABLE = content.hero.art.formingLabel;

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
      <TheArt key="art" art={content.art} unavailableLabel={UNAVAILABLE} />,
      <TheCycle key="cycle" cycle={content.cycle} />,
      <AllocationTracks key="tracks" tracks={content.tracks} />,
      <PublicGoods key="pg" publicGoods={content.publicGoods} />,
      <Anchoring
        key="anchoring"
        anchoring={content.anchoring}
        showcase={content.art.showcase}
        unavailableLabel={UNAVAILABLE}
      />,
      <CosmicCouncil key="council" council={content.council} />,
      <Verifiability key="verifiability" verifiability={content.verifiability} />,
      <LandingFAQ key="faq" faq={content.faq} />,
      <ClosingBand
        key="closing"
        closing={content.closing}
        showcase={content.art.showcase}
        unavailableLabel={UNAVAILABLE}
      />,
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

    it('opens Protocol Guild in a new tab, announced', () => {
      render(<PublicGoods publicGoods={content.publicGoods} />);
      const link = screen.getByRole('link', { name: new RegExp(content.publicGoods.cta.label) });
      expect(link).toHaveAttribute('href', content.publicGoods.cta.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('<Anchoring />', () => {
    it('shows Signatures that are anchored right now, newest first', () => {
      mockShowcase.mockReturnValue(collection(8, [55, 54]));
      render(
        <Anchoring
          anchoring={content.anchoring}
          showcase={content.art.showcase}
          unavailableLabel={UNAVAILABLE}
        />,
      );
      // The two anchored pieces lead; the newest piece fills the third place.
      expect(plateIds(screen.getByTestId('collection-anchored'))).toEqual(['55', '54', '60']);
    });

    it('keeps the rule to two sentences and glosses Random Walk NFTs', () => {
      render(
        <Anchoring
          anchoring={content.anchoring}
          showcase={content.art.showcase}
          unavailableLabel={UNAVAILABLE}
        />,
      );
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

    it('names the repositories, not "this repository"', () => {
      expect(content.verifiability.body).toMatch(/Cosmic Signature repositories/);
      expect(content.verifiability.body).not.toMatch(/this repository/);
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
    it('ends the page with the newest Signatures and the way back into the app', () => {
      mockShowcase.mockReturnValue(collection(8));
      render(
        <ClosingBand
          closing={content.closing}
          showcase={content.art.showcase}
          unavailableLabel={UNAVAILABLE}
        />,
      );
      expect(plateIds(screen.getByTestId('collection-recent'))).toEqual([
        '60',
        '59',
        '58',
        '57',
        '56',
        '55',
      ]);
      const app = screen.getByRole('link', { name: 'nav.cta.openApp' });
      expect(app).toHaveAttribute('href', 'https://app.cosmicsignature.com');
      expect(app.className).toMatch(/bg-signature-gradient/);
      expect(screen.getByRole('link', { name: content.closing.galleryCta.label })).toHaveAttribute(
        'href',
        'https://app.cosmicsignature.com/gallery',
      );
    });

    it('shows the bundled pieces and waiting plates before the collection answers', () => {
      render(
        <ClosingBand
          closing={content.closing}
          showcase={content.art.showcase}
          unavailableLabel={UNAVAILABLE}
        />,
      );
      const strip = screen.getByTestId('collection-recent');
      expect(plateIds(strip)).toEqual(
        [...FEATURED_LANDING_ART].reverse().map((art) => String(art.TokenId)),
      );
      expect(within(strip).getAllByTestId('pending-plate')).toHaveLength(4);
    });
  });
});
