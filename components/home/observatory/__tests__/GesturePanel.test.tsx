import userEvent from '@testing-library/user-event';

import { render, screen, within, checkA11y } from '@/test-utils';

import { GesturePanel, type GesturePanelFormState } from '../GesturePanel';

jest.mock('@rainbow-me/rainbowkit');

jest.mock('../../../nft/PaginationRWLKGrid', () => ({
  __esModule: true,
  default: ({ selectedToken }: { selectedToken: number }) => (
    <div data-testid="rwlk-grid" data-selected={selectedToken}>
      RWLK grid
    </div>
  ),
}));

jest.mock('../../../common/UniswapTradeButton', () => ({
  UniswapTradeButton: () => <a href="https://app.uniswap.org">Uniswap</a>,
}));

jest.mock('../../../common/ConnectWalletButton', () => ({
  __esModule: true,
  default: () => <button data-testid="connect-wallet-button">Connect</button>,
}));

const makeForm = (overrides: Partial<GesturePanelFormState> = {}): GesturePanelFormState => ({
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
  rwlknftIds: [],
  ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
  gestureCstRewardAmount: 100,
  gestureCstRewardAmountMin: 99,
  isCstRewardLoading: false,
  cstRewardTolerancePercent: 1,
  setCstRewardTolerancePercent: jest.fn(),
  acceptAnyCstReward: false,
  setAcceptAnyCstReward: jest.fn(),
  ...overrides,
});

const cstData = {
  AuctionDuration: 3600,
  CSTPrice: 12.5,
  CSTPriceWei: 12500000000000000000n,
  SecondsElapsed: 1800,
  isFree: false,
  source: 'api' as const,
};

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    CurRoundNum: 5,
    LastBidderAddr: '0xBidder',
    ...overrides,
  }) as never;

