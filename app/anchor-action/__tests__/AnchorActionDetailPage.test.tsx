import { checkA11y, render, screen } from '@/test-utils';

import AnchorActionDetailPage from '../[IsRwalk]/[actionId]/AnchorActionDetailPage';

const mockUseRWLKAnchorActionInfo = jest.fn();
const mockUseCSTAnchorActionInfo = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useRWLKAnchorActionInfo: (...args: unknown[]) => mockUseRWLKAnchorActionInfo(...args),
  useCSTAnchorActionInfo: (...args: unknown[]) => mockUseCSTAnchorActionInfo(...args),
}));

jest.mock('../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  getAssetsUrl: (path: string) => `/assets/${path}`,
  getRWLKImageUrl: (id: string) => `/rwlk/${id}.png`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
}));

jest.mock('../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

beforeEach(() => jest.clearAllMocks());

const noData = { data: null, isLoading: false, error: null };

const anchorData = {
  Stake: {
    TokenId: 10,
    Seed: 'abc123',
    StakerAddr: '0xStaker',
    TxHash: '0xStakeTx',
    TimeStamp: 2000,
    NumStakedNFTs: 3,
  },
  Unstake: {
    EvtLogId: 0,
    TxHash: '',
    TimeStamp: 0,
    NumStakedNFTs: 0,
  },
};

describe('AnchorActionDetailPage', () => {
  it('renders RWLK heading when IsRwalk=1', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue(noData);
    render(<AnchorActionDetailPage IsRwalk={1} actionId={5} />);
    expect(screen.getByText('Anchor Action for RandomWalk Token')).toBeInTheDocument();
  });

  it('renders CST heading when IsRwalk=0', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue(noData);
    render(<AnchorActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Anchor Action for Cosmic Signature Token')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue({ data: null, isLoading: true, error: null });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Fetch failed' },
    });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Fetch failed')).toBeInTheDocument();
  });

  it('shows "no data" when actionInfo is null', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue(noData);
    render(<AnchorActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('No data found for this anchor action.')).toBeInTheDocument();
  });

  it('renders anchor info when data is available (CST)', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue({
      data: anchorData,
      isLoading: false,
      error: null,
    });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Anchor')).toBeInTheDocument();
    expect(screen.getByText('0xStaker')).toBeInTheDocument();
  });

  it('uses RWLK hook when IsRwalk=1', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue({
      data: anchorData,
      isLoading: false,
      error: null,
    });
    mockUseCSTAnchorActionInfo.mockReturnValue(noData);
    render(<AnchorActionDetailPage IsRwalk={1} actionId={7} />);
    expect(mockUseRWLKAnchorActionInfo).toHaveBeenCalledWith(7);
    expect(mockUseCSTAnchorActionInfo).toHaveBeenCalledWith(null);
  });

  it('uses CST hook when IsRwalk=0', () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue(noData);
    render(<AnchorActionDetailPage IsRwalk={0} actionId={7} />);
    expect(mockUseRWLKAnchorActionInfo).toHaveBeenCalledWith(null);
    expect(mockUseCSTAnchorActionInfo).toHaveBeenCalledWith(7);
  });

  it('has no accessibility violations', async () => {
    mockUseRWLKAnchorActionInfo.mockReturnValue(noData);
    mockUseCSTAnchorActionInfo.mockReturnValue(noData);
    const { container } = render(<AnchorActionDetailPage IsRwalk={0} actionId={5} />);
    await checkA11y(container);
  });
});
