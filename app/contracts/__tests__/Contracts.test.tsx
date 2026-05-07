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
    explorerUrl: 'https://sepolia.arbiscan.io',
  },
  getPublicClientRpcUrl: () => 'http://127.0.0.1:8545',
  emptyContractAddresses: () => ({
    randomWalkNft: '',
    cosmicGame: '',
    cosmicSignature: '',
    cosmicToken: '',
    cosmicDao: '',
    charity: '',
    prizesWallet: '',
    stakingCst: '',
    stakingRwalk: '',
    marketing: '',
    implementation: '',
  }),
  publishDashboardContractAddresses: jest.fn(),
  getCachedDashboardContractAddresses: () => ({
    randomWalkNft: '0x0',
    cosmicGame: '0xGame',
    cosmicSignature: '0x0',
    cosmicToken: '0x0',
    cosmicDao: '0x0',
    charity: '0xCharity',
    prizesWallet: '0x0',
    stakingCst: '0x0',
    stakingRwalk: '0x0',
    marketing: '0x0',
    implementation: '0x0',
  }),
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
  NumRaffleEthRecipientsBidding: 5,
  NumRaffleNFTRecipientsBidding: 3,
  NumRaffleNFTRecipientsStakingRWalk: 2,
  TimeoutClaimPrize: 86400,
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

  it('renders allocation tracks section with percentages', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Allocation Tracks')).toBeInTheDocument();
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('Anchor Distribution')).toBeInTheDocument();
    expect(screen.getByText('Public Goods')).toBeInTheDocument();
  });

  it('renders game configuration section', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Protocol Configuration')).toBeInTheDocument();
    expect(screen.getByText('Gesture-Cost Drift')).toBeInTheDocument();
    expect(screen.getByText('Time Increment')).toBeInTheDocument();
    expect(screen.getByText('Participation CST per Gesture')).toBeInTheDocument();
  });

  it('renders all contract address groups', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Core Contracts')).toBeInTheDocument();
    expect(screen.getByText('Wallet Contracts')).toBeInTheDocument();
    expect(screen.getByText('Anchoring Contracts')).toBeInTheDocument();
  });

  it('renders contract address cards', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('Cosmic Signature Token')).toBeInTheDocument();
    expect(screen.getByText('Public Goods Vault')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature NFT Anchoring Wallet')).toBeInTheDocument();
  });

  it('renders calibration parameters section', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(
      screen.getByText('Calibration Window & Stellar Selection Parameters'),
    ).toBeInTheDocument();
    expect(screen.getByText('CST Calibration Window')).toBeInTheDocument();
    expect(screen.getByText('ETH Calibration Window')).toBeInTheDocument();
  });

  it('renders stellar selection configuration cards', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByText('ETH Stellar Selection Recipients')).toBeInTheDocument();
    expect(screen.getByText('NFT Stellar Selection (Participants)')).toBeInTheDocument();
    expect(screen.getByText('NFT Stellar Selection (Anchored RWLK)')).toBeInTheDocument();
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
    fireEvent.change(searchInput, { target: { value: 'charity' } }); // lexicon-allow-line
    expect(screen.getByText('Public Goods Vault')).toBeInTheDocument();
    expect(screen.queryByText('Cosmic Signature Token')).not.toBeInTheDocument();
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