const baseProps = {
  data: makeData(),
  loading: false,
  isRoundActive: true,
  account: '0xUser' as string | null,
  cstGestureData: cstData,
  submitLabel: 'home.form.submit.eth(cost=0.01020)',
  canGesture: true,
  isGesturing: false,
  cycleTimerEnded: false,
  onSubmit: jest.fn(),
  onSelectGestureType: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GesturePanel', () => {
  /* ── Method picker ──────────────────────────────────────────── */

  it('shows every gesture method with its live cost', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    const tabs = screen.getByTestId('panel-method-tabs');
    expect(within(tabs).getByTestId('panel-method-eth-cost')).toHaveTextContent('0.01000 ETH');
    // RandomWalk rides an ETH gesture at half cost.
    expect(within(tabs).getByTestId('panel-method-randomWalk-cost')).toHaveTextContent(
      '0.00500 ETH',
    );
    expect(within(tabs).getByTestId('panel-method-cst-cost')).toHaveTextContent('12.5 CST');
    expect(
      within(tabs).getByRole('button', { name: /home\.form\.method\.eth\.label/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks the CST method as free once the Calibration Window has elapsed', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        cstGestureData={{ ...cstData, CSTPrice: 0, isFree: true }}
      />,
    );

    expect(screen.getByTestId('panel-method-cst-cost')).toHaveTextContent(
      'home.status.metrics.free',
    );
  });

  it('switches methods through the shared handler', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    await user.click(screen.getByRole('button', { name: /home\.form\.method\.cst\.label/ }));

    expect(baseProps.onSelectGestureType).toHaveBeenCalledWith('CST');
  });

  it('offers only the ETH method before the first gesture of a cycle', () => {
    render(
      <GesturePanel
        {...baseProps}
        data={makeData({
          LastBidderAddr: '0x0000000000000000000000000000000000000000',
        })}
        form={makeForm()}
      />,
    );

    const tabs = screen.getByTestId('panel-method-tabs');
    expect(within(tabs).getAllByRole('button')).toHaveLength(1);
    // The opening ETH Calibration Window explains the descending first cost.
    expect(screen.getByText('home.calibration.firstGestureTitle')).toBeInTheDocument();
    // CST economics only apply once the cycle has a participant.
    expect(screen.queryByTestId('panel-cst-reward')).not.toBeInTheDocument();
  });

  /* ── Method context ─────────────────────────────────────────── */

  it('shows the token picker inline and blocks submit until a RandomWalk token is chosen', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ gestureType: 'RandomWalk' })} />);

    expect(screen.getByTestId('panel-rwlk-picker')).toBeInTheDocument();
    expect(screen.getByTestId('rwlk-grid')).toBeInTheDocument();
    expect(document.getElementById('gesture-submit')).toBeDisabled();
  });

  it('enables submit once a RandomWalk token is selected', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'RandomWalk', rwlkId: 42 })}
        submitLabel="home.form.submit.randomWalkWithToken(tokenId=42,cost=0.00510)"
      />,
    );

    const submit = document.getElementById('gesture-submit');
    expect(submit).toBeEnabled();
    expect(submit).toHaveTextContent(
      'home.form.submit.randomWalkWithToken(tokenId=42,cost=0.00510)',
    );
  });

  it('shows the CST Calibration Window, trade link, and full reward economics for CST', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ gestureType: 'CST' })} />);

    expect(screen.getByText('home.calibration.cstTitle')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uniswap' })).toBeInTheDocument();

    const reward = screen.getByTestId('panel-cst-reward');
    expect(within(reward).getByText('home.form.reward.economicsTitle')).toBeInTheDocument();
    expect(within(reward).getByText('home.form.reward.rewardLabel')).toBeInTheDocument();
    expect(within(reward).getByText('home.form.reward.costLabel')).toBeInTheDocument();
    expect(within(reward).getByText('home.form.reward.netLabel')).toBeInTheDocument();
    // Net = 100 reward − 12.5 cost.
    expect(
      within(reward).getByText('home.form.reward.cstAmount(amount=+87.5)'),
    ).toBeInTheDocument();
  });

  it('surfaces the on-chain duration mismatch note when contract and API disagree', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST' })}
        cstGestureData={{
          ...cstData,
          source: 'contract',
          apiAuctionDuration: 43200,
        }}
      />,
    );

    expect(screen.getByText(/home\.form\.reward\.durationMismatch/)).toBeInTheDocument();
  });

  /* ── Message ────────────────────────────────────────────────── */

  it('treats the on-chain message as first-class with a live character count', async () => {
    const user = userEvent.setup();
    const form = makeForm();
    render(<GesturePanel {...baseProps} form={form} />);

    const input = screen.getByTestId('gesture-message-input');
    expect(input).toHaveAttribute('maxlength', '280');
    await user.type(input, 'gm');
    expect(form.setMessage).toHaveBeenCalled();

    expect(screen.getByTestId('gesture-message-char-count')).toHaveTextContent('0/280');
  });

  it('reflects the drafted message length in the counter', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ message: 'hello cosmos' })} />);
    expect(screen.getByTestId('gesture-message-char-count')).toHaveTextContent('12/280');
  });

  /* ── Advanced options ───────────────────────────────────────── */

  it('keeps attachments and protections behind the advanced disclosure', async () => {
    const user = userEvent.setup();
    const form = makeForm();
    render(<GesturePanel {...baseProps} form={form} />);

    expect(screen.queryByText('home.form.advanced.attachIntro')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /home\.form\.advanced\.title/ }));
    expect(form.setAdvancedExpanded).toHaveBeenCalledWith(true);
  });

  it('exposes attachment fields, CST protection, and collision prevention when expanded', async () => {
    const user = userEvent.setup();
    const form = makeForm({ advancedExpanded: true });
    render(<GesturePanel {...baseProps} form={form} />);

    expect(screen.getByText('home.form.advanced.minCstProtection.title')).toBeInTheDocument();
    expect(screen.getByText('home.form.advanced.collision.title')).toBeInTheDocument();
    // 0.01 ETH × 1.02 collision buffer.
    expect(
      screen.getByText('home.form.advanced.collision.approxCost(amount=0.010200)'),
    ).toBeInTheDocument();

    const nftInput = screen.getByPlaceholderText('0x...');
    await user.type(nftInput, '0xa');
    expect(form.setNftDonateAddress).toHaveBeenCalled();
  });

  it('hides collision prevention for CST gestures (no ETH cost to bump)', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST', advancedExpanded: true })}
      />,
    );

    expect(screen.queryByText('home.form.advanced.collision.title')).not.toBeInTheDocument();
  });

  /* ── Submit ─────────────────────────────────────────────────── */

  it('submits through the one gesture button with the shared live-cost label', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    const submit = document.getElementById('gesture-submit') as HTMLButtonElement;
    expect(submit).toHaveTextContent('home.form.submit.eth(cost=0.01020)');
    await user.click(submit);

    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables submit while a gesture is in flight', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} isGesturing />);
    expect(document.getElementById('gesture-submit')).toBeDisabled();
    expect(screen.getByText('home.form.processing')).toBeInTheDocument();
  });

  it('explains the wait instead of offering submit after the final gesture', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} canGesture={false} />);

    expect(document.getElementById('gesture-submit')).not.toBeInTheDocument();
    expect(screen.getByText('home.form.finalGestureMade')).toBeInTheDocument();
  });

  it('carries the always-true microcopy under the action', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} />);
    expect(screen.getByText('home.observatory.panel.microcopy')).toBeInTheDocument();
  });

  /* ── Wallet / lifecycle states ──────────────────────────────── */

  it('previews methods and prices with a connect prompt when disconnected', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} account={null} />);

    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(screen.getByText('home.form.preview')).toBeInTheDocument();
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();
    // Prices stay visible — that is the point of the preview.
    expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent('0.01000 ETH');
    // Writing and advanced transaction controls appear only after connect,
    // keeping the observer preview compact.
    expect(screen.queryByTestId('gesture-message-input')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /home\.form\.advanced\.title/ }),
    ).not.toBeInTheDocument();
    expect(document.getElementById('gesture-submit')).not.toBeInTheDocument();
  });

  it('renders a labeled skeleton while the dashboard loads', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} loading isRoundActive={false} />);
    expect(screen.getByRole('status', { name: 'home.form.loadingAria' })).toBeInTheDocument();
    expect(screen.getByTestId('gesture-panel-skeleton')).toBeInTheDocument();
  });

  it('renders nothing between cycles', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} isRoundActive={false} />);
    expect(screen.queryByTestId('gesture-panel')).not.toBeInTheDocument();
  });

  /* ── Anchors and variants ───────────────────────────────────── */

  it('carries the #make-gesture anchor on the card variant only', () => {
    const { unmount } = render(<GesturePanel {...baseProps} form={makeForm()} variant="card" />);
    expect(document.getElementById('make-gesture')).toBeInTheDocument();
    unmount();

    render(<GesturePanel {...baseProps} form={makeForm()} variant="sheet" />);
    expect(document.getElementById('make-gesture')).not.toBeInTheDocument();
    expect(screen.getByTestId('gesture-panel')).toHaveAttribute('data-variant', 'sheet');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GesturePanel {...baseProps} form={makeForm()} />);
    await checkA11y(container);
  });
});
