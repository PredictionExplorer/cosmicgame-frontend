import type { DashboardInfo } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

import { AllocationTracksBoard } from '../AllocationTracksBoard';

function makeDashboard(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    CurRoundNum: 2,
    PrizeAmountEth: 8.0735,
    RaffleAmountEth: 1.2918,
    StakingAmountEth: 1.9376,
    CosmicGameBalanceEth: 32.2939,
    PrizePercentage: 25,
    ChronoWarriorPercentage: 8,
    RafflePercentage: 4,
    StakingPercentage: 6,
    CharityPercentage: 7,
    NumRaffleEthWinnersBidding: 3,
    NumRaffleNFTWinnersBidding: 10,
    NumRaffleNFTWinnersStakingRWalk: 10,
    ...overrides,
  } as DashboardInfo;
}

function visibleText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[hidden], .sr-only').forEach((node) => node.remove());
  return (clone.textContent ?? '').replace(/\s+/g, ' ');
}

describe('AllocationTracksBoard', () => {
  it('is the page’s one allocation view: an h2 over two groups of tracks', () => {
    render(<AllocationTracksBoard data={makeDashboard()} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'home.deck.board.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(['home.deck.board.ethGroup', 'home.deck.board.fixedGroup']);
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
  });

  it('takes the Gesture Chat’s frame beside it, so the two headings share a baseline', () => {
    render(<AllocationTracksBoard data={makeDashboard()} />);
    // The chat's own frame: a rule over 1rem (GestureMessageChat's root and header).
    expect(screen.getByTestId('allocation-tracks-board')).toHaveClass(
      'border-t',
      'border-rule',
      'pt-4',
    );
  });

  it('gives ETH Stellar Selection its total, with the per-recipient amount as detail', () => {
    render(<AllocationTracksBoard data={makeDashboard()} />);

    const row = screen.getByTestId('track-row-stellar-eth');
    expect(visibleText(row)).toContain('1.2918 ETH');
    expect(visibleText(row)).toContain('home.allocation.recipientCount(count=3)');
    expect(visibleText(row)).toContain('home.allocation.amounts.ethEach(amount=0.4306)');
  });

  it('says "each" where a CST and NFT track has several recipients', () => {
    render(<AllocationTracksBoard data={makeDashboard({ NumRaffleNFTWinnersStakingRWalk: 1 })} />);

    // Ten recipients each receive the whole 1,000 CST and an NFT.
    const stellar = screen.getByTestId('track-row-stellar-nft');
    expect(visibleText(stellar)).toContain('home.deck.board.cstPlusNftEach');
    expect(visibleText(stellar)).toContain('home.allocation.recipientCount(count=10)');
    // A single recipient reads the plain allocation.
    for (const key of ['endurance', 'final-cst', 'rwlk-anchor']) {
      const row = screen.getByTestId(`track-row-${key}`);
      expect(visibleText(row)).toContain('home.deck.board.cstPlusNft');
      expect(visibleText(row)).not.toContain('cstPlusNftEach');
    }
  });

  it('shows each ETH track’s share of the Cycle Reserve, down to the next-cycle seed', () => {
    render(<AllocationTracksBoard data={makeDashboard()} />);

    expect(visibleText(screen.getByTestId('track-row-signature'))).toContain(
      'home.observatory.ribbon.percentOfReserve(percent=25)',
    );
    const seed = screen.getByTestId('track-row-next-cycle');
    expect(visibleText(seed)).toContain('home.observatory.ribbon.percentOfReserve(percent=50)');
    expect(visibleText(seed)).toMatch(/16\.14\d{2} ETH/);
    expect(screen.getByTestId('reserve-split-bar').children).toHaveLength(6);
  });

  it('draws no split bar when a share is unknown, rather than a partial one', () => {
    render(<AllocationTracksBoard data={makeDashboard({ StakingPercentage: undefined })} />);

    expect(screen.queryByTestId('reserve-split-bar')).not.toBeInTheDocument();
  });

  it('explains each track on its name instead of an info icon', () => {
    render(<AllocationTracksBoard data={makeDashboard()} />);

    const row = screen.getByTestId('track-row-public-goods');
    expect(
      within(row).getByRole('button', { name: 'home.allocation.cards.publicGoods.name' }),
    ).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /More information/ })).toBeNull();
  });

  it('marks ETH amounts unknown before the dashboard arrives, never 0', () => {
    render(<AllocationTracksBoard data={null} />);

    expect(visibleText(screen.getByTestId('track-row-signature'))).not.toContain('0.0000');
    expect(visibleText(screen.getByTestId('track-row-signature'))).toContain('—');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationTracksBoard data={makeDashboard()} />);
    await checkA11y(container);
  });
});
