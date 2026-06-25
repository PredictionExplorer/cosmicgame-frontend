import { render, screen } from '@/test-utils';

import TransferCosmicSignatureNftsPage from '../TransferCosmicSignatureNftsPage';

const ACCOUNT = '0x1111111111111111111111111111111111111111';

let mockAccount: string | null = ACCOUNT;
let mockActive = true;
const mockUseCSTTokensByUser = jest.fn();

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    active: mockActive,
  }),
}));

jest.mock('../../../hooks/useApiQuery', () => ({
  useCSTTokensByUser: (...args: unknown[]) => mockUseCSTTokensByUser(...args),
}));

jest.mock('../../../components/nft/CosmicSignatureNftTransferForm', () => ({
  CosmicSignatureNftTransferForm: ({
    sourceAddress,
    tokens,
    historyHref,
  }: {
    sourceAddress: string;
    tokens: unknown[];
    historyHref: string;
  }) => (
    <div
      data-testid="nft-transfer-form"
      data-source={sourceAddress}
      data-count={tokens.length}
      data-history={historyHref}
    >
      NFT transfer form
    </div>
  ),
}));

describe('TransferCosmicSignatureNftsPage', () => {
  beforeEach(() => {
    mockAccount = ACCOUNT;
    mockActive = true;
    mockUseCSTTokensByUser.mockReturnValue({
      data: [{ TokenId: 1 }, { TokenId: 2 }],
      isLoading: false,
      isError: false,
    });
  });

  it('shows a wallet-required empty state when disconnected', () => {
    mockAccount = null;
    mockActive = false;

    render(<TransferCosmicSignatureNftsPage />);

    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    expect(screen.queryByTestId('nft-transfer-form')).not.toBeInTheDocument();
    expect(mockUseCSTTokensByUser).toHaveBeenCalledWith(undefined);
  });

  it('shows loading state while owned NFTs load', () => {
    mockUseCSTTokensByUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<TransferCosmicSignatureNftsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows an error state when owned NFTs fail to load', () => {
    mockUseCSTTokensByUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<TransferCosmicSignatureNftsPage />);

    expect(screen.getByText('Failed to load NFTs')).toBeInTheDocument();
  });

  it('renders the transfer form for the connected wallet', () => {
    render(<TransferCosmicSignatureNftsPage />);

    const form = screen.getByTestId('nft-transfer-form');
    expect(form).toHaveAttribute('data-source', ACCOUNT);
    expect(form).toHaveAttribute('data-count', '2');
    expect(form).toHaveAttribute('data-history', `/cosmic-signature-transfer/${ACCOUNT}`);
  });
});
