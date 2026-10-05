import userEvent from '@testing-library/user-event';

import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';

import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import MyTokens from '../MyTokens';

const mockUseCSTTokensByUser = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTTokensByUser: (address: string | undefined) => mockUseCSTTokensByUser(address),
}));

const mockUseCollectionTraits = jest.fn();
jest.mock('@/hooks/useNftTraits', () => ({
  useCollectionTraits: () => mockUseCollectionTraits(),
}));

let mockAccount: string | null = '0x1111111111111111111111111111111111111111';
let mockActive = true;
jest.mock('@/hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount, active: mockActive }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, unoptimized: _u, fetchPriority: _fp, ...rest } = props;
    return <img {...rest} />;
  },
}));

// The sheet's form talks to the wallet; its own suite covers it.
jest.mock('@/components/nft/NftSendSheet', () => ({
  NftSendSheet: ({
    open,
    items,
    sourceAddress,
    historyHref,
  }: {
    open: boolean;
    items: { tokenId: number }[];
    sourceAddress: string;
    historyHref: string;
  }) =>
    open ? (
      <div
        data-testid="nft-send-sheet"
        data-source={sourceAddress}
        data-ids={items.map((item) => item.tokenId).join(',')}
        data-history={historyHref}
      />
    ) : null,
}));

const ACCOUNT = '0x1111111111111111111111111111111111111111';

const tokens = [
  { TokenId: 1, TokenName: 'Alpha', Seed: 'a1', Staked: true },
  { TokenId: 7, TokenName: '', Seed: 'a7', Staked: false },
];

function tokensState(overrides = {}) {
  return { data: tokens, isLoading: false, isError: false, refetch: jest.fn(), ...overrides };
}

const card = (id: number) =>
  screen
    .getAllByTestId('signature-card')
    .find((element) => element.getAttribute('data-token-id') === String(id))!;

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = ACCOUNT;
  mockActive = true;
  mockUseCSTTokensByUser.mockReturnValue(tokensState());
  mockUseCollectionTraits.mockReturnValue({ traits: null, isLoading: false, isError: true });
});

