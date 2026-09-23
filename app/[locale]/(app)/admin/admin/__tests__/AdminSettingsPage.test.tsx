import { render, screen, checkA11y } from '@/test-utils';

import AdminSettingsPage from '../AdminSettingsPage';

const mockUseDashboardInfo = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

jest.mock('../../../../../../components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('../../../../../../components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));

jest.mock('../../../../../../components/ui/select', () => ({
  Select: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectValue: () => <span />,
}));

beforeEach(() => jest.clearAllMocks());

describe('AdminSettingsPage', () => {
  it('shows loading state when query is loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading when data is not available', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  describe('with production-shaped dashboard data', () => {
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
    };

    beforeEach(() => {
      mockUseDashboardInfo.mockReturnValue({ data: dashboard, isLoading: false, error: null });
    });

    const valueOf = (label: string) =>
      (screen.getByRole('group', { name: label }).querySelector('input') as HTMLInputElement).value;

    it('lists every protocol address under its Contracts page name', () => {
      render(<AdminSettingsPage />);
      expect(screen.getByText('Cosmic Signature Contract')).toBeInTheDocument();
      expect(valueOf('Allocations Wallet')).toBe(dashboard.ContractAddrs.PrizesWalletAddr);
      expect(valueOf('Cosmic Signature NFT Anchoring Wallet')).toBe(
        dashboard.ContractAddrs.StakingWalletCSTAddr,
      );
      expect(valueOf('RWLK Anchoring Wallet')).toBe(dashboard.ContractAddrs.StakingWalletRWalkAddr);
      expect(valueOf('Cosmic Council')).toBe(dashboard.ContractAddrs.CosmicDaoAddr);
    });

    it('reads the Stellar Selection recipient counts the API sends', () => {
      render(<AdminSettingsPage />);
      expect(valueOf('Number of ETH Stellar Selection recipients per cycle')).toBe('3');
      expect(valueOf('Number of NFT Stellar Selection recipients per cycle')).toBe('10');
      expect(valueOf('Number of NFT holder recipients per cycle')).toBe('10');
    });

    it('shows divisors as the percentage they apply and durations as durations', () => {
      render(<AdminSettingsPage />);
      expect(valueOf('Time increase')).toBe('1% (divisor 100)');
      expect(valueOf('Price increase')).toBe('1% (divisor 100)');
      expect(valueOf('Time added per gesture')).toBe('1h 1m 12s');
      expect(valueOf('Timeout to retrieve Signature Allocation')).toBe('2d');
      expect(valueOf('Initial seconds until Signature Allocation')).toBe('1d 0h 28m 55s');
    });
  });

  it('leaves a value the dashboard does not report empty, labelled unavailable', () => {
    mockUseDashboardInfo.mockReturnValue({ data: {}, isLoading: false, error: null });
    render(<AdminSettingsPage />);
    const input = screen
      .getByRole('group', { name: 'Time increase' })
      .querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input).toHaveAttribute('placeholder', 'common.status.unavailable');
  });

  it('renders the page title', () => {
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Administrative methods')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<AdminSettingsPage />);
    await checkA11y(container);
  });
});
