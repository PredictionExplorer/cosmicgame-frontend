import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import MyWinnings from '../MyWinnings';

const mockRefetchNFTs = jest.fn();
const mockRefetchDeposits = jest.fn();
const mockRefetchERC20 = jest.fn();
const mockRetrieveEverything = jest.fn();
const mockRetrieveAllStellarSelectionETH = jest.fn();
const mockClaimDonatedNFT = jest.fn();
const mockClaimAllDonatedNFTs = jest.fn();
const mockClaimDonatedERC20 = jest.fn();
const mockClaimAllDonatedERC20 = jest.fn();
let mockApiData: Record<string, unknown> = { UnretrievedAnchorDistribution: 0 };
let mockUnclaimedRewards: unknown[] = [];

const query = (data: unknown, extra: Record<string, unknown> = {}) => ({
  data,
  isLoading: false,
  isError: false,
  ...extra,
});

const mockUseUnclaimedDonatedNFTByUser = jest.fn();
const mockUseUnretrievedStellarSelectionDepositsByUser = jest.fn();
const mockUseDonationsERC20ByUser = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useUnclaimedDonatedNFTByUser: (...args: unknown[]) => mockUseUnclaimedDonatedNFTByUser(...args),
  useUnretrievedStellarSelectionDepositsByUser: (...args: unknown[]) =>
    mockUseUnretrievedStellarSelectionDepositsByUser(...args),
  useDonationsERC20ByUser: (...args: unknown[]) => mockUseDonationsERC20ByUser(...args),
}));

let mockAccount: string | null = '0xUser';
jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('../../../../../contexts/ApiDataContext', () => ({
  useApiData: () => ({
    apiData: mockApiData,
    unclaimedRewards: mockUnclaimedRewards,
    fetchData: jest.fn(),
  }),
}));

let mockIsClaiming = {
  everything: false,
  raffleETH: false,
  donatedNFT: false,
  donatedERC20: false,
};
jest.mock('../../../../../hooks/useClaimAllocations', () => ({
  useClaimAllocations: () => ({
    isClaiming: mockIsClaiming,
    claimingDonatedNFTs: [],
    claimingDonatedTokens: [],
    txStage: { status: 'idle' },
    retrieveEverything: mockRetrieveEverything,
    retrieveAllStellarSelectionETH: mockRetrieveAllStellarSelectionETH,
    claimDonatedNFT: mockClaimDonatedNFT,
    claimAllDonatedNFTs: mockClaimAllDonatedNFTs,
    claimDonatedERC20: mockClaimDonatedERC20,
    claimAllDonatedERC20: mockClaimAllDonatedERC20,
  }),
}));

const mockDeadlines: Record<number, number> = {};
jest.mock('../../../../../components/winnings/useRetrievalDeadlines', () => ({
  useRetrievalDeadlines: () => ({ deadlines: mockDeadlines, isLoading: false }),
}));

jest.mock('../../../../../components/winnings/EthAllocationsTable', () => ({
  EthAllocationsTable: ({ rows }: { rows: unknown[] }) => (
    <div data-testid="eth-allocations-table">rows: {rows.length}</div>
  ),
}));
jest.mock('../../../../../components/winnings/AttachedRetrievalTables', () => ({
  AttachedNftRetrievalTable: ({
    rows,
    onRetrieve,
  }: {
    rows: { Index: number }[];
    onRetrieve: (index: number) => void;
  }) => (
    <div data-testid="attached-nft-table">
      nfts: {rows.length}
      <button type="button" onClick={() => onRetrieve(rows[0]!.Index)}>
        retrieve first nft
      </button>
    </div>
  ),
  AttachedTokenRetrievalTable: ({
    rows,
    onRetrieve,
  }: {
    rows: unknown[];
    onRetrieve: (row: unknown) => void;
  }) => (
    <div data-testid="attached-erc20-table">
      tokens: {rows.length}
      <button type="button" onClick={() => onRetrieve(rows[0])}>
        retrieve first token
      </button>
    </div>
  ),
}));
jest.mock('../../../../../components/anchoring/UnretrievedCSTAnchorDistributionsTable', () => ({
  UnretrievedCSTAnchorDistributionsTable: () => <div data-testid="anchor-distributions" />,
}));

