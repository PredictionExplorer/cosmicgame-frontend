import { render, screen, within } from '@testing-library/react';

import { landingContentEn, landingContentZh } from '@/content/landing';
import { protocolFacts } from '@/content/protocol-facts';

import { ALLOCATION_TRACK_IDS } from '@/config/allocationTracks';
import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';

const tracks = landingContentEn.tracks;

describe('<AllocationTracks />', () => {
  it('renders the section heading, eyebrow and anchor', () => {
    const { container } = render(<AllocationTracks tracks={tracks} />);
    expect(screen.getByText(tracks.eyebrow)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(tracks.heading);
    expect(container.querySelector('#tracks')).not.toBeNull();
  });

  it('draws the ETH tracks as one bar to scale against 100%, in the app’s chart order', () => {
    render(<AllocationTracks tracks={tracks} />);
    const segments = Array.from(
      screen.getByTestId('allocation-bar').querySelectorAll<HTMLElement>('[data-track]'),
    );
    expect(segments.map((segment) => segment.dataset.track)).toEqual([...ALLOCATION_TRACK_IDS]);
    const shares = segments.map((segment) => Number(segment.dataset.share));
    expect(shares.reduce((total, share) => total + share, 0)).toBe(100);
    expect(shares).toEqual([
      protocolFacts.mainEthPercentage,
      protocolFacts.chronoWarriorEthPercentage,
      protocolFacts.stellarSelectionEthPercentage,
      protocolFacts.anchorDistributionPercentage,
      protocolFacts.publicGoodsPercentage,
      protocolFacts.compoundingReservePercentage,
    ]);
    // Decorative: the legend carries every figure for assistive technology.
    expect(screen.getByTestId('allocation-bar')).toHaveAttribute('aria-hidden', 'true');
  });

  it('lists every ETH track with its share and purpose', () => {
    render(<AllocationTracks tracks={tracks} />);
    const legend = screen.getByRole('list', { name: tracks.ethLabel });
    for (const track of tracks.eth) {
      const item = within(legend)
        .getByRole('heading', { level: 4, name: track.title })
        .closest('li')!;
      expect(item).toHaveTextContent(track.percent);
      expect(item).toHaveTextContent(track.body);
    }
    expect(within(legend).getByText('25%')).toBeInTheDocument();
    expect(within(legend).getByText('7%')).toBeInTheDocument();
    expect(within(legend).getByText('~50%')).toBeInTheDocument();
  });

  it('lists the four fixed CST and NFT allocations apart from the ETH split', () => {
    render(<AllocationTracks tracks={tracks} />);
    const fixed = screen.getByRole('list', { name: tracks.fixedLabel });
    expect(within(fixed).getAllByRole('listitem')).toHaveLength(4);
    expect(within(fixed).getAllByText('1,000 CST')).toHaveLength(2);
    expect(within(fixed).getAllByText('10 NFTs')).toHaveLength(2);
  });

  it('gives no track a promotional treatment', () => {
    // Leading with the biggest single-recipient share in gradient type read
    // like a top-reward promo; every share is set the same way now.
    const { container } = render(<AllocationTracks tracks={tracks} />);
    expect(container.querySelector('.text-gradient-signature')).toBeNull();
  });

  it('formats the shares per locale and keeps the same split in every language', () => {
    expect(landingContentZh.tracks.eth.map((track) => track.share)).toEqual(
      tracks.eth.map((track) => track.share),
    );
    expect(landingContentZh.tracks.eth.at(-1)?.percent).toBe('约 50%');
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<AllocationTracks tracks={tracks} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
    expect(text).not.toMatch(/\braffle(?:s)?\b/i);
    expect(text).not.toMatch(/\bwinner(?:s)?\b/i);
    expect(text).not.toMatch(/\byield\b/i);
    expect(text).not.toMatch(/\bcharit(?:y|able)\b/i);
  });
});
