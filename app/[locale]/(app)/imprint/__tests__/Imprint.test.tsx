import userEvent from '@testing-library/user-event';

import { createFakeTxFlow } from '@/test-utils/txFlow';

import { checkA11y, renderWithQuery, screen, waitFor, within } from '@/test-utils';

import Imprint from '../Imprint';

const CONTRACT = '0x895a6F444BE4ba9d124F61DF736605792B35D66b';
const COST_WEI = 90_498_000_000_000_000n; // 0.090498 ETH

// The real query client: the cost and the owned tokens are queries.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));

const mockTx = createFakeTxFlow('0xUser' as `0x${string}`);
jest.mock('../../../../../hooks/useTxFlow', () => ({
  useTxFlow: () => mockTx.flow,
  useTxStageLabel: () => () => null,
}));

const mockGetImprintCost = jest.fn(() => Promise.resolve(COST_WEI));
const mockWalletOfOwner = jest.fn(() => Promise.resolve([] as readonly bigint[]));
jest.mock('../../../../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => ({
    read: { getMintPrice: mockGetImprintCost, walletOfOwner: mockWalletOfOwner }, // lexicon-allow-abi
  }),
}));

const mockReadContract = jest.fn(() => Promise.resolve(COST_WEI));
jest.mock('wagmi', () => ({
  ...jest.requireActual('../../../../../__mocks__/wagmi'),
  usePublicClient: () => ({ readContract: mockReadContract }),
}));

const mockAccount = jest.fn<string | null, []>(() => '0xUser');
jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount() }),
}));

jest.mock('../../../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({ randomWalkNft: CONTRACT }),
}));

const mockUsed = jest.fn(() => ({ data: [] as { RWalkTokenId: number }[] }));
jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: () => ({ data: { CurBidPriceEth: 0.10211 } }),
  useUsedRWLKNFTs: () => mockUsed(),
}));

jest.mock('../../../../../components/nft/RandomWalkPlate', () => ({
  RandomWalkPlate: ({ tokenId, alt }: { tokenId: number; alt: string }) => (
    <div data-testid="rwlk-art" data-alt={alt}>
      {tokenId}
    </div>
  ),
}));

jest.mock('../../../../../components/wallet/FundingNotice', () => ({
  FundingNotice: () => null,
}));

jest.mock('../../../../../components/wallet/NetworkGuard', () => ({
  ChainGuard: ({
    children,
    requireConnection,
  }: {
    children: React.ReactNode;
    requireConnection?: boolean;
  }) =>
    requireConnection && !mockAccount() ? <button type="button">Connect Wallet</button> : children,
}));

jest.mock('../randomWalkImprint', () => ({
  ...jest.requireActual('../randomWalkImprint'),
  imprintedTokenId: () => 4242,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockTx.reset();
  mockAccount.mockReturnValue('0xUser');
  mockWalletOfOwner.mockResolvedValue([]);
  mockUsed.mockReturnValue({ data: [] });
});

describe('Imprint', () => {
  it('shows the value it sends — the contract cost plus the buffer — never a guessed 0', async () => {
    renderWithQuery(<Imprint />);
    expect(screen.getByTestId('imprint-send-value')).not.toHaveTextContent(/^0/);
    await waitFor(() =>
      expect(screen.getByTestId('imprint-send-value')).toHaveTextContent('0.091403'),
    );
    expect(screen.getByTestId('imprint-cost-breakdown')).toHaveTextContent('0.090498');
  });

  it('asks a disconnected visitor to connect instead of offering an imprint', async () => {
    mockAccount.mockReturnValue(null);
    renderWithQuery(<Imprint />);
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Imprint now' })).not.toBeInTheDocument();
    expect(
      screen.getByText('Connect a wallet to imprint a RandomWalk NFT. Connecting signs nothing.'),
    ).toBeInTheDocument();
  });

  it('imprints through the transaction flow at the cost read just before sending', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Imprint />);
    const submit = await screen.findByRole('button', { name: 'Imprint now' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect(mockReadContract).toHaveBeenCalled();
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: CONTRACT,
        functionName: 'mint', // lexicon-allow-abi
        value: 91_402_980_000_000_000n,
      }),
    );
  });

  it('shows the new token and how to use it once the imprint confirms', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Imprint />);
    const submit = await screen.findByRole('button', { name: 'Imprint now' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    const success = await screen.findByTestId('imprint-success');
    expect(within(success).getByRole('heading')).toHaveTextContent('RandomWalk NFT #004242');
    expect(within(success).getByRole('link', { name: /Use it in a gesture/ })).toHaveAttribute(
      'href',
      '/?randomwalk=1&tokenId=4242#make-gesture',
    );
    expect(mockTx.lastSuccessMessage()).toBe('RandomWalk NFT #004242 is yours');
    // The owned list refreshes to include it.
    expect(mockWalletOfOwner.mock.calls.length).toBeGreaterThan(1);
  });

  it('lists the wallet’s Random Walk NFTs, newest first, marking used ones', async () => {
    mockWalletOfOwner.mockResolvedValue([3n, 12n, 7n]);
    mockUsed.mockReturnValue({ data: [{ RWalkTokenId: 7 }] });
    renderWithQuery(<Imprint />);

    const list = await screen.findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => item.getAttribute('data-token'))).toEqual(['12', '7', '3']);
    expect(items[1]).toHaveTextContent('Used');
    // Each plate is named by its token, with nothing drawn over the art.
    expect(within(items[0]!).getByTestId('rwlk-art')).toHaveAttribute(
      'data-alt',
      'RandomWalk NFT #000012',
    );
    expect(within(items[1]!).queryByRole('link')).toBeNull();
    expect(within(items[0]!).getByRole('link', { name: /Use in a gesture/ })).toHaveAttribute(
      'href',
      '/?randomwalk=1&tokenId=12#make-gesture',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithQuery(<Imprint />);
    await screen.findByRole('button', { name: 'Imprint now' });
    await checkA11y(container);
  });
});