describe('MyTokens', () => {
  it('asks for a wallet, and reads nothing, while disconnected', () => {
    mockAccount = null;
    mockActive = false;
    mockUseCSTTokensByUser.mockReturnValue(tokensState({ data: undefined }));
    render(<MyTokens />);
    expect(screen.getByText('wallet.required.nfts.title')).toBeInTheDocument();
    expect(screen.getByText('wallet.required.nfts.description')).toBeInTheDocument();
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /wallet\.required\.nfts\.publicLink/ }),
    ).toHaveAttribute('href', '/gallery');
    expect(mockUseCSTTokensByUser).toHaveBeenCalledWith(undefined);
    // The subtitle never speaks of a wallet that is not there.
    expect(screen.getByText('myPages.tokens.page.subtitle')).toBeInTheDocument();
    expect(screen.queryByTestId('newest-plates')).not.toBeInTheDocument();
  });

  it('hangs the newest plates instead of a wallet icon while disconnected (V254)', () => {
    mockAccount = null;
    mockActive = false;
    mockUseCSTTokensByUser.mockReturnValue(tokensState({ data: undefined }));
    render(
      <MyTokens
        newest={[
          { tokenId: 48, seed: 'aa' },
          { tokenId: 47, seed: 'bb' },
          { tokenId: 46, seed: 'cc' },
        ]}
      />,
    );
    const plates = screen.getByTestId('newest-plates');
    expect(within(plates).getAllByRole('listitem', { hidden: true })).toHaveLength(3);
    expect(plates).toHaveTextContent('myPages.tokens.page.newestCaption');
  });

  it('hangs the wallet as a collection, newest first, with its figures', () => {
    render(<MyTokens />);
    expect(mockUseCSTTokensByUser).toHaveBeenCalledWith(ACCOUNT);
    const wall = screen.getByRole('list', { name: 'myPages.tokens.page.ownedTitle' });
    const cards = within(wall).getAllByTestId('signature-card');
    expect(cards.map((element) => element.getAttribute('data-token-id'))).toEqual(['7', '1']);
    expect(within(cards[1]!).getByText('Alpha')).toBeInTheDocument();
    expect(within(cards[1]!).getByTestId('anchored-mark')).toBeInTheDocument();
    const figures = screen.getAllByRole('definition');
    expect(figures.map((figure) => figure.textContent)).toEqual(['2', '1']);
  });

  it('shows plate skeletons while the wallet loads', () => {
    mockUseCSTTokensByUser.mockReturnValue(tokensState({ data: undefined, isLoading: true }));
    render(<MyTokens />);
    expect(screen.getByTestId('signature-grid-skeleton')).toBeInTheDocument();
  });

  it('offers a retry when the wallet cannot be read', () => {
    const refetch = jest.fn();
    mockUseCSTTokensByUser.mockReturnValue(
      tokensState({ data: undefined, isError: true, refetch }),
    );
    render(<MyTokens />);
    expect(screen.getByText('myPages.tokens.page.loadErrorMessage')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalled();
  });

  // V068: TanStack keeps the data when a refetch (after a send, on Retry)
  // fails; the wall, its figures and the send mode stay up.
  it('keeps the wall when a refetch fails after a load', () => {
    mockUseCSTTokensByUser.mockReturnValue(tokensState({ isError: true }));
    render(<MyTokens />);
    expect(screen.queryByText('myPages.tokens.page.loadErrorMessage')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('signature-card')).toHaveLength(2);
    expect(screen.getByTestId('nft-send-mode')).toBeInTheDocument();
  });

  it('points an empty wallet to the gallery', () => {
    mockUseCSTTokensByUser.mockReturnValue(tokensState({ data: [] }));
    render(<MyTokens />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'myPages.tokens.page.emptyTitle' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /wallet\.required\.nfts\.publicLink/ }),
    ).toHaveAttribute('href', '/gallery');
    expect(screen.queryByTestId('nft-send-mode')).not.toBeInTheDocument();
  });

  it('links to the marketplace from the page header with its one label', () => {
    render(<MyTokens />);
    const link = screen.getByRole('link', { name: /^nav\.ecosystem\.axiomZero\.label/ });
    expect(link).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(link).toHaveTextContent('nav.ecosystem.axiomZero.label');
  });

  it('offers to anchor while a Signature here has never been anchored', () => {
    render(<MyTokens />);
    expect(screen.getByRole('link', { name: 'myPages.tokens.page.anchorLink' })).toHaveAttribute(
      'href',
      '/my-anchors',
    );
  });

  it('offers no anchoring once every Signature is anchored or was released', () => {
    mockUseCSTTokensByUser.mockReturnValue(
      tokensState({
        data: [
          { TokenId: 1, Seed: 'a1', Staked: true },
          { TokenId: 7, Seed: 'a7', Staked: false, WasUnstaked: true },
        ],
      }),
    );
    render(<MyTokens />);
    expect(
      screen.queryByRole('link', { name: 'myPages.tokens.page.anchorLink' }),
    ).not.toBeInTheDocument();
  });

  // V249: sending is a mode of the one wall, not a second grid of the same art.
  describe('send mode', () => {
    it('puts a checkbox in each wall label and says why a piece cannot go', async () => {
      const user = userEvent.setup();
      render(<MyTokens />);
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

      const toggle = screen.getByTestId('nft-send-mode');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'true');

      // Still one wall of plates.
      expect(screen.getAllByTestId('signature-card')).toHaveLength(2);
      expect(within(card(7)).getByRole('checkbox')).toBeEnabled();
      expect(within(card(1)).getByRole('checkbox')).toBeDisabled();
      expect(card(1)).toHaveTextContent('myPages.nftTransfer.statusLabels.anchored');
      // Nothing dims the art: only the disabled checkbox itself fades.
      const dimmed = Array.from(card(1).querySelectorAll('[class*="opacity-50"]'));
      expect(dimmed.filter((element) => element.tagName !== 'INPUT')).toEqual([]);
      expect(screen.getByTestId('nft-send-bar')).toHaveTextContent(
        'myPages.nftTransfer.pickerSummary(selected=0,total=1)',
      );
    });

    it('opens the send sheet with the chosen Signatures', async () => {
      const user = userEvent.setup();
      render(<MyTokens />);
      await user.click(screen.getByTestId('nft-send-mode'));
      const bar = screen.getByTestId('nft-send-bar');
      const send = within(bar).getByRole('button', { name: /myPages\.nftTransfer\.send/ });
      expect(send).toBeDisabled();

      await user.click(within(card(7)).getByRole('checkbox'));
      expect(bar).toHaveTextContent('myPages.nftTransfer.pickerSummary(selected=1,total=1)');
      expect(send).toHaveTextContent('myPages.nftTransfer.sendCount(count=1)');
      await user.click(send);

      const sheet = screen.getByTestId('nft-send-sheet');
      expect(sheet).toHaveAttribute('data-ids', '7');
      expect(sheet).toHaveAttribute('data-source', ACCOUNT);
      expect(sheet).toHaveAttribute('data-history', `/cosmic-signature-transfer/${ACCOUNT}`);
    });

    it('chooses every piece that can go, and leaves the mode on Cancel', async () => {
      const user = userEvent.setup();
      render(<MyTokens />);
      await user.click(screen.getByTestId('nft-send-mode'));
      const bar = screen.getByTestId('nft-send-bar');
      await user.click(within(bar).getByRole('button', { name: 'myPages.nftTransfer.selectAll' }));
      expect(within(card(7)).getByRole('checkbox')).toBeChecked();
      expect(within(card(1)).getByRole('checkbox')).not.toBeChecked();

      await user.click(within(bar).getAllByRole('button', { name: 'common.actions.cancel' })[0]!);
      expect(screen.queryByTestId('nft-send-bar')).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.getByTestId('nft-send-mode')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MyTokens />);
    await checkA11y(container);
  });

  it('has no accessibility violations in send mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<MyTokens />);
    await user.click(screen.getByTestId('nft-send-mode'));
    await checkA11y(container);
  });
});
