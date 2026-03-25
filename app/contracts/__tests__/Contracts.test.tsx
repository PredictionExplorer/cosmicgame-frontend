import { render, screen, fireEvent, waitFor, checkA11y } from '@/test-utils';

import Contracts from '../Contracts';

/* ── framer-motion mock ───────────────────────────────────────── */

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ..._rest
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }) => (
      <div className={className} data-testid="motion-div">
        {children}
      </div>
    ),
    section: ({
      children,
      className,
      ...rest
    }: React.HTMLAttributes<HTMLElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }) => (
      <section className={className} data-testid="motion-section" aria-label={rest['aria-label']}>
        {children}
      </section>
    ),
  },
}));

/* ── viem mock ─────────────────────────────────────────────────── */

jest.mock('viem', () => ({
  formatEther: (v: bigint) => (Number(v) / 1e18).toString(),
}));

/* ── utils mock ────────────────────────────────────────────────── */

jest.mock('../../../utils', () => ({
  formatSeconds: (s: number) => (s > 0 ? `${s}s` : '0s'),
}));

/* ── next/link mock ────────────────────────────────────────────── */

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

/* ── useApiQuery mock ──────────────────────────────────────────── */

const mockUseDashboardInfo = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

/* ── useContractNoSigner mock ──────────────────────────────────── */

const mockUseContractNoSigner = jest.fn().mockReturnValue(null);

jest.mock('../../../hooks/useContractNoSigner', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseContractNoSigner(...args),
}));

/* ── config/networks mock ──────────────────────────────────────── */

jest.mock('../../../config/networks', () => ({
  networkConfig: {
    chainName: 'Arbitrum Sepolia',
    chainId: 421614,
    explorerUrl: 'https://sepolia-explorer.arbitrum.io',
  },
  CHARITY_WALLET_ADDRESS: '0xCharity',
  COSMICGAME_ADDRESS: '0xGame',
}));

/* ── contracts/abis mock ──────────────────────────────────────── */

jest.mock('../../../contracts/abis', () => ({
  charityWalletAbi: [],
  cosmicGameAbi: [],
}));

/* ── utils/errors mock ─────────────────────────────────────────── */

jest.mock('../../../utils/errors', () => ({
  reportError: jest.fn(),
}));

/* ── clipboard mock ────────────────────────────────────────────── */

const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

/* ── helpers ───────────────────────────────────────────────────── */

const makeDashboardData = (overrides = {}) => ({
  PrizePercentage: 25,
  ChronoWarriorPercentage: 10,
  RafflePercentage: 25,
  StakingPercentage: 30,
  CharityPercentage: 10,
  NumRaffleEthWinnersBidding: 5,
  NumRaffleNFTWinnersBidding: 3,
  NumRaffleNFTWinnersStakingRWalk: 2,
  TimeoutClaimPrize: 86400,
  InitialSecondsUntilPrize: 43200,
  ContractAddrs: {
    CosmicGameAddr: '0xGameAddr',
    CosmicTokenAddr: '0xTokenAddr',
    CosmicSignatureAddr: '0xSigAddr',
    RandomWalkAddr: '0xRWAddr',
    CosmicDaoAddr: '0xDaoAddr',
    CharityWalletAddr: '0xCharityAddr',
    MarketingWalletAddr: '0xMktAddr',
    PrizesWalletAddr: '0xPrizesAddr',
    StakingWalletCSTAddr: '0xStakeCSTAddr',
    StakingWalletRWalkAddr: '0xStakeRWLKAddr',
  },
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockWriteText.mockClear();
});

/* ── Tests ─────────────────────────────────────────────────────── */

describe('Contracts', () => {
  it('renders page header with correct title', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(
      screen.getByRole('heading', { name: 'Contract Addresses', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders network badge with chain name and ID', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Arbitrum Sepolia')).toBeInTheDocument();
    expect(screen.getByText('Chain 421614')).toBeInTheDocument();
  });

  it('renders fund distribution section with percentages', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Fund Distribution')).toBeInTheDocument();
    expect(screen.getByText('Prize')).toBeInTheDocument();
    expect(screen.getByText('Chrono Warrior')).toBeInTheDocument();
    expect(screen.getByText('Raffle')).toBeInTheDocument();
    expect(screen.getByText('Staking')).toBeInTheDocument();
    expect(screen.getByText('Charity')).toBeInTheDocument();
  });

  it('renders game configuration section', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Game Configuration')).toBeInTheDocument();
    expect(screen.getByText('Price Increase')).toBeInTheDocument();
    expect(screen.getByText('Time Increase')).toBeInTheDocument();
    expect(screen.getByText('CST Reward per Bid')).toBeInTheDocument();
  });

  it('renders all contract address groups', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Core Contracts')).toBeInTheDocument();
    expect(screen.getByText('Wallet Contracts')).toBeInTheDocument();
    expect(screen.getByText('Staking Contracts')).toBeInTheDocument();
  });

  it('renders contract address cards', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Cosmic Game')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature Token')).toBeInTheDocument();
    expect(screen.getByText('Charity Wallet')).toBeInTheDocument();
    expect(screen.getByText('CST Staking Wallet')).toBeInTheDocument();
  });

  it('renders auction parameters section', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Auction & Raffle Parameters')).toBeInTheDocument();
    expect(screen.getByText('CST Dutch Auction')).toBeInTheDocument();
    expect(screen.getByText('ETH Dutch Auction')).toBeInTheDocument();
  });

  it('renders raffle configuration cards', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Raffle ETH Winners')).toBeInTheDocument();
    expect(screen.getByText('Raffle NFT Winners (Bidding)')).toBeInTheDocument();
    expect(screen.getByText('Raffle NFT Winners (Staking)')).toBeInTheDocument();
  });

  it('renders search input for contract addresses', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByLabelText('Search contracts')).toBeInTheDocument();
  });

  it('filters contracts when searching', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const searchInput = screen.getByLabelText('Search contracts');
    fireEvent.change(searchInput, { target: { value: 'charity' } });
    expect(screen.getByText('Charity Wallet')).toBeInTheDocument();
    expect(screen.queryByText('Cosmic Game')).not.toBeInTheDocument();
  });

  it('shows empty state when search has no results', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const searchInput = screen.getByLabelText('Search contracts');
    fireEvent.change(searchInput, { target: { value: 'zzzznotfound' } });
    expect(screen.getByText(/No contracts match/)).toBeInTheDocument();
  });

  it('renders explorer links for contracts', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const explorerLinks = screen.getAllByLabelText(/View .+ on block explorer/);
    expect(explorerLinks.length).toBeGreaterThan(0);
    expect(explorerLinks[0]).toHaveAttribute('target', '_blank');
  });

  it('copies contract address when copy button is clicked', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const copyButtons = screen.getAllByLabelText(/Copy .+ address/);
    fireEvent.click(copyButtons[0]!);
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });
  });

  it('renders loading state with skeletons', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<Contracts />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    const { container } = render(<Contracts />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
