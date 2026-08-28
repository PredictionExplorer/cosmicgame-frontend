import '@testing-library/jest-dom';

import { render, screen, fireEvent } from '@/test-utils';

import { GestureAdvancedFields, GestureAdvancedPanel } from '../GestureAdvancedFields';

const baseProps = {
  gestureType: 'ETH',
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
  setRwlkId: jest.fn(),
  gestureCostPlus: 2,
  setBidPricePlus: jest.fn(),
  ethGestureInfo: { ETHPrice: 0.01, AuctionDuration: 0, SecondsElapsed: 0 },
  gestureCstRewardAmountMin: 99,
  setCstRewardTolerancePercent: jest.fn(),
  setAcceptAnyCstReward: jest.fn(),
  showAll: true,
};

describe('GestureAdvancedFields', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stack layout renders every group once, in the accordion order', () => {
    render(<GestureAdvancedFields {...baseProps} layout="stack" />);
    const root = screen.getByTestId('gesture-advanced-fields');
    expect(root).toHaveClass('space-y-4');
    expect(screen.getAllByText('home.form.advanced.messageLabel')).toHaveLength(1);
    expect(screen.getByText('home.form.advanced.attachIntro')).toBeInTheDocument();
    expect(screen.getByText('home.form.advanced.minCstProtection.title')).toBeInTheDocument();
    expect(screen.getByText('home.form.advanced.attachNft')).toBeInTheDocument();
    expect(screen.getByText('home.form.advanced.collision.title')).toBeInTheDocument();
  });

  it('panel layout is a single uncapped column with the same groups', () => {
    render(<GestureAdvancedFields {...baseProps} layout="panel" />);
    const root = screen.getByTestId('gesture-advanced-fields');
    expect(root).toHaveAttribute('data-layout', 'panel');
    expect(root).not.toHaveClass('max-w-xl');
    expect(screen.getAllByText('home.form.advanced.messageLabel')).toHaveLength(1);
    expect(screen.getByText('home.form.advanced.minCstProtection.title')).toBeInTheDocument();
    expect(screen.getByText('home.form.advanced.collision.title')).toBeInTheDocument();
  });

  it('hides the protection box before the first gesture and the collision box for CST', () => {
    render(
      <GestureAdvancedFields {...baseProps} layout="panel" showAll={false} gestureType="CST" />,
    );
    expect(screen.queryByText('home.form.advanced.minCstProtection.title')).not.toBeInTheDocument();
    expect(screen.queryByText('home.form.advanced.collision.title')).not.toBeInTheDocument();
  });

  it('forwards edits to the shared form state', () => {
    render(<GestureAdvancedFields {...baseProps} layout="panel" />);
    fireEvent.change(screen.getByPlaceholderText('home.form.advanced.messagePlaceholder'), {
      target: { value: 'hello' },
    });
    expect(baseProps.setMessage).toHaveBeenCalledWith('hello');
  });

  it('GestureAdvancedPanel wraps the panel layout under the Advanced heading', () => {
    render(<GestureAdvancedPanel {...baseProps} />);
    const panel = screen.getByTestId('gesture-advanced-panel');
    expect(panel).toHaveAttribute('aria-label', 'home.form.advanced.title');
    expect(panel).toContainElement(screen.getByTestId('gesture-advanced-fields'));
    expect(screen.getByTestId('gesture-advanced-fields')).toHaveAttribute('data-layout', 'panel');
  });
});
