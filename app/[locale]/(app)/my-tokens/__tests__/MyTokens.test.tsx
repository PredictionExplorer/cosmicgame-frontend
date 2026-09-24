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

let mockAccount: string | null = '0xUser';
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

jest.mock('@/components/nft/CosmicSignatureNftTransferForm', () => ({
  CosmicSignatureNftTransferForm: ({
    sourceAddress,
    tokens,
    historyHref,
    description,
  }: {
    sourceAddress: string;
    tokens: unknown[];
    historyHref: string;
    description?: string;
  }) => (
    <div
      data-testid="nft-transfer-form"
      data-source={sourceAddress}
      data-count={tokens.length}
      data-history={historyHref}
    >
      {description}
    </div>
  ),
}));

const tokens = [
  { TokenId: 1, TokenName: 'Alpha', Seed: 'a1', Staked: true },
  { TokenId: 7, TokenName: '', Seed: 'a7', Staked: false },
];

function tokensState(overrides = {}) {
  return { data: tokens, isLoading: false, isError: false, refetch: jest.fn(), ...overrides };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
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
  });

  it('hangs the wallet as a collection, newest first, with its figures', () => {
    render(<MyTokens />);
    expect(mockUseCSTTokensByUser).toHaveBeenCalledWith('0xUser');
    const wall = screen.getByRole('list', { name: 'myPages.tokens.page.ownedTitle' });
    const cards = within(wall).getAllByTestId('signature-card');
    expect(cards.map((card) => card.getAttribute('data-token-id'))).toEqual(['7', '1']);
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

  it('points an empty wallet to the gallery', () => {
    mockUseCSTTokensByUser.mockReturnValue(tokensState({ data: [] }));
    render(<MyTokens />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'myPages.tokens.page.emptyTitle' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /wallet\.required\.nfts\.publicLink/ }),
    ).toHaveAttribute('href', '/gallery');
    expect(screen.queryByText('myPages.tokens.page.transferTitle')).not.toBeInTheDocument();
  });

  it('links to the Cosmic Signature marketplace from the page header', () => {
    render(<MyTokens />);
    expect(screen.getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' })).toHaveAttribute(
      'href',
      COSMIC_SIGNATURE_MARKETPLACE_URL,
    );
  });

  it('offers NFT transfers as a secondary collapsed option', async () => {
    const user = userEvent.setup();
    render(<MyTokens />);
    expect(screen.queryByTestId('nft-transfer-form')).not.toBeInTheDocument();

    await user.click(screen.getByText('myPages.tokens.page.transferTitle'));

    const form = screen.getByTestId('nft-transfer-form');
    expect(form).toHaveAttribute('data-source', '0xUser');
    expect(form).toHaveAttribute('data-count', '2');
    expect(form).toHaveAttribute('data-history', '/cosmic-signature-transfer/0xUser');
    // The disclosure's own heading and subtitle introduce the form: no second description.
    expect(form).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MyTokens />);
    await checkA11y(container);
  });
});
