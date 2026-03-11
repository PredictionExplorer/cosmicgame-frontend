import { render, screen, checkA11y } from '@/test-utils';

import NFTTrait from '../NFTTrait';

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseCSTInfo = jest
  .fn()
  .mockReturnValue({ data: undefined, isLoading: false, refetch: jest.fn() });
const mockUseNameHistory = jest
  .fn()
  .mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
const mockUseCTOwnershipTransfers = jest.fn().mockReturnValue({
  data: [],
  isLoading: false,
  refetch: jest.fn(),
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCSTInfo: (...args: unknown[]) => mockUseCSTInfo(...args),
  useNameHistory: (...args: unknown[]) => mockUseNameHistory(...args),
  useCTOwnershipTransfers: (...args: unknown[]) => mockUseCTOwnershipTransfers(...args),
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xOwner' }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: jest.fn() }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../hooks/useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => ({
    read: { totalSupply: jest.fn() },
    write: { transferFrom: jest.fn(), setNftName: jest.fn() },
  }),
}));

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));

jest.mock('../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: jest.fn() }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('../NFTImage', () => ({
  __esModule: true,
  default: () => <div data-testid="nft-image" />,
}));
jest.mock('../NFTVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="nft-video" />,
}));
jest.mock('../../../components/tables/NameHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="name-history-table" />,
}));
jest.mock('../../../components/tables/TransferHistoryTable', () => ({
  TransferHistoryTable: () => <div data-testid="transfer-history-table" />,
}));
jest.mock('../../../components/common/VideoPlayerDialog', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('yet-another-react-lightbox', () => ({
  __esModule: true,
  default: () => null,
}));

beforeEach(() => jest.clearAllMocks());

const baseNft = {
  TokenId: 5,
  Seed: 'abc123',
  TimeStamp: 1700000000,
  TxHash: '0xTx',
  WinnerAddr: '0xWinner',
  CurOwnerAddr: '0xOwner',
  RoundNum: 3,
  RecordType: 3,
  TokenName: 'MyToken',
  Staked: false,
  WasUnstaked: false,
};

describe('NFTTrait', () => {
  it('shows loading state', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders NFT details after data loads', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: { MainStats: { NumCSTokenMints: 10, TotalNamedTokens: 3 } },
      isLoading: false,
    });
    mockUseCSTInfo.mockReturnValue({ data: baseNft, isLoading: false, refetch: jest.fn() });
    mockUseNameHistory.mockReturnValue({
      data: [{ TokenName: 'MyToken' }],
      isLoading: false,
      refetch: jest.fn(),
    });
    render(<NFTTrait tokenId={5} />);

    expect(screen.getByText('0xWinner')).toBeInTheDocument();
    expect(screen.getByText('0xOwner')).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
    expect(screen.getByTestId('nft-image')).toBeInTheDocument();
  });

  it('shows staking eligibility when token is not staked', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: { MainStats: { NumCSTokenMints: 10, TotalNamedTokens: 3 } },
      isLoading: false,
    });
    mockUseCSTInfo.mockReturnValue({
      data: { ...baseNft, Staked: false, WasUnstaked: false },
      isLoading: false,
      refetch: jest.fn(),
    });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('The token is eligible for staking.')).toBeInTheDocument();
  });

  it('shows already staked when token was staked', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: { MainStats: { NumCSTokenMints: 10, TotalNamedTokens: 3 } },
      isLoading: false,
    });
    mockUseCSTInfo.mockReturnValue({
      data: { ...baseNft, Staked: true },
      isLoading: false,
      refetch: jest.fn(),
    });
    render(<NFTTrait tokenId={5} />);
    expect(
      screen.getByText('The token has already been staked and cannot be staked again.'),
    ).toBeInTheDocument();
  });

  it('renders name history table when history exists', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: { MainStats: { NumCSTokenMints: 10, TotalNamedTokens: 3 } },
      isLoading: false,
    });
    mockUseCSTInfo.mockReturnValue({ data: baseNft, isLoading: false, refetch: jest.fn() });
    mockUseNameHistory.mockReturnValue({
      data: [{ TokenName: 'MyToken' }],
      isLoading: false,
      refetch: jest.fn(),
    });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('name-history-table')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<NFTTrait tokenId={5} />);
    await checkA11y(container);
  });
});
