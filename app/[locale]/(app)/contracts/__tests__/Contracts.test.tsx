import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

import { protocolFacts } from '@/content/protocol-facts';

import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WalletUiProvider } from '@/contexts/WalletUiContext';
import { checksumAddress } from '@/utils/format';

import { checkA11y, render, screen, waitFor } from '@/test-utils';

import Contracts from '../Contracts';

interface LiveCstPreviewTestGlobals {
  __COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__?: boolean;
  __COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__?: number;
}

// The production network: the address list is the verified Arbitrum One set.
jest.mock('@/config/chains', () => ({
  ...jest.requireActual('@/config/chains'),
  activeChain: jest.requireActual('viem/chains').arbitrum,
}));

jest.mock('viem', () => ({
  ...jest.requireActual('viem'),
  formatEther: (v: bigint) => (Number(v) / 1e18).toString(),
}));

jest.mock('wagmi', () => ({
  useConnection: () => ({ address: undefined, isConnected: false }),
  useChainId: () => 421614,
  useConfig: () => ({}),
  usePublicClient: () => undefined,
}));

jest.mock('@/hooks/useTxFlow', () => ({
  useTxFlow: () => ({ stage: { status: 'idle' }, isBusy: false, run: jest.fn(), reset: jest.fn() }),
  useTxStageLabel: () => () => null,
}));

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
jest.mock('@/hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

const mockUseContractNoSigner = jest.fn().mockReturnValue(null);
jest.mock('@/hooks/useContractNoSigner', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseContractNoSigner(...args),
}));

jest.mock('@/config/networks', () => ({
  ...jest.requireActual('@/config/networks'),
  networkConfig: {
    chainName: 'Arbitrum Sepolia',
    chainId: 421614,
    explorerUrl: 'https://sepolia.arbiscan.io',
  },
}));

jest.mock('@/contracts/abis', () => ({
  charityWalletAbi: [],
  cosmicGameAbi: [],
  marketingWalletAbi: [],
}));

jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  reportError: jest.fn(),
}));

/** A distinct, well-formed address per contract. */
const addr = (digit: string) => `0x${digit.repeat(40)}`;

const makeDashboardData = (overrides = {}) => ({
  PrizePercentage: 25,
  ChronoWarriorPercentage: 8,
  RafflePercentage: 4,
  StakingPercentage: 6,
  CharityPercentage: 7,
  CharityBalanceEth: 0.5,
  CurNumBids: 12,
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 10,
  NumRaffleNFTWinnersStakingRWalk: 10,
  TimeoutClaimPrize: 172800,
  ContractAddrs: {
    CosmicGameAddr: addr('1'),
    CosmicTokenAddr: addr('2'),
    CosmicSignatureAddr: addr('3'),
    RandomWalkAddr: addr('4'),
    CosmicDaoAddr: addr('5'),
    CharityWalletAddr: addr('6'),
    MarketingWalletAddr: addr('7'),
    PrizesWalletAddr: addr('8'),
    StakingWalletCSTAddr: addr('9'),
    StakingWalletRWalkAddr: addr('a'),
    ImplementationAddr: addr('b'),
  },
  ...overrides,
});

const contractReads = (overrides: Record<string, jest.Mock> = {}) => ({
  read: {
    bidMessageLengthMaxLimit: jest.fn().mockResolvedValue(280n),
    ethBidPriceIncreaseDivisor: jest.fn().mockResolvedValue(100n),
    mainPrizeTimeIncrementIncreaseDivisor: jest.fn().mockResolvedValue(100n),
    mainPrizeTimeIncrementInMicroSeconds: jest.fn().mockResolvedValue(3_600_000_000n),
    getInitialDurationUntilMainPrize: jest.fn().mockResolvedValue(86_400n),
    getBidCstRewardAmount: jest.fn().mockResolvedValue(100_000_000_000_000_000_000n),
    getCstDutchAuctionDurations: jest.fn().mockResolvedValue([43_200n, 10_800n]),
    getEthDutchAuctionDurations: jest.fn().mockResolvedValue([7_200n, 3_650_000n]),
    cstDutchAuctionBeginningBidPrice: jest.fn().mockResolvedValue(400_000_000_000_000_000_000n),
    charityAddress: jest.fn().mockResolvedValue(protocolFacts.publicGoodsBeneficiary.address),
    ...overrides,
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseContractNoSigner.mockReturnValue(null);
  mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false });
  const liveCstGlobals = globalThis as LiveCstPreviewTestGlobals;
  liveCstGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ = false;
  liveCstGlobals.__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__ = undefined;
});

