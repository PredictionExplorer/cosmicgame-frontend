import { formatDuration } from '@/utils/format';

import { checkA11y, render, screen, within } from '@/test-utils';

import AdminSettingsPage from '../AdminSettingsPage';

const mockUseDashboardInfo = jest.fn();
const mockRefetch = jest.fn();

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

// A fixed "now" after the activation below, so the cycle reads as active.
jest.mock('../../../../../../hooks/useNow', () => ({
  useNow: () => Date.UTC(2026, 8, 1),
}));

// Field names as the live dashboard sends them; the page once read RaffleWalletAddr,
// NumRaffleEthWinners and friends, which the API never sends, and showed blank rows.
const dashboard = {
  ContractAddrs: {
    CosmicGameAddr: '0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2',
    CosmicSignatureAddr: '0xbb84Be3500A63581d3F2d5AC3bdF8685AAedad25',
    CosmicTokenAddr: '0xAD91843e6A58Ba560F577E676986AFb1dba6FBA0',
    CosmicDaoAddr: '0xF3D52E1c681949be7E624778dB13DaD7F8c729db',
    CharityWalletAddr: '0x96bB0ADB414d5350f435E52f94946B6C7A0760a9',
    PrizesWalletAddr: '0xE1b619e9B39ea4109D2F429Ea5eAA307759b0011',
    RandomWalkAddr: '0x895a6F444BE4ba9d124F61DF736605792B35D66b',
    StakingWalletCSTAddr: '0x6308A405B4FF1eA890870Efe2a6D036750B81F7C',
    StakingWalletRWalkAddr: '0x5EB3396092841E6c5b0b51141699F6711E830529',
    MarketingWalletAddr: '0xa3802c799f5e3D3D3562A9B513a41C6aAF92e25e',
  },
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 10,
  NumRaffleNFTWinnersStakingRWalk: 10,
  PrizePercentage: 25,
  CharityPercentage: 7,
  RafflePercentage: 4,
  StakingPercentage: 6,
  TimeIncrease: '100',
  PriceIncrease: '100',
  TimeoutClaimPrize: 172800,
  MainPrizeTimeIncrementInMicroSeconds: '3672360000',
  InitialSecondsUntilPrize: 41667,
  RoundStartCSTAuctionLength: 29487,
  CurRoundStats: { TotalBids: 0, ActivationTime: 1786477106 },
};

/** The value cell of a parameter row, by the row's label. */
const valueOf = (label: string) => {
  const term = screen.getByText(label, { selector: 'dt' });
  return term.nextElementSibling as HTMLElement;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue({
    data: dashboard,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  });
});

describe('AdminSettingsPage', () => {
  it('is a read-only sheet: no inputs, no Set buttons, no mode switch', () => {
    render(<AdminSettingsPage />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^set/i })).not.toBeInTheDocument();
  });

  it('groups the parameters under headings', () => {
    render(<AdminSettingsPage />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Contracts',
      'Allocation shares',
      'Stellar Selection',
      'Timing',
      'Gesture Cost',
    ]);
  });

  it('lists every protocol address under its Contracts page name, with explorer evidence', () => {
    render(<AdminSettingsPage />);
    const allocations = valueOf('Allocations Wallet');
    expect(allocations).toHaveTextContent(dashboard.ContractAddrs.PrizesWalletAddr);
    expect(within(allocations).getByRole('link', { name: /Arbiscan/ })).toHaveAttribute(
      'href',
      expect.stringContaining(`/address/${dashboard.ContractAddrs.PrizesWalletAddr}`),
    );
    expect(valueOf('RWLK Anchoring Wallet')).toHaveTextContent(
      dashboard.ContractAddrs.StakingWalletRWalkAddr,
    );
    expect(valueOf('Cosmic Council')).toHaveTextContent(dashboard.ContractAddrs.CosmicDaoAddr);
  });

  it('reads the Stellar Selection recipient counts and the shares the API sends', () => {
    render(<AdminSettingsPage />);
    expect(valueOf('Number of ETH Stellar Selection recipients per cycle')).toHaveTextContent('3');
    expect(valueOf('Number of NFT holder recipients per cycle')).toHaveTextContent('10');
    expect(valueOf('Signature Allocation percentage')).toHaveTextContent('25%');
    expect(valueOf('Public Goods percentage')).toHaveTextContent('7%');
  });

  it('shows divisors as the percentage they apply and durations as durations', () => {
    render(<AdminSettingsPage />);
    expect(valueOf('Time increment growth per cycle')).toHaveTextContent('1% (divisor 100)');
    expect(valueOf('ETH Gesture Cost step-up')).toHaveTextContent('1% (divisor 100)');
    // Units converted by the page (microseconds, the misnamed divisor), spelled by the
    // shared duration formatter.
    expect(valueOf('Time added per gesture').textContent).toBe(
      formatDuration(3672.36, { locale: 'en' }),
    );
    expect(valueOf('Finalization timeout').textContent).toBe(
      formatDuration(172800, { locale: 'en' }),
    );
    expect(valueOf('Initial time increment').textContent).toBe(
      formatDuration(88135, { locale: 'en' }),
    );
  });

  it('marks the cycle active once its activation time has passed', () => {
    render(<AdminSettingsPage />);
    const activation = valueOf('Activation time');
    expect(activation.querySelector('time')).toHaveAttribute(
      'dateTime',
      new Date(1786477106 * 1000).toISOString(),
    );
    expect(activation).toHaveTextContent('Active');
  });

  it('says which values the dashboard does not report instead of an empty field', () => {
    render(<AdminSettingsPage />);
    expect(valueOf('Initial Gesture Cost fraction')).toHaveTextContent(
      'Not reported by the dashboard API',
    );
    expect(valueOf('ETH to CST Gesture ratio')).toHaveTextContent(
      'Not reported by the dashboard API',
    );
  });

  // A long value once kept its full width (shrink-0) and squeezed the label to a
  // syllable per line on phones, clipping the value at the row's edge.
  it.each(['ETH to CST Gesture ratio', 'Initial Gesture Cost fraction', 'Activation time'])(
    'lets the %s value wrap beside a label that keeps its room',
    (label) => {
      render(<AdminSettingsPage />);
      const term = screen.getByText(label, { selector: 'dt' });
      const value = valueOf(label);
      expect(value).not.toHaveClass('shrink-0');
      expect(value).toHaveClass('min-w-0', 'max-w-[60%]', 'text-end');
      expect(term).toHaveClass('min-w-0', 'flex-1');
    },
  );

  it('shows a dash, announced as unavailable, for a reported field it cannot read', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: { ...dashboard, TimeIncrease: 'n/a' },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    render(<AdminSettingsPage />);
    expect(valueOf('Time increment growth per cycle')).toHaveTextContent(
      'common.status.unavailable',
    );
  });

  it('shows placeholder rows while the dashboard loads', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<AdminSettingsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Contracts')).not.toBeInTheDocument();
  });

  it('offers a retry when the dashboard cannot be read', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    render(<AdminSettingsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'The contract settings could not be loaded.' }),
    ).toBeInTheDocument();
    screen.getByRole('button', { name: 'Try again' }).click();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AdminSettingsPage />);
    await checkA11y(container);
  });
});
