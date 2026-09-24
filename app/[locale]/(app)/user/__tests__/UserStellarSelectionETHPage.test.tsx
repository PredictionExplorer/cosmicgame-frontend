import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import UserStellarSelectionETHPage from '../stellar-selection-eth/[address]/UserStellarSelectionETHPage';

const ADDRESS = '0x1234567890123456789012345678901234567890';
const OTHER = '0x9999999999999999999999999999999999999999';

const mockRefetch = jest.fn();
const mockRetrieveAllStellarSelectionETH = jest.fn();
let mockAccount: string | null = ADDRESS;
let mockEthRetrieveBusy = false;
const mockUseStellarSelectionDepositsByUser = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useStellarSelectionDepositsByUser: (...args: unknown[]) =>
    mockUseStellarSelectionDepositsByUser(...args),
}));

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('../../../../../hooks/useClaimAllocations', () => ({
  useClaimAllocations: () => ({
    retrieveAllStellarSelectionETH: mockRetrieveAllStellarSelectionETH,
    isClaiming: {
      everything: false,
      raffleETH: mockEthRetrieveBusy,
      donatedNFT: false,
      donatedERC20: false,
    },
    txStage: { status: 'idle' },
  }),
}));

const DEPOSITS = [
  {
    EvtLogId: 1,
    TxHash: '0xabc',
    TimeStamp: 1_700_000_000,
    RoundNum: 1,
    Amount: 0.5,
    Claimed: true,
  },
  {
    EvtLogId: 2,
    TxHash: '0xdef',
    TimeStamp: 1_700_000_100,
    RoundNum: 2,
    Amount: 0.25,
    Claimed: false,
  },
  {
    EvtLogId: 3,
    TxHash: '0x123',
    TimeStamp: 1_700_000_200,
    RoundNum: 2,
    Amount: 0.125,
    Claimed: false,
  },
];

function withDeposits(data: unknown, isLoading = false) {
  mockUseStellarSelectionDepositsByUser.mockReturnValue({ data, isLoading, refetch: mockRefetch });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = ADDRESS;
  mockEthRetrieveBusy = false;
  withDeposits(DEPOSITS);
});

describe('UserStellarSelectionETHPage', () => {
  it('titles the page briefly and links back to the participant', () => {
    render(<UserStellarSelectionETHPage address={ADDRESS} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Stellar Selection · ETH' }),
    ).toBeInTheDocument();
    const trail = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(trail.querySelector(`a[href="/user/${ADDRESS}"]`)).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Participant profile' })).toHaveAttribute(
      'href',
      `/user/${ADDRESS}`,
    );
  });

  it('totals what was allocated and what still waits', () => {
    const { container } = render(<UserStellarSelectionETHPage address={ADDRESS} />);
    const figure = (id: string) => container.querySelector(`[data-figure="${id}"]`);
    expect(figure('total')).toHaveTextContent('0.8750');
    expect(figure('count')).toHaveTextContent('3');
    expect(figure('waiting')).toHaveTextContent('0.3750');
  });

  it('retrieves the waiting ETH from the owner’s page through the shared retrieval', () => {
    render(<UserStellarSelectionETHPage address={ADDRESS} />);
    fireEvent.click(screen.getByRole('button', { name: /Retrieve ETH/ }));
    expect(mockRetrieveAllStellarSelectionETH).toHaveBeenCalledWith([2, 2]);
  });

  it('offers no retrieval on someone else’s page', () => {
    mockAccount = OTHER;
    render(<UserStellarSelectionETHPage address={ADDRESS} />);
    expect(screen.queryByRole('button', { name: /Retrieve ETH/ })).not.toBeInTheDocument();
  });

  it('shows the designed empty state with a way to learn more', () => {
    withDeposits([]);
    render(<UserStellarSelectionETHPage address={ADDRESS} />);
    expect(screen.getByText('No Stellar Selection ETH yet')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /How Stellar Selection works/ })[0]).toHaveAttribute(
      'href',
      '/faq#how-does-the-stellarSelection-work',
    );
  });

  it('shows a failed read as an error with a retry, never as "no ETH yet"', () => {
    mockUseStellarSelectionDepositsByUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    render(<UserStellarSelectionETHPage address={ADDRESS} />);
    expect(screen.getByText("Couldn't load the Stellar Selection ETH")).toBeInTheDocument();
    expect(screen.queryByText('No Stellar Selection ETH yet')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retrieve ETH/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('explains an address that is not an address', () => {
    render(<UserStellarSelectionETHPage address="not-an-address" />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Not a valid address' }),
    ).toBeInTheDocument();
    expect(mockUseStellarSelectionDepositsByUser).toHaveBeenCalledWith(null);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserStellarSelectionETHPage address={ADDRESS} />);
    await checkA11y(container);
  });
});