const DEPOSITS = [
  { EvtLogId: 1, RoundNum: 3, Amount: 0.5, TimeStamp: 1, TxHash: '0x1' },
  { EvtLogId: 2, RoundNum: 3, Amount: 0.25, TimeStamp: 2, TxHash: '0x2' },
  { EvtLogId: 3, RoundNum: 1, Amount: 0.125, TimeStamp: 3, TxHash: '0x3' },
];
const NFTS = [
  {
    Index: 12,
    TimeStamp: 2,
    RecordId: 1,
    TxHash: '0x1',
    DonorAddr: '0xD',
    RoundNum: 1,
    TokenAddr: '0xN',
  },
  {
    Index: 7,
    TimeStamp: 1,
    RecordId: 2,
    TxHash: '0x2',
    DonorAddr: '0xD',
    RoundNum: 1,
    TokenAddr: '0xN',
  },
];
const TOKENS = [
  {
    EvtLogId: 1,
    TxHash: '0x1',
    TimeStamp: 1,
    RoundNum: 0,
    TokenAddr: '0xARB',
    AmountDonatedEth: 2000,
    AmountClaimedEth: 0,
    DonateClaimDiff: '1999999999999999988000',
    WinnerAddr: '0xUser',
    Claimed: false,
  },
  {
    EvtLogId: 2,
    TxHash: '0x2',
    TimeStamp: 2,
    RoundNum: 1,
    TokenAddr: '0xClaimed',
    AmountDonatedEth: 5,
    AmountClaimedEth: 5,
    DonateClaimDiff: '0',
    WinnerAddr: '0xUser',
    Claimed: true,
  },
];

