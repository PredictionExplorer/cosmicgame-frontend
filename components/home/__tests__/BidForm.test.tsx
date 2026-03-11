import '@testing-library/jest-dom';

jest.mock('viem', () => ({
  ...jest.requireActual('../../../__mocks__/viem.js'),
  zeroAddress: '0x0000000000000000000000000000000000000000',
}));

jest.mock('../../../utils', () => ({
  formatSeconds: jest.fn((s: number) => `${s}s`),
}));

jest.mock('../../nft/PaginationRWLKGrid', () => ({
  __esModule: true,
  default: ({ data }: { data: number[] }) => <div data-testid="rwlk-grid">{data.length} NFTs</div>,
}));

import type { DashboardInfo } from '@/services/api/types';

import { render, screen, fireEvent } from '@/test-utils';

import { BidForm } from '../BidForm';

const defaultProps = {
  data: { LastBidderAddr: '0xSomeAddr' } as Partial<DashboardInfo> as DashboardInfo,
  bidType: 'ETH',
  setBidType: jest.fn(),
  donationType: 'NFT',
  setDonationType: jest.fn(),
  message: '',
  setMessage: jest.fn(),
  nftDonateAddress: '',
  setNftDonateAddress: jest.fn(),
  nftId: '',
  setNftId: jest.fn(),
  tokenDonateAddress: '',
  setTokenDonateAddress: jest.fn(),
  tokenAmount: '',
  setTokenAmount: jest.fn(),
  rwlkId: -1,
  setRwlkId: jest.fn(),
  bidPricePlus: 2,
  setBidPricePlus: jest.fn(),
  advancedExpanded: false,
  setAdvancedExpanded: jest.fn(),
  rwlknftIds: [1, 3, 5],
  cstBidData: { AuctionDuration: 3600, CSTPrice: 1.5, SecondsElapsed: 1800 },
  ethBidInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BidForm', () => {
  it('renders bid type selector with ETH option', () => {
    render(<BidForm {...defaultProps} />);
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('Make your bid with:')).toBeInTheDocument();
  });

  it('hides RandomWalk/CST when LastBidderAddr is zeroAddress', () => {
    render(
      <BidForm
        {...defaultProps}
        data={
          {
            LastBidderAddr: '0x0000000000000000000000000000000000000000',
          } as Partial<DashboardInfo> as DashboardInfo
        }
      />,
    );
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.queryByText('RandomWalk')).not.toBeInTheDocument();
    expect(screen.queryByText('CST(Cosmic Token)')).not.toBeInTheDocument();
  });

  it('shows RandomWalk/CST when LastBidderAddr is not zero', () => {
    render(<BidForm {...defaultProps} />);
    expect(screen.getByText('RandomWalk')).toBeInTheDocument();
    expect(screen.getByText('CST(Cosmic Token)')).toBeInTheDocument();
  });

  it('ETH selection renders correctly', () => {
    render(<BidForm {...defaultProps} bidType="ETH" />);
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.queryByTestId('rwlk-grid')).not.toBeInTheDocument();
  });

  it('RandomWalk selection shows NFT gallery', () => {
    render(<BidForm {...defaultProps} bidType="RandomWalk" />);
    expect(screen.getByText('Random Walk NFT Gallery')).toBeInTheDocument();
    expect(screen.getByTestId('rwlk-grid')).toHaveTextContent('3 NFTs');
  });

  it('CST selection shows auction info', () => {
    render(<BidForm {...defaultProps} bidType="CST" />);
    expect(screen.getByText('Auction Duration:')).toBeInTheDocument();
  });

  it('Message textarea accepts input', () => {
    render(<BidForm {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Message (280 characters, optional)');
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    expect(defaultProps.setMessage).toHaveBeenCalledWith('hello world');
  });

  it('Advanced options accordion toggles', () => {
    const { rerender } = render(<BidForm {...defaultProps} advancedExpanded={false} />);
    expect(screen.getByText('Advanced Options')).toBeInTheDocument();

    rerender(<BidForm {...defaultProps} advancedExpanded={true} />);
    expect(
      screen.getByText(/If you want to donate tokens or one of your NFTs/),
    ).toBeInTheDocument();
  });

  it('NFT donation form renders with advancedExpanded=true, donationType=NFT', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} donationType="NFT" />);
    expect(screen.getByPlaceholderText('NFT contract address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('NFT number')).toBeInTheDocument();
  });

  it('Token donation form renders with advancedExpanded=true, donationType=Token', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} donationType="Token" />);
    expect(screen.getByPlaceholderText('Token Contract Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Token Amount')).toBeInTheDocument();
  });

  it('Bid price collision prevention section shows for non-CST bid types', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} bidType="ETH" />);
    expect(screen.getByText('Bid price collision prevention')).toBeInTheDocument();
  });
});
