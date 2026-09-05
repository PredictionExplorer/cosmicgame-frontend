import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

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

  it.each(['ETH', 'RandomWalk'])(
    'keeps missing ETH quotes pending and blocks %s submission',
    async (gestureType) => {
      const user = userEvent.setup();
      render(
        <GesturePanel
          {...baseProps}
          form={makeForm({
            gestureType,
            ethGestureInfo: null,
            rwlkId: 42,
            advancedExpanded: true,
          })}
          submitLabel={`home.form.submit.generic(method=${gestureType})`}
        />,
      );

      expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent('Loading...');
      expect(screen.getByTestId('panel-method-randomWalk-cost')).toHaveTextContent('Loading...');
      expect(screen.queryByText('0.00000 ETH')).not.toBeInTheDocument();
      expect(
        screen.getByText('home.form.advanced.collision.approxCost(amount=--)'),
      ).toBeInTheDocument();

      const submit = screen.getByRole('button', {
        name: `home.form.submit.generic(method=${gestureType})`,
      });
      expect(submit).toBeDisabled();
      await user.click(submit);
      expect(baseProps.onSubmit).not.toHaveBeenCalled();
    },
  );

  it('keeps an empty CST source unknown and prevents a zero-cost submission', async () => {
    const user = userEvent.setup();
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST' })}
        cstGestureData={{
          ...cstData,
          CSTPrice: 0,
          CSTPriceWei: 0n,
          isFree: false,
          source: 'empty',
        }}
        submitLabel="home.form.submit.generic(method=CST)"
      />,
    );

    expect(screen.getByTestId('panel-method-cst-cost')).toHaveTextContent('Loading...');
    expect(screen.queryByText('home.status.metrics.free')).not.toBeInTheDocument();
    expect(screen.queryByText('home.calibration.cstTitle')).not.toBeInTheDocument();
    const economics = screen.getByTestId('panel-cst-reward');
    expect(within(economics).queryByText('home.form.reward.cstAmount(amount=0)')).toBeNull();
    expect(within(economics).queryByText('home.form.reward.cstAmount(amount=+100)')).toBeNull();
    expect(within(economics).getAllByText('home.form.reward.cstAmount(amount=--)')).toHaveLength(2);

    const submit = screen.getByRole('button', { name: 'home.form.submit.generic(method=CST)' });
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it('accepts an explicit zero CST quote from the contract', async () => {
    const user = userEvent.setup();
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST' })}
        cstGestureData={{
          ...cstData,
          CSTPrice: 0,
          CSTPriceWei: 0n,
          isFree: true,
          source: 'contract',
        }}
        submitLabel="home.form.submit.cstFree"
      />,
    );

    expect(screen.getByTestId('panel-method-cst-cost')).toHaveTextContent(
      'home.status.metrics.free',
    );
    const economics = screen.getByTestId('panel-cst-reward');
    expect(within(economics).getByText('home.form.reward.cstAmount(amount=0)')).toBeVisible();
    expect(within(economics).getByText('home.form.reward.cstAmount(amount=+100)')).toBeVisible();
    const submit = screen.getByRole('button', { name: 'home.form.submit.cstFree' });
    expect(submit).toBeEnabled();
    await user.click(submit);
    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('switches methods through the shared handler', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    await user.click(screen.getByRole('button', { name: /home\.form\.method\.cst\.label/ }));

    expect(baseProps.onSelectGestureType).toHaveBeenCalledWith('CST');
  });

  it('offers only ETH before the first gesture and keeps the opening calibration visible', () => {
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
    expect(within(tabs).getByTestId('panel-method-eth-cost')).toBeVisible();
    const calibration = screen.getByRole('region', {
      name: 'home.calibration.firstGestureTitle',
    });
    expect(calibration).toBeVisible();
    expect(calibration.closest('details')).toBeNull();
    // CST economics only apply once the cycle has a participant.
    expect(screen.queryByTestId('panel-cst-reward')).not.toBeInTheDocument();
  });

  /* ── Method context ─────────────────────────────────────────── */

  it.each(['ETH', 'RandomWalk', 'CST'])(
    'keeps the active CST Calibration Window visible while choosing %s',
    (gestureType) => {
      render(<GesturePanel {...baseProps} form={makeForm({ gestureType })} />);

      const calibration = screen.getByRole('region', { name: 'home.calibration.cstTitle' });
      expect(calibration).toBeVisible();
      expect(calibration.closest('details')).toBeNull();
      expect(within(calibration).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    },
  );

  it('uses the surrounding calibration panel without repeating it inside the form', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST' })}
        embedded
        calibrationExternal
      />,
    );

    expect(screen.queryByRole('region', { name: 'home.calibration.cstTitle' })).toBeNull();
    expect(screen.getByTestId('panel-method-cst-cost')).toBeVisible();
    expect(screen.getByTestId('panel-cst-reward')).toBeVisible();
    expect(screen.getByTestId('participation-cost-note')).toBeVisible();
  });

  it('gives each full CST amount its own labeled cell beneath the economics heading', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST', gestureCstRewardAmount: 123456789.1234 })}
        embedded
        calibrationExternal
      />,
    );

    const economics = screen.getByTestId('panel-cst-economics');
    expect(within(economics).getAllByRole('term')).toHaveLength(3);
    expect(within(economics).getAllByRole('definition')).toHaveLength(3);
    expect(within(economics).queryByText('home.form.reward.economicsTitle')).toBeNull();
    const reward = screen.getByTestId('panel-cst-reward');
    expect(within(reward).getByText('home.form.reward.economicsTitle')).toBeVisible();
    expect(
      within(screen.getByTestId('panel-cst-metric-cost')).getByRole('definition'),
    ).toHaveTextContent('home.form.reward.cstAmount(amount=12.5)');
    expect(
      within(economics).getByText('home.form.reward.cstAmount(amount=123456789.1234)'),
    ).toBeVisible();
    expect(
      within(economics).getByText('home.form.reward.cstAmount(amount=+123456776.6234)'),
    ).toBeVisible();
    expect(
      within(reward).getByText(
        'home.form.reward.minAccepted(value=home.form.reward.cstAmount(amount=99))',
      ),
    ).toBeVisible();
  });

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

  it('keeps CST prices, economics, and calibration visible without opening a disclosure', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ gestureType: 'CST' })} />);

    const calibration = screen.getByRole('region', {
      name: 'home.calibration.cstTitle',
    });
    expect(calibration).toBeVisible();
    expect(calibration.closest('details')).toBeNull();
    expect(screen.getByTestId('panel-method-cst-cost')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Uniswap' })).toBeVisible();

    const reward = screen.getByTestId('panel-cst-reward');
    expect(reward).toBeVisible();
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

  it('keeps a compact message draft mounted and focusable after opening its optional editor', async () => {
    const user = userEvent.setup();
    const messageInputRef = createRef<HTMLTextAreaElement>();
    const form = makeForm({ message: 'draft', gestureType: 'CST' });
    render(
      <GesturePanel
        {...baseProps}
        form={form}
        embedded
        calibrationExternal
        messageInputRef={messageInputRef}
      />,
    );

    const disclosure = screen.getByTestId('panel-message-disclosure');
    const input = screen.getByTestId('gesture-message-input');
    expect(input).not.toBeVisible();
    expect(input).toHaveValue('draft');
    expect(messageInputRef.current).toBe(input);
    expect(screen.getByTestId('gesture-message-char-count')).toHaveTextContent('5/280');
    expect(document.getElementById('gesture-submit')).toBeVisible();

    await user.click(disclosure.querySelector('summary')!);
    expect(input).toBeVisible();
    await user.type(input, '!');
    expect(form.setMessage).toHaveBeenCalledWith('draft!');
  });

  it('keeps the optional message editor visible in the mobile sheet', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} embedded variant="sheet" />);
    expect(screen.queryByTestId('panel-message-disclosure')).toBeNull();
    expect(screen.getByTestId('gesture-message-input')).toBeVisible();
  });

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

  it.each(['0xUser', null])('shows the cost and gas disclosure with account %s', (account) => {
    render(<GesturePanel {...baseProps} form={makeForm()} account={account} />);

    expect(screen.getByTestId('participation-cost-note')).toBeVisible();
    expect(screen.getByTestId('participation-cost-note')).toHaveTextContent(
      'home.orientation.costsNote',
    );
  });

  /* ── Wallet / lifecycle states ──────────────────────────────── */

  it('previews methods and prices with a connect prompt when disconnected', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} account={null} />);

    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(screen.getByText('home.orientation.connectHelp')).toBeInTheDocument();
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

  it('can focus the primary anchor and continue into the method picker with the keyboard', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    const anchor = screen.getByRole('region', { name: 'home.form.title' });
    expect(anchor).toHaveAttribute('id', 'make-gesture');
    expect(anchor).toHaveAttribute('tabindex', '-1');
    anchor.focus();
    expect(anchor).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /home\.form\.method\.eth\.label/ })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GesturePanel {...baseProps} form={makeForm()} />);
    await checkA11y(container);
  });
});
