import { protocolFacts } from '@/content/protocol-facts';

import { render, screen, within, checkA11y } from '@/test-utils';

import { AllocationLedger } from '../AllocationLedger';

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    PrizeAmountEth: 1.5,
    RaffleAmountEth: 0.4,
    StakingAmountEth: 0.6,
    CosmicGameBalanceEth: 10,
    PrizePercentage: 25,
    ChronoWarriorPercentage: 8,
    RafflePercentage: 4,
    StakingPercentage: 6,
    CharityPercentage: 7,
    NumRaffleEthWinnersBidding: 3,
    NumRaffleNFTWinnersBidding: 10,
    NumRaffleNFTWinnersStakingRWalk: 10,
    ...overrides,
  }) as never;

const NBSP = String.fromCharCode(160);

describe('AllocationLedger', () => {
  it('renders every allocation amount in one ledger, the unit bound to its figure', () => {
    render(<AllocationLedger data={makeData()} />);

    const expected = [
      ['signature', `1.5000${NBSP}ETH`],
      ['chrono', `0.8000${NBSP}ETH`],
      ['endurance', 'home.observatory.standings.cstPlusNft'],
      ['stellar-eth', `0.4000${NBSP}ETH`],
      ['stellar-nft', 'home.observatory.standings.cstPlusNft'],
      ['cosmic-anchor', `0.6000${NBSP}ETH`],
      ['rwlk-anchor', 'home.observatory.standings.cstPlusNft'],
      ['public-goods', `0.7000${NBSP}ETH`],
      ['next-cycle', `5.0000${NBSP}ETH`],
    ] as const;

    for (const [key, amount] of expected) {
      expect(screen.getByTestId(`ledger-track-${key}`).textContent).toContain(amount);
    }
  });

  it('names its region and links to the full cycle breakdown without duplicating the disclosure anchor', () => {
    render(<AllocationLedger data={makeData()} />);

    expect(screen.getByRole('region', { name: 'home.observatory.ribbon.title' })).toBe(
      screen.getByTestId('allocation-ledger'),
    );
    expect(screen.getByTestId('allocation-ledger')).not.toHaveAttribute(
      'id',
      'allocation-breakdown',
    );
    expect(
      screen.getByRole('link', { name: /home\.observatory\.ribbon\.fullBreakdown/ }),
    ).toHaveAttribute('href', '/current-cycle#allocation-breakdown');
  });

  it('links high-context tracks by name, with the definition beside the link rather than in it', () => {
    render(<AllocationLedger data={makeData()} />);

    for (const [key, href] of [
      ['signature', '/current-cycle'],
      ['chrono', '/faq#chrono-warrior'],
      ['public-goods', '/public-goods-contributions-cg'],
    ] as const) {
      const track = screen.getByTestId(`ledger-track-${key}`);
      const link = within(track).getByRole('link');
      expect(link).toHaveAttribute('href', href);
      // An explanation button nested inside a link is not operable on its own.
      expect(link.querySelector('button')).toBeNull();
      expect(within(track).getByRole('button', { name: /more information/i })).toBeVisible();
    }
    expect(within(screen.getByTestId('ledger-track-stellar-eth')).queryByRole('link')).toBeNull();
  });

  it('sets the tracks as a ruled list in one, two or three columns', () => {
    render(<AllocationLedger data={makeData()} />);

    const list = screen.getByTestId('allocation-ledger-list');
    expect(list).toHaveClass('grid', 'sm:grid-cols-2', 'xl:grid-cols-3');
    expect(list).not.toHaveClass('overflow-x-auto');
    for (const row of within(list).getAllByRole('listitem')) {
      expect(row).toHaveClass('border-t', 'border-rule-faint');
    }
  });

  it('omits the next-cycle amount when the live percentage set is incomplete', () => {
    render(<AllocationLedger data={makeData({ RafflePercentage: undefined })} />);
    expect(screen.queryByTestId('ledger-track-next-cycle')).not.toBeInTheDocument();
  });

  it('never tells anyone Public Goods receive 0% while the share is unknown', () => {
    const { rerender } = render(<AllocationLedger data={null} />);
    const info = () =>
      within(screen.getByTestId('ledger-track-public-goods')).getByRole('button', {
        name: /home\.allocation\.cards\.publicGoods\.name/,
      });
    // The documented share until the dashboard reports the live one.
    expect(info()).toHaveAccessibleDescription(
      `home.allocation.cards.publicGoods.tooltip(percent=${protocolFacts.publicGoodsPercentage})`,
    );
    rerender(<AllocationLedger data={makeData({ CharityPercentage: 9 })} />);
    expect(info()).toHaveAccessibleDescription(
      'home.allocation.cards.publicGoods.tooltip(percent=9)',
    );
  });

  it('reads amounts as pending, never as 0 ETH, before the dashboard arrives', () => {
    render(<AllocationLedger data={null} />);
    const signature = screen.getByTestId('ledger-track-signature');
    expect(signature).not.toHaveTextContent(/0\.0000/);
    expect(within(signature).getByText('common.status.loadingEllipsis')).toBeInTheDocument();
    expect(screen.queryByTestId('ledger-track-next-cycle')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationLedger data={makeData()} />);
    await checkA11y(container);
  });
});
