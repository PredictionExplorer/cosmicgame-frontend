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
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

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
  cstGestureData: {
    AuctionDuration: 3600,
    CSTPrice: 1.5,
    CSTPriceWei: 1500000000000000000n,
    SecondsElapsed: 1800,
    isFree: false,
    source: 'api' as const,
  },
  ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
  gestureCstRewardAmount: 100,
  gestureCstRewardAmountMin: 99,
  isCstRewardLoading: false,
  cstRewardTolerancePercent: 1,
  setCstRewardTolerancePercent: jest.fn(),
  acceptAnyCstReward: false,
  setAcceptAnyCstReward: jest.fn(),
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
    expect(screen.queryByText('ETH + RWLK')).not.toBeInTheDocument();
    expect(screen.queryByText('ERC-20')).not.toBeInTheDocument();
  });

  it('shows RandomWalk/CST when LastBidderAddr is not zero', () => {
    render(<GestureForm {...defaultProps} />);
    expect(screen.getByText('ETH + RWLK')).toBeInTheDocument();
    expect(screen.getByText('ERC-20')).toBeInTheDocument();
  });

  it('ETH selection renders correctly', () => {
    render(<GestureForm {...defaultProps} gestureType="ETH" />);
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.queryByTestId('rwlk-grid')).not.toBeInTheDocument();
    expect(screen.getByText('CST Reward Preview')).toBeInTheDocument();
    expect(screen.queryByText(/Protection 1:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Protection 2:/)).not.toBeInTheDocument();
  });

  it('RandomWalk selection shows NFT gallery', () => {
    render(<GestureForm {...defaultProps} gestureType="RandomWalk" />);
    expect(screen.getByText('Your Random Walk NFTs')).toBeInTheDocument();
    expect(screen.getByTestId('rwlk-grid')).toHaveTextContent('3 NFTs');
    expect(screen.getByText('CST Reward Preview')).toBeInTheDocument();
    expect(screen.queryByText(/Protection 1:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Protection 2:/)).not.toBeInTheDocument();
  });

  it('CST selection shows Calibration Window info', () => {
    render(<GestureForm {...defaultProps} gestureType="CST" />);
    expect(screen.getByRole('region', { name: 'CST Calibration Window' })).toBeInTheDocument();
    expect(screen.getByText('Dynamic Duration')).toBeInTheDocument();
    expect(screen.getByText('50% complete')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'CST Calibration Window progress' }),
    ).toHaveAttribute('aria-valuenow', '50');
  });

  it('CST selection links to trade CST on Uniswap', () => {
    render(<GestureForm {...defaultProps} gestureType="CST" />);

    expect(screen.getByRole('link', { name: 'Trade CST on Uniswap' })).toHaveAttribute(
      'href',
      CST_UNISWAP_SWAP_URL,
    );
  });

  it('does not show the Uniswap trade link for ETH selection', () => {
    render(<GestureForm {...defaultProps} gestureType="ETH" />);

    expect(screen.queryByRole('link', { name: 'Trade CST on Uniswap' })).not.toBeInTheDocument();
  });

  it('shows first-gesture ETH Calibration Window copy before all methods unlock', () => {
    render(
      <GestureForm
        {...defaultProps}
        data={
          {
            LastBidderAddr: '0x0000000000000000000000000000000000000000',
          } as Partial<DashboardInfo> as DashboardInfo
        }
        gestureType="ETH"
      />,
    );

    expect(
      screen.getByRole('region', { name: 'First Gesture Calibration Window' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The first ETH gesture cost descends while this opening window progresses.'),
    ).toBeInTheDocument();
  });

  it('CST selection shows reward preview and minimum accepted amount', () => {
    render(<GestureForm {...defaultProps} gestureType="CST" />);
    expect(screen.getByText('CST Gesture Economics')).toBeInTheDocument();
    expect(screen.getByText('100 CST')).toBeInTheDocument();
    expect(screen.getByText('1.5 CST')).toBeInTheDocument();
    expect(screen.getByText('+98.5 CST')).toBeInTheDocument();
    expect(
      screen.getByText('The CST reward exceeds the CST cost if this lands.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Min accepted: 99 CST')).toBeInTheDocument();
    expect(screen.queryByText(/Protection 1:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Protection 2:/)).not.toBeInTheDocument();
  });

  it('shows negative net CST when the CST gesture cost is greater than the reward', () => {
    render(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        gestureCstRewardAmount={1}
        gestureCstRewardAmountMin={0.99}
        cstGestureData={{
          ...defaultProps.cstGestureData,
          CSTPrice: 1.5,
          CSTPriceWei: 1500000000000000000n,
          isFree: false,
        }}
      />,
    );

    expect(screen.getByText('-0.5 CST')).toBeInTheDocument();
    expect(
      screen.getByText('Most CST gestures spend more CST than they receive.'),
    ).toBeInTheDocument();
  });

  it('shows positive net CST when the CST reward is greater than the cost', () => {
    render(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        gestureCstRewardAmount={5}
        gestureCstRewardAmountMin={4.95}
        cstGestureData={{
          ...defaultProps.cstGestureData,
          CSTPrice: 1.25,
          CSTPriceWei: 1250000000000000000n,
          isFree: false,
        }}
      />,
    );

    expect(screen.getByText('+3.75 CST')).toBeInTheDocument();
    expect(
      screen.getByText('The CST reward exceeds the CST cost if this lands.'),
    ).toBeInTheDocument();
  });

  it('treats free CST gestures as zero cost when calculating net CST', () => {
    render(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        gestureCstRewardAmount={2}
        gestureCstRewardAmountMin={1.98}
        cstGestureData={{
          ...defaultProps.cstGestureData,
          CSTPrice: 1.5,
          CSTPriceWei: 1500000000000000000n,
          isFree: true,
        }}
      />,
    );

    expect(screen.getByText('0 CST')).toBeInTheDocument();
    expect(screen.getByText('+2 CST')).toBeInTheDocument();
  });

  it('shows a loading state while the live CST reward preview is refreshing', () => {
    render(<GestureForm {...defaultProps} gestureType="CST" isCstRewardLoading />);
    expect(screen.getAllByText('Loading...')).toHaveLength(2);
    expect(screen.getByText('Min accepted: 99 CST')).toBeInTheDocument();
    expect(screen.queryByText(/reward exceeds/)).not.toBeInTheDocument();
  });

  it('shows a placeholder when the live CST reward preview is unavailable', () => {
    render(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        gestureCstRewardAmount={null}
        gestureCstRewardAmountMin={null}
      />,
    );

    expect(screen.getAllByText('-- CST')).toHaveLength(2);
    expect(screen.getByText('Min accepted: -- CST')).toBeInTheDocument();
    expect(screen.queryByText(/reward exceeds/)).not.toBeInTheDocument();
    expect(screen.queryByText(/spend more CST/)).not.toBeInTheDocument();
  });

  it('updates displayed CST reward preview values when live props change', () => {
    const { rerender } = render(<GestureForm {...defaultProps} gestureType="CST" />);

    expect(screen.getByText('100 CST')).toBeInTheDocument();
    expect(screen.getByText('Min accepted: 99 CST')).toBeInTheDocument();

    rerender(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        gestureCstRewardAmount={125}
        gestureCstRewardAmountMin={123.75}
      />,
    );

    expect(screen.getByText('125 CST')).toBeInTheDocument();
    expect(screen.getByText('+123.5 CST')).toBeInTheDocument();
    expect(screen.getByText('Min accepted: 123.75 CST')).toBeInTheDocument();
    expect(screen.queryByText('100 CST')).not.toBeInTheDocument();
  });

  it('hides gesture protections before the first gesture unlocks all methods', () => {
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
    expect(screen.queryByText('CST Reward Preview')).not.toBeInTheDocument();
  });

  it('CST preview shows zero minimum when accepting any reward', () => {
    render(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        acceptAnyCstReward
        gestureCstRewardAmountMin={0}
      />,
    );
    expect(screen.getByText('Min accepted: any reward, including 0 CST')).toBeInTheDocument();
  });

  it('Message textarea accepts input', () => {
    render(<GestureForm {...defaultProps} advancedExpanded />);
    const textarea = screen.getByPlaceholderText('Leave a message with your gesture...');
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    expect(defaultProps.setMessage).toHaveBeenCalledWith('hello world');
  });

  it('explains that gesture messages appear in chat and stay on-chain', async () => {
    const user = userEvent.setup();
    render(<GestureForm {...defaultProps} advancedExpanded />);

    await user.hover(screen.getByRole('button', { name: 'How gesture messages work' }));

    expect(await screen.findAllByText(/appear in Gesture Chat/)).not.toHaveLength(0);
    expect(screen.getAllByText(/blockchain permanently/).length).toBeGreaterThan(0);
  });

  it('Advanced options accordion toggles', () => {
    const { rerender } = render(<GestureForm {...defaultProps} advancedExpanded={false} />);
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.queryByText('Message')).not.toBeInTheDocument();
    expect(screen.queryByText(/Attach tokens or NFTs to your gesture/)).not.toBeInTheDocument();

    rerender(<GestureForm {...defaultProps} advancedExpanded={true} />);
    expect(screen.getByText('Message')).toBeInTheDocument();
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

    await user.click(screen.getByText('ETH + RWLK'));

    expect(defaultProps.setRwlkId).toHaveBeenCalledWith(-1);
    expect(defaultProps.setBidType).toHaveBeenCalledWith('RandomWalk');
  });

  it('clicking CST radio calls setBidType and resets rwlkId', async () => {
    const user = userEvent.setup();
    render(<GestureForm {...defaultProps} gestureType="ETH" />);

    await user.click(screen.getByText('CST'));

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

  it('computed gesture cost applies 50% discount for ETH + RandomWalk', () => {
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

  it('shows minimum CST reward protection control for every unlocked gesture type', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} gestureType="ETH" />);
    expect(screen.getByText('Minimum CST Reward Protection')).toBeInTheDocument();
    expect(screen.getByText(/square-root formula based on elapsed time/)).toBeInTheDocument();
  });

  it('updates CST reward tolerance from advanced options', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} gestureType="CST" />);
    const input = screen.getByPlaceholderText('1');
    fireEvent.change(input, { target: { value: '5' } });
    expect(defaultProps.setCstRewardTolerancePercent).toHaveBeenCalledWith(5);
  });

  it('allows users to accept any CST reward including zero', () => {
    render(<GestureForm {...defaultProps} advancedExpanded={true} gestureType="CST" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept any CST reward' });

    fireEvent.click(checkbox);

    expect(defaultProps.setAcceptAnyCstReward).toHaveBeenCalledWith(true);
    expect(screen.getByText(/minimum accepted CST reward of 0/)).toBeInTheDocument();
  });

  it('disables CST tolerance input when accepting any CST reward', () => {
    render(
      <GestureForm
        {...defaultProps}
        advancedExpanded={true}
        gestureType="CST"
        acceptAnyCstReward
      />,
    );

    expect(screen.getByPlaceholderText('1')).toBeDisabled();
  });

  it('shows CalibrationInfo with endedMessage for CST when window closed', () => {
    render(
      <GestureForm
        {...defaultProps}
        gestureType="CST"
        cstGestureData={{
          ...defaultProps.cstGestureData,
          AuctionDuration: 43200,
          SecondsElapsed: 50000,
          source: 'contract',
          apiAuctionDuration: 3600,
        }}
      />,
    );
    expect(
      screen.getByText('Calibration Window ended \u2014 you can gesture for free.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Using on-chain duration/)).toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'CST Calibration Window progress' }),
    ).not.toBeInTheDocument();
  });

  it('marks the selected gesture method with aria-pressed', () => {
    render(<GestureForm {...defaultProps} gestureType="ETH" />);

    expect(screen.getByRole('button', { name: /ETH Pay with Ether/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /ETH \+ RWLK 50% discount/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('labels the RandomWalk discount tooltip trigger', () => {
    render(<GestureForm {...defaultProps} gestureType="RandomWalk" />);

    expect(
      screen.getByRole('button', { name: 'About RandomWalk gesture discounts' }),
    ).toBeInTheDocument();
  });

  describe('preview mode (disconnected wallet)', () => {
    it('shows the connect explainer banner', () => {
      render(<GestureForm {...defaultProps} previewMode />);

      expect(screen.getByText(/Preview the live gesture options here/)).toBeInTheDocument();
      expect(screen.getByText(/Connect a wallet/)).toBeInTheDocument();
    });

    it('keeps the gesture method picker interactive for exploration', async () => {
      const user = userEvent.setup();
      render(<GestureForm {...defaultProps} previewMode gestureType="ETH" />);

      await user.click(screen.getByText('ETH + RWLK'));

      expect(defaultProps.setBidType).toHaveBeenCalledWith('RandomWalk');
    });

    it('disables the message textarea', () => {
      render(<GestureForm {...defaultProps} previewMode advancedExpanded />);

      expect(screen.getByPlaceholderText('Leave a message with your gesture...')).toBeDisabled();
    });

    it('disables the advanced options accordion trigger', () => {
      render(<GestureForm {...defaultProps} previewMode />);

      expect(screen.getByRole('button', { name: /Advanced/ })).toBeDisabled();
    });

    it('disables attachment inputs when advanced options are expanded', () => {
      render(<GestureForm {...defaultProps} previewMode advancedExpanded contributionType="NFT" />);

      expect(screen.getByPlaceholderText('0x...')).toBeDisabled();
      expect(screen.getByPlaceholderText('Token ID')).toBeDisabled();
    });

    it('does not show the preview banner for connected users', () => {
      render(<GestureForm {...defaultProps} advancedExpanded />);

      expect(screen.queryByText(/Preview the live gesture options here/)).not.toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Leave a message with your gesture...'),
      ).not.toBeDisabled();
    });

    it('has no accessibility violations in preview mode', async () => {
      const { container } = render(<GestureForm {...defaultProps} previewMode />);
      await checkA11y(container);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureForm {...defaultProps} />);
    await checkA11y(container);
  });
});
