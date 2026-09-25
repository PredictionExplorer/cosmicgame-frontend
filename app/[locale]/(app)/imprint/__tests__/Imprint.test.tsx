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
const mockNextTokenId = jest.fn(() => Promise.resolve(4115n));
jest.mock('../../../../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => ({
    read: {
      getMintPrice: mockGetImprintCost, // lexicon-allow-abi
      walletOfOwner: mockWalletOfOwner,
      nextTokenId: mockNextTokenId,
    },
  }),
}));

/** The game contract's record of used Random Walk NFTs, by token id (1 = used). */
type MulticallResult = { status: 'success'; result: bigint } | { status: 'failure' };
const mockMulticall = jest.fn(
  (args: { contracts: { args: readonly [bigint] }[] }): Promise<MulticallResult[]> =>
    Promise.resolve(args.contracts.map(() => ({ status: 'success', result: 0n }))),
);
const mockReadContract = jest.fn(() => Promise.resolve(COST_WEI));
jest.mock('wagmi', () => ({
  ...jest.requireActual('../../../../../__mocks__/wagmi'),
  usePublicClient: () => ({ readContract: mockReadContract, multicall: mockMulticall }),
}));

/** Answers the used-NFT multicall from a set of used ids. */
const usedOnChain = (used: readonly number[]) =>
  mockMulticall.mockImplementation((args) =>
    Promise.resolve(
      args.contracts.map((call) => ({
        status: 'success',
        result: used.includes(Number(call.args[0])) ? 1n : 0n,
      })),
    ),
  );

const mockAccount = jest.fn<string | null, []>(() => '0xUser');
jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount() }),
}));

jest.mock('../../../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({
    randomWalkNft: CONTRACT,
    cosmicGame: '0x1111111111111111111111111111111111111111',
  }),
}));

const mockUsed = jest.fn((): { data?: { RWalkTokenId: number }[]; isPending?: boolean } => ({
  data: [],
}));
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
  mockNextTokenId.mockResolvedValue(4115n);
  mockUsed.mockReturnValue({ data: [] });
  usedOnChain([]);
});

/** The list of the wallet's own Random Walk NFTs. */
const ownedList = async () =>
  within(
    (await screen.findByRole('heading', { name: 'Your Random Walk NFTs' })).closest('section')!,
  ).findByRole('list');

