import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.mock('viem', () => ({
  ...jest.requireActual('../../../__mocks__/viem'),
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

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { GestureForm } from '../GestureForm';

const defaultProps = {
  data: { LastBidderAddr: '0xSomeAddr' } as Partial<DashboardInfo> as DashboardInfo,
  gestureType: 'ETH',
  setBidType: jest.fn(),
  contributionType: 'NFT',
  setContributionType: jest.fn(),
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
  gestureCostPlus: 2,
  setBidPricePlus: jest.fn(),
  advancedExpanded: false,
  setAdvancedExpanded: jest.fn(),
  rwlknftIds: [1, 3, 5],
  cstGestureData: { AuctionDuration: 3600, CSTPrice: 1.5, SecondsElapsed: 1800 },
  ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GestureForm', () => {
  it('renders gesture type selector with ETH option', () => {
    render(<GestureForm {...defaultProps} />);
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('Gesture Method')).toBeInTheDocument();
  });

  it('hides RandomWalk/CST when LastBidderAddr is zeroAddress', () => {
    render(
      <GestureForm
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
    expect(screen.queryByText('Cosmic Token')).not.toBeInTheDocument();
  });

  it('shows RandomWalk/CST when LastBidderAddr is not zero', () => {
    render(<GestureForm {...defaultProps} />);
    expect(screen.getByText('RandomWalk')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Token')).toBeInTheDocument();
  });

  it('ETH selection renders correctly', () => {
    render(<GestureForm {...defaultProps} gestureType="ETH" />);
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.queryByTestId('rwlk-grid')).not.toBeInTheDocument();
  });

  it('RandomWalk selection shows NFT gallery', () => {
    render(<GestureForm {...defaultProps} gestureType="RandomWalk" />);
    expect(screen.getByText('Your Random Walk NFTs')).toBeInTheDocument();
    expect(screen.getByTestId('rwlk-grid')).toHaveTextContent('3 NFTs');
  });

  it('CST selection shows Calibration Window info', () => {
    render(<GestureForm {...defaultProps} gestureType="CST" />);
    expect(screen.getByText('Calibration Window Duration:')).toBeInTheDocument();
  });

  it('Message textarea accepts input', () => {
    render(<GestureForm {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Leave a message with your gesture...');
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    expect(defaultProps.setMessage).toHaveBeenCalledWith('hello world');
  });

  it('Advanced options accordion toggles', () => {
    const { rerender } = render(<GestureForm {...defaultProps} advancedExpanded={false} />);
    expect(screen.getByText('Advanced Options')).toBeInTheDocument();

    rerender(<GestureForm {...defaultProps} advancedExpanded={true} />);
    expect(screen.getByText(/Attach tokens or NFTs to your gesture/)).toBeInTheDocument();
  });

  it('NFT contribution form renders with advancedExpanded=true, contributionType=NFT', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} contributionType="NFT" />);
    expect(screen.getByText('NFT Contract Address')).toBeInTheDocument();
    expect(screen.getByText('Token ID')).toBeInTheDocument();
  });

  it('Token contribution form renders with advancedExpanded=true, contributionType=Token', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} contributionType="Token" />);
    expect(screen.getByText('Contract Address')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('gesture cost collision prevention section shows for non-CST gesture types', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} gestureType="ETH" />);
    expect(screen.getByText('Collision Prevention')).toBeInTheDocument();
  });

  it('clicking RandomWalk radio calls setBidType and resets rwlkId', async () => {
    const user = userEvent.setup();
    render(<GestureForm {...defaultProps} gestureType="ETH" />);

    await user.click(screen.getByText('RandomWalk'));

    expect(defaultProps.setRwlkId).toHaveBeenCalledWith(-1);
    expect(defaultProps.setBidType).toHaveBeenCalledWith('RandomWalk');
  });

  it('clicking CST radio calls setBidType and resets rwlkId', async () => {
    const user = userEvent.setup();
    render(<GestureForm {...defaultProps} gestureType="ETH" />);

    await user.click(screen.getByText('Cosmic Token'));

    expect(defaultProps.setRwlkId).toHaveBeenCalledWith(-1);
    expect(defaultProps.setBidType).toHaveBeenCalledWith('CST');
  });

  it('switching contribution type calls setContributionType and resets rwlkId', async () => {
    const user = userEvent.setup();
    render(<GestureForm {...defaultProps} advancedExpanded={true} contributionType="NFT" />);

    await user.click(screen.getByText('Attach Token'));

    expect(defaultProps.setRwlkId).toHaveBeenCalledWith(-1);
    expect(defaultProps.setContributionType).toHaveBeenCalledWith('Token');
  });

  it('NFT contribution address input calls setNftDonateAddress', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} contributionType="NFT" />);
    const inputs = screen.getAllByPlaceholderText('0x...');
    fireEvent.change(inputs[0]!, { target: { value: '0xNFTContract' } });
    expect(defaultProps.setNftDonateAddress).toHaveBeenCalledWith('0xNFTContract');
  });

  it('NFT number input calls setNftId', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} contributionType="NFT" />);
    const input = screen.getByPlaceholderText('Token ID');
    fireEvent.change(input, { target: { value: '42' } });
    expect(defaultProps.setNftId).toHaveBeenCalledWith('42');
  });

  it('Token Contract Address input calls setTokenDonateAddress', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} contributionType="Token" />);
    const input = screen.getByPlaceholderText('0x...');
    fireEvent.change(input, { target: { value: '0xTokenAddr' } });
    expect(defaultProps.setTokenDonateAddress).toHaveBeenCalledWith('0xTokenAddr');
  });

  it('Token Amount input calls setTokenAmount', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} contributionType="Token" />);
    const input = screen.getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '100' } });
    expect(defaultProps.setTokenAmount).toHaveBeenCalledWith('100');
  });

  it('gesture cost plus input calls setBidPricePlus for values <= 50', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} gestureType="ETH" />);
    const input = screen.getByPlaceholderText('0');
    fireEvent.change(input, { target: { value: '10' } });
    expect(defaultProps.setBidPricePlus).toHaveBeenCalledWith(10);
  });

  it('gesture cost plus input rejects values > 50', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} gestureType="ETH" />);
    const input = screen.getByPlaceholderText('0');
    fireEvent.change(input, { target: { value: '51' } });
    expect(defaultProps.setBidPricePlus).not.toHaveBeenCalled();
  });

  it('computed gesture cost shows ETH amount with gestureCostPlus applied', () => {
    render(
      <GestureForm
        {...defaultProps}
        advancedExpanded={true}
        gestureType="ETH"
        gestureCostPlus={10}
      />,
    );
    const expectedPrice = (0.01 * (1 + 10 / 100) * 1).toFixed(6);
    expect(screen.getByText(`≈ ${expectedPrice} ETH`)).toBeInTheDocument();
  });

  it('computed gesture cost applies 50% discount for RandomWalk', () => {
    render(
      <GestureForm
        {...defaultProps}
        advancedExpanded={true}
        gestureType="RandomWalk"
        gestureCostPlus={0}
      />,
    );
    const expectedPrice = (0.01 * 1 * 0.5).toFixed(6);
    expect(screen.getByText(`≈ ${expectedPrice} ETH`)).toBeInTheDocument();
  });

  it('hides gesture cost collision prevention for CST gesture type', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} gestureType="CST" />);
    expect(screen.queryByText('Collision Prevention')).not.toBeInTheDocument();
  });

  it('shows CalibrationInfo with endedMessage for CST when window closed', () => {
    render(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        cstGestureData={{ AuctionDuration: 3600, CSTPrice: 1.5, SecondsElapsed: 4000 }}
      />,
    );
    expect(
      screen.getByText('Calibration Window ended \u2014 you can gesture for free.'),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureForm {...defaultProps} />);
    await checkA11y(container);
  });
});