describe('Contracts', () => {
  it('orders the page: addresses, allocation tracks, configuration, windows, Public Goods', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Contract addresses',
      'Allocation tracks',
      'Protocol configuration',
      'Calibration Windows',
      'Public Goods',
    ]);
  });

  it('lists each verified address once, grouped, with its explorer and Sourcify evidence', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByRole('heading', { level: 3, name: 'Core contracts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Wallets' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Anchoring' })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-contract]')).toHaveLength(11);
    // The verified address, whatever the indexer answers, with both kinds of evidence.
    const token = document.querySelector('[data-contract="cst"]');
    const cst = protocolFacts.contractAddresses.cstToken;
    expect(
      token?.querySelector(`a[href="https://sepolia.arbiscan.io/address/${cst}"]`),
    ).not.toBeNull();
    expect(token?.querySelector('a[href*="repo.sourcify.dev"]')).not.toBeNull();
    const implementation = document.querySelector('[data-contract="implementation"]');
    expect(implementation?.querySelector('a[href*="repo.sourcify.dev"]')).not.toBeNull();
    // What that link vouches for is said once for the list, not as a badge on every row.
    expect(screen.queryByText('Exact match')).toBeNull();
    const notes = document.querySelectorAll('[data-sourcify-note]');
    expect(notes).toHaveLength(1);
    expect(notes[0]).toHaveTextContent(
      'Every address with a Sourcify link is an exact match there, checked September 24, 2026.',
    );
  });

  it('shows every whole address, so it can be checked character by character on a phone', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const row = document.querySelector('[data-contract="implementation"]');
    expect(row).toHaveTextContent(checksumAddress(protocolFacts.contractAddresses.implementation));
    expect(row?.querySelector('.sm\\:hidden')).toBeNull();
  });

  it('drops API address fields it has no name for', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({
        ContractAddrs: { ...makeDashboardData().ContractAddrs, MarketplaceAddr: addr('c') },
      }),
      isLoading: false,
    });
    render(<Contracts />);
    expect(document.body.textContent).not.toContain('MarketplaceAddr');
    expect(document.querySelectorAll('[data-contract]')).toHaveLength(11);
  });

  // The market buttons once broke the CST and NFT rows and put promotion inside the
  // verification list; they are one quiet line under the core contracts now.
  it('lists the markets once, under the core contracts, outside every address row', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const markets = document.querySelector('[data-slot="contract-markets"]');
    for (const href of [
      CST_UNISWAP_SWAP_URL,
      CST_GECKOTERMINAL_POOL_URL,
      COSMIC_SIGNATURE_MARKETPLACE_URL,
    ]) {
      expect(markets?.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
    expect(document.querySelector('[data-contract] a[href*="uniswap"]')).toBeNull();
    expect(document.querySelector('[data-contract] a[href*="axiomzero"]')).toBeNull();
  });

  // Regression: the API silently replaced verified addresses, and an outage dropped 9 of 11.
  it('shows an indexer address that differs as a caption, never in its place', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const token = document.querySelector('[data-contract="cst"]');
    expect(token?.textContent).toContain(checksumAddress(protocolFacts.contractAddresses.cstToken));
    expect(token?.querySelector('[data-slot="contract-drift"]')).toHaveTextContent(
      `The indexer reports ${addr('2')}, which has not been verified.`,
    );
    // The dashboard lags an upgrade: a different implementation is not drift.
    expect(
      document.querySelector('[data-contract="implementation"] [data-slot="contract-drift"]'),
    ).toBeNull();
  });

  it('shows the verified implementation address over a stale dashboard value', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    const row = document.querySelector('[data-contract="implementation"]');
    expect(row?.textContent).toContain(
      checksumAddress(protocolFacts.contractAddresses.implementation),
    );
    expect(row?.textContent).not.toContain(checksumAddress(addr('b')));
  });

  it('draws the allocation tracks against the whole reserve, with the remainder', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<Contracts />);
    expect(screen.getByTestId('fund-segment-signature')).toHaveStyle({ width: '25%' });
    expect(screen.getByTestId('fund-segment-nextCycle')).toHaveStyle({ width: '50%' });
    expect(document.querySelector('[data-track="publicGoods"] dd')).toHaveTextContent('7%');
  });

  it('reads the live configuration from the contracts', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    mockUseContractNoSigner.mockReturnValue(
      contractReads({ ethBidPriceIncreaseDivisor: jest.fn().mockResolvedValue(50n) }),
    );
    render(<Contracts />);
    const value = (id: string) => document.querySelector(`[data-parameter="${id}"] dd`);
    await waitFor(() => expect(value('ethStep')).toHaveTextContent('2%'));
    expect(value('message')).toHaveTextContent('280');
    expect(value('timeIncrement')).toHaveTextContent('1h');
    expect(value('ethStellar')).toHaveTextContent('3');
    expect(value('anchoredStellar')).toHaveTextContent('10');
  });

  it('shows a skeleton while a read is in flight and a dash when it fails', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    mockUseContractNoSigner.mockReturnValue(
      contractReads({
        ethBidPriceIncreaseDivisor: jest.fn().mockResolvedValue(0n),
        bidMessageLengthMaxLimit: jest.fn().mockRejectedValue(new Error('rpc down')),
      }),
    );
    render(<Contracts />);
    await waitFor(() =>
      expect(document.querySelector('[data-parameter="message"] dd')).toHaveTextContent(
        'common.status.unavailable',
      ),
    );
    expect(document.querySelector('[data-parameter="ethStep"] dd')).toHaveTextContent(
      'common.status.unavailable',
    );
    expect(document.body.textContent).not.toMatch(/Infinity|NaN/);
  });

  it('shows a running CST window with its progress and a closed ETH window', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    mockUseContractNoSigner.mockReturnValue(contractReads());
    render(<Contracts />);
    const cst = () => document.querySelector('[data-window="cst"]');
    const eth = () => document.querySelector('[data-window="eth"]');
    await waitFor(() => expect(cst()).toHaveAttribute('data-state', 'running'));
    expect(screen.getByRole('progressbar', { name: 'CST Calibration Window' })).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
    expect(cst()?.textContent).toContain('25% complete');
    expect(cst()?.textContent).toContain('Remaining');
    expect(cst()?.textContent).toMatch(/400/);
    // The cycle has gestures, so the ETH window no longer prices anything.
    expect(eth()).toHaveAttribute('data-state', 'closed');
    expect(eth()?.textContent).toContain('Closed');
    expect(eth()?.textContent).not.toContain('Remaining');
  });

  it('reads a window that has run its full length as complete, not overdue', async () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurNumBids: 0 }),
      isLoading: false,
    });
    mockUseContractNoSigner.mockReturnValue(contractReads());
    render(<Contracts />);
    const eth = () => document.querySelector('[data-window="eth"]');
    await waitFor(() => expect(eth()).toHaveAttribute('data-state', 'complete'));
    expect(eth()?.textContent).toContain('Complete');
    expect(eth()?.textContent).not.toContain('Elapsed');
  });

  // The ETH window's state depends on whether the cycle has a gesture. A loading or
  // failed dashboard once read as "no gestures", so the window showed Running or
  // Complete until the dashboard arrived, and stayed wrong when it never did.
  it('keeps the ETH window state unknown until the dashboard says whether the cycle has gestures', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    mockUseContractNoSigner.mockReturnValue(contractReads());
    const { rerender } = render(<Contracts />);
    const cst = () => document.querySelector('[data-window="cst"]');
    const eth = () => document.querySelector('[data-window="eth"]');
    await waitFor(() => expect(cst()).toHaveAttribute('data-state', 'running'));
    expect(eth()).toHaveAttribute('data-state', 'loading');
    expect(eth()?.textContent).not.toMatch(/Running|Complete|Closed/);
    // Its length is the window's own reading and shows regardless.
    expect(eth()?.querySelector('dd')).toHaveTextContent(/2\s*h/);

    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    rerender(<Contracts />);
    expect(eth()).toHaveAttribute('data-state', 'unknown');
    expect(eth()?.textContent).not.toMatch(/Running|Complete|Closed/);

    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    rerender(<Contracts />);
    expect(eth()).toHaveAttribute('data-state', 'closed');
  });

  // Every gesture changes the windows; they were read once per page and then extrapolated.
  it('reads the Calibration Windows again when the gesture count moves or this tab gestures', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    const readCst = jest.fn().mockResolvedValue([43_200n, 10_800n]);
    const readStart = jest.fn().mockResolvedValue(400_000_000_000_000_000_000n);
    mockUseContractNoSigner.mockReturnValue(
      contractReads({
        getCstDutchAuctionDurations: readCst,
        cstDutchAuctionBeginningBidPrice: readStart,
      }),
    );
    const { rerender } = render(<Contracts />);
    await waitFor(() => expect(readCst).toHaveBeenCalledTimes(1));

    readStart.mockResolvedValue(520_000_000_000_000_000_000n);
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurNumBids: 13 }),
      isLoading: false,
    });
    rerender(<Contracts />);
    await waitFor(() => expect(readCst).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(document.querySelector('[data-window="cst"]')?.textContent).toMatch(/520/),
    );

    window.dispatchEvent(new Event('cosmic:gesture-placed'));
    await waitFor(() => expect(readCst).toHaveBeenCalledTimes(3));
  });

  it('refreshes the participation CST preview live', async () => {
    const liveCstGlobals = globalThis as LiveCstPreviewTestGlobals;
    liveCstGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ = true;
    liveCstGlobals.__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__ = 20;
    const rewardValues = [100_000_000_000_000_000_000n, 125_123_456_789_123_000_000n];
    let reads = 0;
    const readPreview = jest.fn(async () => rewardValues[Math.min(reads++, 1)]!);
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    mockUseContractNoSigner.mockReturnValue(contractReads({ getBidCstRewardAmount: readPreview }));

    render(<Contracts />);
    await waitFor(() =>
      expect(document.querySelector('[data-parameter="cstPreview"] dd')).toHaveTextContent(
        /125\.12/,
      ),
    );
    expect(readPreview.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('pauses the live CST preview while the tab is hidden and resumes when shown', async () => {
    const liveCstGlobals = globalThis as LiveCstPreviewTestGlobals;
    liveCstGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ = true;
    liveCstGlobals.__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__ = 10;
    let hidden = false;
    const hiddenSpy = jest.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    const readPreview = jest.fn(async () => 100_000_000_000_000_000_000n);
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    mockUseContractNoSigner.mockReturnValue(contractReads({ getBidCstRewardAmount: readPreview }));

    try {
      render(<Contracts />);
      await waitFor(() => expect(readPreview.mock.calls.length).toBeGreaterThan(1));
      hidden = true;
      await new Promise((resolve) => setTimeout(resolve, 40));
      const readsWhileHidden = readPreview.mock.calls.length;
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(readPreview.mock.calls.length).toBe(readsWhileHidden);
      hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
      await waitFor(() => expect(readPreview.mock.calls.length).toBeGreaterThan(readsWhileHidden));
    } finally {
      hiddenSpy.mockRestore();
      delete liveCstGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__;
      delete liveCstGlobals.__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__;
    }
  });

  describe('server HTML', () => {
    /** What the route's server render sends: the dashboard query has not hydrated yet. */
    const serverHtml = (element: ReactElement) =>
      renderToString(
        <TooltipProvider>
          <WalletUiProvider>{element}</WalletUiProvider>
        </TooltipProvider>,
      );
    const serverAddrs = makeDashboardData().ContractAddrs;

    it('lists every verified contract address in the server HTML', () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      const html = serverHtml(<Contracts initialContractAddrs={serverAddrs} />);
      for (const address of Object.values(protocolFacts.contractAddresses)) {
        expect(html).toContain(checksumAddress(address));
      }
    });

    // Regression: an indexer outage once left 2 of the 11 official addresses.
    it('lists all eleven verified addresses when the server read failed', () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      const html = serverHtml(<Contracts initialContractAddrs={null} />);
      for (const address of Object.values(protocolFacts.contractAddresses)) {
        expect(html).toContain(checksumAddress(address));
      }
      expect(html.match(/data-contract="/g)).toHaveLength(11);
    });
  });

  it('renders the addresses the route rendered on the server when it passes them', () => {
    render(<Contracts addresses={<section data-testid="server-addresses" />} />);
    expect(screen.getByTestId('server-addresses')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-contract]')).toHaveLength(0);
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    const { container } = render(<Contracts />);
    await checkA11y(container);
  });
});