describe('Imprint', () => {
  it('shows the value it sends — the contract cost plus the buffer — never a guessed 0', async () => {
    renderWithQuery(<Imprint />);
    expect(screen.getByTestId('imprint-send-value')).not.toHaveTextContent(/^0/);
    await waitFor(() =>
      expect(screen.getByTestId('imprint-send-value')).toHaveTextContent('0.091403'),
    );
    expect(screen.getByTestId('imprint-cost-breakdown')).toHaveTextContent('0.090498');
  });

  it('states what one use saves at today’s cost, beside the imprint cost (V231)', async () => {
    renderWithQuery(<Imprint />);
    const saving = await screen.findByTestId('imprint-gesture-saving');
    // Half of 0.10211 ETH, at the gesture quote's five significant digits.
    expect(saving).toHaveTextContent('0.051055 ETH');
    expect(screen.getByText(/Half of today’s ETH Gesture Cost of 0\.10211/)).toBeInTheDocument();
    // The constant reduction is the lede's to state; the body names the second benefit instead.
    expect(screen.getByText('Anchored-NFT Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText(/10 anchored Random Walk NFTs are selected/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /See how anchoring works/ })).toHaveAttribute(
      'href',
      '/anchoring',
    );
  });

  it('shows the newest Random Walk NFTs before a wallet connects (V225)', async () => {
    mockAccount.mockReturnValue(null);
    renderWithQuery(<Imprint latestSeed={4115} />);
    const hero = screen.getByTestId('recent-imprints');
    // The server's reading paints the plate first: the newest id is the next one less one.
    const plates = within(hero).getAllByTestId('rwlk-art');
    expect(plates.map((plate) => plate.textContent)).toEqual(['4114', '4113', '4112', '4111']);
    expect(plates[0]).toHaveAttribute('data-alt', 'Random Walk NFT #004114');
    expect(within(hero).getByText('Latest imprint')).toBeInTheDocument();
  });

  it('keeps the hero plate current from the contract, and holds its place until then', async () => {
    mockNextTokenId.mockResolvedValue(4200n);
    renderWithQuery(<Imprint />);
    expect(screen.getByTestId('pending-plate')).toBeInTheDocument();
    const hero = await screen.findByTestId('recent-imprints');
    expect(within(hero).getAllByTestId('rwlk-art')[0]).toHaveTextContent('4199');
  });

  it('asks a disconnected visitor to connect instead of offering an imprint', async () => {
    mockAccount.mockReturnValue(null);
    renderWithQuery(<Imprint />);
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Imprint now' })).not.toBeInTheDocument();
    expect(
      screen.getByText('Connect a wallet to imprint a Random Walk NFT. Connecting signs nothing.'),
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
    expect(within(success).getByRole('heading')).toHaveTextContent('Random Walk NFT #004242');
    expect(within(success).getByRole('link', { name: /Use it in a gesture/ })).toHaveAttribute(
      'href',
      '/?randomwalk=1&tokenId=4242#make-gesture',
    );
    expect(mockTx.lastSuccessMessage()).toBe('Random Walk NFT #004242 is yours');
    // The owned list refreshes to include it.
    expect(mockWalletOfOwner.mock.calls.length).toBeGreaterThan(1);
  });

  it('lists the wallet’s Random Walk NFTs, newest first, marking used ones', async () => {
    mockWalletOfOwner.mockResolvedValue([3n, 12n, 7n]);
    mockUsed.mockReturnValue({ data: [{ RWalkTokenId: 7 }] });
    usedOnChain([7]);
    renderWithQuery(<Imprint />);

    const list = await ownedList();
    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => item.getAttribute('data-token'))).toEqual(['12', '7', '3']);
    await waitFor(() => expect(items[1]).toHaveTextContent('Used'));
    // Each plate is named by its token, with nothing drawn over the art.
    expect(within(items[0]!).getByTestId('rwlk-art')).toHaveAttribute(
      'data-alt',
      'Random Walk NFT #000012',
    );
    expect(within(items[1]!).queryByRole('link')).toBeNull();
    expect(within(items[0]!).getByRole('link', { name: /Use in a gesture/ })).toHaveAttribute(
      'href',
      '/?randomwalk=1&tokenId=12#make-gesture',
    );
  });

  it('says when the wallet’s tokens cannot be read and reads them again on retry', async () => {
    const user = userEvent.setup();
    mockWalletOfOwner.mockRejectedValueOnce(new Error('rpc down'));
    renderWithQuery(<Imprint />);

    // Not a skeleton forever: the failure is named, with a retry.
    const title = await screen.findByText('The Random Walk NFTs in this wallet could not be read.');
    expect(title.tagName).toBe('H3');

    mockWalletOfOwner.mockResolvedValueOnce([5n]);
    await user.click(screen.getByRole('button', { name: /errors\.state\.retry|Try again/ }));
    const list = await ownedList();
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.queryByText('The Random Walk NFTs in this wallet could not be read.'),
    ).not.toBeInTheDocument();
  });

  describe('which Random Walk NFTs are offered for a gesture (V070)', () => {
    it('says it is checking, and offers none, while the contract read is on its way', async () => {
      mockWalletOfOwner.mockResolvedValue([12n]);
      mockMulticall.mockImplementation(() => new Promise(() => {}));
      renderWithQuery(<Imprint />);
      const [item] = within(await ownedList()).getAllByRole('listitem');
      expect(item).toHaveTextContent('Checking');
      expect(item).not.toHaveTextContent('Unused');
      expect(within(item!).queryByRole('link', { name: /Use in a gesture/ })).toBeNull();
    });

    it('offers none, and says why, when the contract cannot be read and the indexer is silent', async () => {
      mockWalletOfOwner.mockResolvedValue([12n, 7n]);
      mockMulticall.mockRejectedValue(new Error('rpc down'));
      mockUsed.mockReturnValue({ data: [{ RWalkTokenId: 7 }] });
      renderWithQuery(<Imprint />);
      const list = await ownedList();
      await screen.findByTestId('imprint-use-unknown');
      const [twelve, seven] = within(list).getAllByRole('listitem');
      // The indexer can say "used" (a use never reverts), never "unused".
      expect(seven).toHaveTextContent('Used');
      expect(twelve).not.toHaveTextContent(/Unused|Checking/);
      expect(within(list).queryByRole('link', { name: /Use in a gesture/ })).toBeNull();
    });

    it('trusts the contract over an indexer that has not seen a recent gesture yet', async () => {
      mockWalletOfOwner.mockResolvedValue([12n]);
      mockUsed.mockReturnValue({ data: [] });
      usedOnChain([12]);
      renderWithQuery(<Imprint />);
      const [item] = within(await ownedList()).getAllByRole('listitem');
      await waitFor(() => expect(item).toHaveTextContent('Used'));
      expect(within(item!).queryByRole('link', { name: /Use in a gesture/ })).toBeNull();
    });

    it('offers a token the contract confirms unused, while the indexer list still loads', async () => {
      mockWalletOfOwner.mockResolvedValue([12n]);
      mockUsed.mockReturnValue({ data: undefined, isPending: true });
      renderWithQuery(<Imprint />);
      const [item] = within(await ownedList()).getAllByRole('listitem');
      expect(await within(item!).findByRole('link', { name: /Use in a gesture/ })).toHaveAttribute(
        'href',
        '/?randomwalk=1&tokenId=12#make-gesture',
      );
      expect(item).toHaveTextContent('Unused');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithQuery(<Imprint />);
    await screen.findByRole('button', { name: 'Imprint now' });
    await checkA11y(container);
  });
});
