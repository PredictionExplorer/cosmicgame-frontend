import { checkA11y, render, screen } from '@/test-utils';

import MyWallet from '../MyTokens';

const mockUseCSTTokensByUser = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  isError: false,
});

jest.mock('../../../../hooks/useApiQuery', () => ({
  useCSTTokensByUser: (...args: unknown[]) => mockUseCSTTokensByUser(...args),
}));

let mockAccount: string | null = '0xUser';
jest.mock('../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('../../../../components/tokens/CSTTable', () => ({
  CSTTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="cst-table">tokens: {list.length}</div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
});

describe('MyTokens', () => {
  it('prompts login when no account', () => {
    mockAccount = null;
    render(<MyWallet />);
    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    expect(screen.getByText('Please connect your wallet to view your tokens.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseCSTTokensByUser.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<MyWallet />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseCSTTokensByUser.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<MyWallet />);
    expect(screen.getByText('Failed to load CST tokens.')).toBeInTheDocument();
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
  });

  it('renders page title', () => {
    mockUseCSTTokensByUser.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<MyWallet />);
    expect(screen.getByText('My Cosmic Signature Tokens')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature Tokens I Own')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MyWallet />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
