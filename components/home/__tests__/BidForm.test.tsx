import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

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

  it('clicking RandomWalk radio calls setBidType and resets rwlkId', async () => {
    const user = userEvent.setup();
    render(<BidForm {...defaultProps} bidType="ETH" />);

    await user.click(screen.getByText('RandomWalk'));

    expect(defaultProps.setRwlkId).toHaveBeenCalledWith(-1);
    expect(defaultProps.setBidType).toHaveBeenCalledWith('RandomWalk');
  });

  it('clicking CST radio calls setBidType and resets rwlkId', async () => {
    const user = userEvent.setup();
    render(<BidForm {...defaultProps} bidType="ETH" />);

    await user.click(screen.getByText('CST(Cosmic Token)'));

    expect(defaultProps.setRwlkId).toHaveBeenCalledWith(-1);
    expect(defaultProps.setBidType).toHaveBeenCalledWith('CST');
  });

  it('switching donation type calls setDonationType and resets rwlkId', async () => {
    const user = userEvent.setup();
    render(<BidForm {...defaultProps} advancedExpanded={true} donationType="NFT" />);

    await user.click(screen.getByText('Token'));

    expect(defaultProps.setRwlkId).toHaveBeenCalledWith(-1);
    expect(defaultProps.setDonationType).toHaveBeenCalledWith('Token');
  });

  it('NFT donation address input calls setNftDonateAddress', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} donationType="NFT" />);
    const input = screen.getByPlaceholderText('NFT contract address');
    fireEvent.change(input, { target: { value: '0xNFTContract' } });
    expect(defaultProps.setNftDonateAddress).toHaveBeenCalledWith('0xNFTContract');
  });

  it('NFT number input calls setNftId', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} donationType="NFT" />);
    const input = screen.getByPlaceholderText('NFT number');
    fireEvent.change(input, { target: { value: '42' } });
    expect(defaultProps.setNftId).toHaveBeenCalledWith('42');
  });

  it('Token Contract Address input calls setTokenDonateAddress', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} donationType="Token" />);
    const input = screen.getByPlaceholderText('Token Contract Address');
    fireEvent.change(input, { target: { value: '0xTokenAddr' } });
    expect(defaultProps.setTokenDonateAddress).toHaveBeenCalledWith('0xTokenAddr');
  });

  it('Token Amount input calls setTokenAmount', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} donationType="Token" />);
    const input = screen.getByPlaceholderText('Token Amount');
    fireEvent.change(input, { target: { value: '100' } });
    expect(defaultProps.setTokenAmount).toHaveBeenCalledWith('100');
  });

  it('bid price plus input calls setBidPricePlus for values <= 50', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} bidType="ETH" />);
    const input = screen.getByPlaceholderText('Bid Price Plus');
    fireEvent.change(input, { target: { value: '10' } });
    expect(defaultProps.setBidPricePlus).toHaveBeenCalledWith(10);
  });

  it('bid price plus input rejects values > 50', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} bidType="ETH" />);
    const input = screen.getByPlaceholderText('Bid Price Plus');
    fireEvent.change(input, { target: { value: '51' } });
    expect(defaultProps.setBidPricePlus).not.toHaveBeenCalled();
  });

  it('computed bid price shows ETH amount with bidPricePlus applied', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} bidType="ETH" bidPricePlus={10} />);
    const expectedPrice = (0.01 * (1 + 10 / 100) * 1).toFixed(6);
    expect(screen.getByText(`${expectedPrice} ETH`)).toBeInTheDocument();
  });

  it('computed bid price applies 50% discount for RandomWalk', () => {
    render(
      <BidForm {...defaultProps} advancedExpanded={true} bidType="RandomWalk" bidPricePlus={0} />,
    );
    const expectedPrice = (0.01 * 1 * 0.5).toFixed(6);
    expect(screen.getByText(`${expectedPrice} ETH`)).toBeInTheDocument();
  });

  it('hides bid price collision prevention for CST bid type', () => {
    render(<BidForm {...defaultProps} advancedExpanded={true} bidType="CST" />);
    expect(screen.queryByText('Bid price collision prevention')).not.toBeInTheDocument();
  });

  it('shows AuctionInfo with endedMessage for CST when auction ended', () => {
    render(
      <BidForm
        {...defaultProps}
        bidType="CST"
        cstBidData={{ AuctionDuration: 3600, CSTPrice: 1.5, SecondsElapsed: 4000 }}
      />,
    );
    expect(screen.getByText('Auction ended, you can bid for free.')).toBeInTheDocument();
  });
});
