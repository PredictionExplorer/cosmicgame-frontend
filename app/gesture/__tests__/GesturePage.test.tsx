import { render, screen, checkA11y } from '@/test-utils';

import GesturePage from '../[id]/GesturePage';

const mockUseGestureInfo = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureInfo: (...args: unknown[]) => mockUseGestureInfo(...args),
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
}));

jest.mock('../../../components/nft/RandomWalkNFT', () => ({
  __esModule: true,
  default: ({ tokenId }: { tokenId: number }) => <div data-testid="rwlk-nft">{tokenId}</div>,
}));

jest.mock('../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src?: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

beforeEach(() => jest.clearAllMocks());

const baseGestureInfo = {
  TxHash: '0xABC',
  TimeStamp: 1000,
  BidderAddr: '0xBidder',
  RoundNum: 5,
  GestureType: 0,
  GestureCostEth: 1.5,
  NumCSTTokensEth: 0,
  ERC20RewardAmountEth: 100,
  RWalkNFTId: -1,
  DonatedERC20TokenAddr: '',
  DonatedERC20TokenAmountEth: 0,
  NFTDonationTokenAddr: '',
  NFTDonationTokenId: -1,
  NFTTokenURI: '',
  Message: 'Hello World',
};

describe('GesturePage', () => {
  it('shows error for negative gesture id', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false });
    render(<GesturePage gestureId={-1} />);
    expect(screen.getByText('Invalid Gesture Id')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: true });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows "no gesture information" when data is null', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('No gesture information found.')).toBeInTheDocument();
  });

  it('renders gesture details heading', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('heading', { name: 'Gesture details', level: 1 })).toBeInTheDocument();
  });

  it('renders participant address', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('0xBidder')).toBeInTheDocument();
  });

  it('renders round number', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('link', { name: /Cycle 5/i })).toHaveAttribute('href', '/allocation/5');
  });

  it('renders ETH gesture cost for GestureType !== 2', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('1.50 ETH')).toBeInTheDocument();
  });

  it('renders CST gesture cost for GestureType === 2', () => {
    mockUseGestureInfo.mockReturnValue({
      data: { ...baseGestureInfo, GestureType: 2, NumCSTTokensEth: 50 },
      isLoading: false,
    });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('50.00 CST')).toBeInTheDocument();
  });

  it('renders message', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows "No" for RandomWalkNFT when RWalkNFTId < 0', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('Was gesture with RandomWalkNFT:')).toBeInTheDocument();
    const noTexts = screen.getAllByText('No');
    expect(noTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows RWLK NFT id when RWalkNFTId >= 0', () => {
    mockUseGestureInfo.mockReturnValue({
      data: { ...baseGestureInfo, RWalkNFTId: 42 },
      isLoading: false,
    });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('RandomWalkNFT ID:')).toBeInTheDocument();
    const matches = screen.getAllByText('42');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows attached ERC20 info when present', () => {
    mockUseGestureInfo.mockReturnValue({
      data: {
        ...baseGestureInfo,
        DonatedERC20TokenAddr: '0xToken',
        DonatedERC20TokenAmountEth: 10.5,
      },
      isLoading: false,
    });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('Attached ERC-20 Token Address:')).toBeInTheDocument();
    expect(screen.getByText('0xToken')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    const { container } = render(<GesturePage gestureId={1} />);
    await checkA11y(container);
  });
});