function withItems({
  deposits = DEPOSITS,
  nfts = NFTS,
  tokens = TOKENS,
}: { deposits?: unknown[]; nfts?: unknown[]; tokens?: unknown[] } = {}) {
  mockUseUnretrievedStellarSelectionDepositsByUser.mockReturnValue(
    query(deposits, { refetch: mockRefetchDeposits }),
  );
  mockUseUnclaimedDonatedNFTByUser.mockReturnValue(query(nfts, { refetch: mockRefetchNFTs }));
  mockUseDonationsERC20ByUser.mockReturnValue(query(tokens, { refetch: mockRefetchERC20 }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
  mockApiData = { UnretrievedAnchorDistribution: 0 };
  mockUnclaimedRewards = [];
  mockIsClaiming = { everything: false, raffleETH: false, donatedNFT: false, donatedERC20: false };
  withItems();
});

describe('MyWinnings', () => {
  it('asks for a wallet and links the public view when none is connected', () => {
    mockAccount = null;
    render(<MyWinnings />);
    expect(screen.getByText('wallet.required.allocations.title')).toBeInTheDocument();
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /wallet\.required\.allocations\.publicLink/ }),
    ).toHaveAttribute('href', '/allocation');
  });

  it('shows the error state when a list fails to load', () => {
    mockUseUnclaimedDonatedNFTByUser.mockReturnValue(
      query(undefined, { isError: true, refetch: mockRefetchNFTs }),
    );
    render(<MyWinnings />);
    expect(screen.getByText('myPages.allocations.loadErrorTitle')).toBeInTheDocument();
    expect(screen.queryByTestId('retrieval-summary')).not.toBeInTheDocument();
  });

  it('shows the error state, never "nothing to retrieve", when the attached-token read fails', () => {
    withItems({ deposits: [], nfts: [] });
    mockUseDonationsERC20ByUser.mockReturnValue(
      query(undefined, { isError: true, refetch: mockRefetchERC20 }),
    );
    render(<MyWinnings />);
    expect(screen.getByText('myPages.allocations.loadErrorTitle')).toBeInTheDocument();
    expect(screen.queryByText('myPages.allocations.nothing.title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('retrieve-everything')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockRefetchERC20).toHaveBeenCalledTimes(1);
  });

  it('never offers "Retrieve everything" without the tokens when only the token read fails', () => {
    mockUseDonationsERC20ByUser.mockReturnValue(
      query(undefined, { isError: true, refetch: mockRefetchERC20 }),
    );
    render(<MyWinnings />);
    expect(screen.queryByTestId('retrieval-summary')).not.toBeInTheDocument();
    expect(mockRetrieveEverything).not.toHaveBeenCalled();
  });

  it('leads with what is ready: the ETH total, the NFT and token counts', () => {
    render(<MyWinnings />);
    const summary = screen.getByTestId('retrieval-summary');
    expect(
      within(summary).getByRole('heading', { name: 'myPages.allocations.summary.title' }),
    ).toBeInTheDocument();
    const figure = (id: string) => summary.querySelector(`[data-figure="${id}"]`);
    expect(figure('eth')).toHaveTextContent('0.875');
    expect(figure('eth')).toHaveTextContent('myPages.allocations.summary.cycles(count=2)');
    expect(figure('nfts')).toHaveTextContent('2');
    expect(figure('tokens')).toHaveTextContent('1');
  });

  it('retrieves everything in one transaction: distinct cycles, NFT indexes and raw token amounts', () => {
    render(<MyWinnings />);
    fireEvent.click(screen.getByTestId('retrieve-everything'));
    expect(mockRetrieveEverything).toHaveBeenCalledWith({
      ethRounds: [1, 3],
      nftIndexes: [7, 12],
      tokenClaims: [{ roundNum: 0, tokenAddress: '0xARB', amount: '1999999999999999988000' }],
      successMessage: 'myPages.allocations.summary.success',
    });
  });

  it('keeps each kind of item in its own section, retrieved tokens left out', () => {
    render(<MyWinnings />);
    expect(screen.getByTestId('eth-allocations-table')).toHaveTextContent('rows: 3');
    expect(screen.getByTestId('attached-nft-table')).toHaveTextContent('nfts: 2');
    expect(screen.getByTestId('attached-erc20-table')).toHaveTextContent('tokens: 1');
    // Nothing waits from the anchoring contract, so that section is folded away.
    expect(screen.queryByTestId('anchor-distributions')).not.toBeInTheDocument();
  });

  it('retrieves a section on its own from the section header', () => {
    render(<MyWinnings />);
    const nfts = screen.getByRole('region', { name: 'myPages.allocations.sections.nfts' });
    fireEvent.click(within(nfts).getByRole('button', { name: 'myPages.allocations.retrieveAll' }));
    expect(mockClaimAllDonatedNFTs).toHaveBeenCalledWith([7, 12]);

    const tokens = screen.getByRole('region', { name: 'myPages.allocations.sections.erc20' });
    fireEvent.click(
      within(tokens).getByRole('button', { name: 'myPages.allocations.retrieveAll' }),
    );
    expect(mockClaimAllDonatedERC20).toHaveBeenCalledWith([
      { roundNum: 0, tokenAddress: '0xARB', amount: '1999999999999999988000' },
    ]);

    const eth = screen.getByRole('region', { name: 'myPages.allocations.sections.eth' });
    fireEvent.click(within(eth).getByRole('button', { name: 'myPages.allocations.retrieveAll' }));
    expect(mockRetrieveAllStellarSelectionETH).toHaveBeenCalledWith([3, 3, 1]);
  });

  it('retrieves one attached item from its row with the raw token amount', () => {
    render(<MyWinnings />);
    fireEvent.click(screen.getByRole('button', { name: 'retrieve first nft' }));
    expect(mockClaimDonatedNFT).toHaveBeenCalledWith(7);
    fireEvent.click(screen.getByRole('button', { name: 'retrieve first token' }));
    expect(mockClaimDonatedERC20).toHaveBeenCalledWith(0, '0xARB', '1999999999999999988000');
  });

  it('shows the Anchor Distributions section and figure when some are waiting', () => {
    mockApiData = { UnretrievedAnchorDistribution: 0.156 };
    render(<MyWinnings />);
    expect(screen.getByTestId('anchor-distributions')).toBeInTheDocument();
    expect(
      screen.getByTestId('retrieval-summary').querySelector('[data-figure="anchor"]'),
    ).toHaveTextContent('0.156');
  });

  it('shows one empty state when nothing is waiting anywhere', () => {
    withItems({ deposits: [], nfts: [], tokens: [TOKENS[1]] });
    render(<MyWinnings />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'myPages.allocations.nothing.title' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('retrieval-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('eth-allocations-table')).not.toBeInTheDocument();
  });

  it('holds the commit button while its transaction runs', () => {
    mockIsClaiming = { ...mockIsClaiming, everything: true };
    render(<MyWinnings />);
    expect(screen.getByTestId('retrieve-everything')).toHaveAttribute('aria-busy', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MyWinnings />);
    await checkA11y(container);
  });
});
