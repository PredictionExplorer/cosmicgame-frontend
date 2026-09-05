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

describe('AllocationLedger', () => {
  it('renders every allocation amount in one ledger', () => {
    render(<AllocationLedger data={makeData()} />);

    const expected = [
      ['signature', 'home.allocation.amounts.eth(amount=1.5000)'],
      ['chrono', 'home.allocation.amounts.eth(amount=0.8000)'],
      ['endurance', 'home.observatory.standings.cstPlusNft'],
      ['stellar-eth', 'home.allocation.amounts.eth(amount=0.4000)'],
      ['stellar-nft', 'home.observatory.standings.cstPlusNft'],
      ['cosmic-anchor', 'home.allocation.amounts.eth(amount=0.6000)'],
      ['rwlk-anchor', 'home.observatory.standings.cstPlusNft'],
      ['public-goods', 'home.allocation.amounts.eth(amount=0.7000)'],
      ['next-cycle', 'home.allocation.amounts.eth(amount=5.0000)'],
    ] as const;

    for (const [key, amount] of expected) {
      expect(
        within(screen.getByTestId(`ledger-track-${key}`)).getByText(amount),
      ).toBeInTheDocument();
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

  it('links high-context tracks to their relevant detail pages', () => {
    render(<AllocationLedger data={makeData()} />);

    expect(within(screen.getByTestId('ledger-track-signature')).getByRole('link')).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    expect(within(screen.getByTestId('ledger-track-chrono')).getByRole('link')).toHaveAttribute(
      'href',
      '/faq#chrono-warrior',
    );
    expect(
      within(screen.getByTestId('ledger-track-public-goods')).getByRole('link'),
    ).toHaveAttribute('href', '/public-goods-contributions-cg');
  });

  it('uses a single-row desktop grid and a horizontal snap strip below xl', () => {
    render(<AllocationLedger data={makeData()} />);

    expect(screen.getByTestId('allocation-ledger-list')).toHaveClass(
      'flex',
      'overflow-x-auto',
      'snap-x',
      'xl:grid',
      'xl:grid-cols-9',
      'xl:overflow-visible',
    );
  });

  it('omits the next-cycle amount when the live percentage set is incomplete', () => {
    render(<AllocationLedger data={makeData({ RafflePercentage: undefined })} />);
    expect(screen.queryByTestId('ledger-track-next-cycle')).not.toBeInTheDocument();
  });

  it('renders stable zero values while live data is unavailable', () => {
    render(<AllocationLedger data={null} />);
    expect(
      within(screen.getByTestId('ledger-track-signature')).getByText(
        'home.allocation.amounts.eth(amount=0.0000)',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('ledger-track-next-cycle')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationLedger data={makeData()} />);
    await checkA11y(container);
  });
});
