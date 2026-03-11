import { render, screen } from '@/test-utils';

import BidPage from '../[id]/BidPage';

const mockUseBidInfo = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidInfo: (...args: unknown[]) => mockUseBidInfo(...args),
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
  default: ({ src }: { src?: string }) => <img data-testid="nft-image" src={src} />,
}));

beforeEach(() => jest.clearAllMocks());

const baseBidInfo = {
  TxHash: '0xABC',
  TimeStamp: 1000,
  BidderAddr: '0xBidder',
  RoundNum: 5,
  BidType: 0,
  BidPriceEth: 1.5,
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

describe('BidPage', () => {
  it('shows error for negative bid id', () => {
    mockUseBidInfo.mockReturnValue({ data: null, isLoading: false });
    render(<BidPage bidId={-1} />);
    expect(screen.getByText('Invalid Bid Id')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseBidInfo.mockReturnValue({ data: null, isLoading: true });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows "no bid information" when data is null', () => {
    mockUseBidInfo.mockReturnValue({ data: null, isLoading: false });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('No bid information found.')).toBeInTheDocument();
  });

  it('renders bid information heading', () => {
    mockUseBidInfo.mockReturnValue({ data: baseBidInfo, isLoading: false });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('Bid Information')).toBeInTheDocument();
  });

  it('renders bidder address', () => {
    mockUseBidInfo.mockReturnValue({ data: baseBidInfo, isLoading: false });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('0xBidder')).toBeInTheDocument();
  });

  it('renders round number', () => {
    mockUseBidInfo.mockReturnValue({ data: baseBidInfo, isLoading: false });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders ETH bid price for BidType !== 2', () => {
    mockUseBidInfo.mockReturnValue({ data: baseBidInfo, isLoading: false });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('1.50 ETH')).toBeInTheDocument();
  });

  it('renders CST bid price for BidType === 2', () => {
    mockUseBidInfo.mockReturnValue({
      data: { ...baseBidInfo, BidType: 2, NumCSTTokensEth: 50 },
      isLoading: false,
    });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('50.00 CST')).toBeInTheDocument();
  });

  it('renders message', () => {
    mockUseBidInfo.mockReturnValue({ data: baseBidInfo, isLoading: false });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows "No" for RandomWalkNFT when RWalkNFTId < 0', () => {
    mockUseBidInfo.mockReturnValue({ data: baseBidInfo, isLoading: false });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('Was bid with RandomWalkNFT:')).toBeInTheDocument();
    const noTexts = screen.getAllByText('No');
    expect(noTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows RWLK NFT id when RWalkNFTId >= 0', () => {
    mockUseBidInfo.mockReturnValue({
      data: { ...baseBidInfo, RWalkNFTId: 42 },
      isLoading: false,
    });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('RandomWalkNFT ID:')).toBeInTheDocument();
    const matches = screen.getAllByText('42');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows donated ERC20 info when present', () => {
    mockUseBidInfo.mockReturnValue({
      data: {
        ...baseBidInfo,
        DonatedERC20TokenAddr: '0xToken',
        DonatedERC20TokenAmountEth: 10.5,
      },
      isLoading: false,
    });
    render(<BidPage bidId={1} />);
    expect(screen.getByText('Donated ERC20 Token Address:')).toBeInTheDocument();
    expect(screen.getByText('0xToken')).toBeInTheDocument();
  });
});
