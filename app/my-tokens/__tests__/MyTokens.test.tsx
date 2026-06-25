import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import MyWallet from '../MyTokens';

const mockUseCSTTokensByUser = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  isError: false,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useCSTTokensByUser: (...args: unknown[]) => mockUseCSTTokensByUser(...args),
}));

let mockAccount: string | null = '0xUser';
let mockActive = true;
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount, active: mockActive }),
}));

jest.mock('../../../components/tokens/CSTTable', () => ({
  CSTTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="cst-table">tokens: {list.length}</div>
  ),
}));

jest.mock('../../../components/nft/CosmicSignatureNftTransferForm', () => ({
  CosmicSignatureNftTransferForm: ({
    sourceAddress,
    tokens,
    historyHref,
    description,
  }: {
    sourceAddress: string;
    tokens: unknown[];
    historyHref: string;
    description: string;
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

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
  mockActive = true;
});

describe('MyTokens', () => {
  it('prompts login when no account', () => {
    mockAccount = null;
    mockActive = false;
    render(<MyWallet />);
    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    expect(
      screen.getByText('Please connect your wallet to view and manage your NFTs.'),
    ).toBeInTheDocument();
    expect(mockUseCSTTokensByUser).toHaveBeenCalledWith(undefined);
  });

  it('shows loading state', () => {
    mockUseCSTTokensByUser.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<MyWallet />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseCSTTokensByUser.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<MyWallet />);
    expect(screen.getByText('Failed to load Cosmic Signature NFTs.')).toBeInTheDocument();
  });

  it('renders token table with data', () => {
    mockUseCSTTokensByUser.mockReturnValue({
      data: [
        { TokenId: 1, TokenName: 'Alpha' },
        { TokenId: 2, TokenName: 'Beta' },
      ],
      isLoading: false,
      isError: false,
    });
    render(<MyWallet />);
    expect(screen.getByTestId('cst-table')).toHaveTextContent('tokens: 2');
    expect(screen.queryByTestId('nft-transfer-form')).not.toBeInTheDocument();
    expect(mockUseCSTTokensByUser).toHaveBeenCalledWith('0xUser');
  });

  it('renders page title', () => {
    mockUseCSTTokensByUser.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<MyWallet />);
    expect(screen.getByText('My NFTs')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature NFTs I Own')).toBeInTheDocument();
  });

  it('offers NFT transfers as a secondary collapsed option', async () => {
    const user = userEvent.setup();
    mockUseCSTTokensByUser.mockReturnValue({
      data: [
        { TokenId: 1, TokenName: 'Alpha' },
        { TokenId: 2, TokenName: 'Beta' },
      ],
      isLoading: false,
      isError: false,
    });

    render(<MyWallet />);

    expect(screen.getByTestId('cst-table')).toHaveTextContent('tokens: 2');
    expect(screen.queryByTestId('nft-transfer-form')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /transfer nfts/i }));

    const form = screen.getByTestId('nft-transfer-form');
    expect(form).toHaveAttribute('data-source', '0xUser');
    expect(form).toHaveAttribute('data-count', '2');
    expect(form).toHaveAttribute('data-history', '/cosmic-signature-transfer/0xUser');
    expect(form).toHaveTextContent('Select NFTs from this wallet only when you are ready');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MyWallet />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
