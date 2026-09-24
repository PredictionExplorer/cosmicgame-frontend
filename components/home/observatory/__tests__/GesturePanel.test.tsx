import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { IDLE_TX_STAGE } from '@/lib/txStage';

import { render, screen, within, checkA11y } from '@/test-utils';

import { GesturePanel, type GesturePanelFormState } from '../GesturePanel';

jest.mock('@rainbow-me/rainbowkit');

jest.mock('../../../nft/PaginationRWLKGrid', () => ({
  __esModule: true,
  default: ({ selectedToken, labelledBy }: { selectedToken: number; labelledBy?: string }) => (
    <div data-testid="rwlk-grid" data-selected={selectedToken} data-labelledby={labelledBy}>
      RWLK grid
    </div>
  ),
}));

jest.mock('../../../common/UniswapTradeButton', () => ({
  UniswapTradeButton: () => <a href="https://app.uniswap.org">Uniswap</a>,
}));

const NBSP = String.fromCharCode(160);

const makeForm = (overrides: Partial<GesturePanelFormState> = {}): GesturePanelFormState => ({
  gestureType: 'ETH',
  setBidType: jest.fn(),
  contributionType: '',
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
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    ...overrides,
  }) as never;

const baseProps = {
  data: makeData(),
  loading: false,
  isRoundActive: true,
  account: '0x2222222222222222222222222222222222222222' as string | null,
  cstGestureData: cstData,
  submit: { action: 'home.form.submit.action.eth', cost: `0.01${NBSP}ETH` },
  canGesture: true,
  isGesturing: false,
  txStage: IDLE_TX_STAGE,
  cycleTimerEnded: false,
  onSubmit: jest.fn(),
  onSelectGestureType: jest.fn(),
};

const submitButton = () => document.getElementById('gesture-submit') as HTMLButtonElement;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GesturePanel', () => {
  /* ── Method ─────────────────────────────────────────────────── */

  it('shows every method with its live cost, the unit never split from its figure', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    const tabs = screen.getByTestId('panel-method-tabs');
    expect(within(tabs).getByTestId('panel-method-eth-cost')).toHaveTextContent('0.01 ETH');
    // RandomWalk rides an ETH gesture at half cost.
    expect(within(tabs).getByTestId('panel-method-randomWalk-cost')).toHaveTextContent('0.005 ETH');
    expect(within(tabs).getByTestId('panel-method-cst-cost')).toHaveTextContent('12.50 CST');
    for (const cost of within(tabs).getAllByTestId(/-cost$/)) {
      for (const part of cost.querySelectorAll('span'))
        expect(part).toHaveClass('whitespace-nowrap');
    }
    expect(
      within(tabs).getByRole('button', { name: /home\.form\.method\.eth\.label/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('prices a confirmed zero CST quote as 0 CST, never as free of every cost', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        cstGestureData={{ ...cstData, CSTPrice: 0, isFree: true }}
      />,
    );
    expect(screen.getByTestId('panel-method-cst-cost')).toHaveTextContent(/^0 CST$/);
  });

  it.each(['ETH', 'RandomWalk'])(
    'keeps missing ETH quotes pending and blocks %s submission',
    (gestureType) => {
      render(
        <GesturePanel
          {...baseProps}
          form={makeForm({ gestureType, ethGestureInfo: null, rwlkId: 42 })}
          submit={{ action: 'home.form.submit.action.eth', cost: null }}
        />,
      );

      expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent('Loading...');
      expect(submitButton()).toBeDisabled();
    },
  );

  it('keeps an empty CST source unknown and prevents a zero-cost submission', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST' })}
        cstGestureData={{ ...cstData, CSTPrice: 0, source: 'empty' }}
        submit={{ action: 'home.form.submit.action.cst', cost: null }}
      />,
    );
    expect(screen.getByTestId('panel-method-cst-cost')).toHaveTextContent('Loading...');
    expect(submitButton()).toBeDisabled();
  });

  it('switches methods through the shared handler', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);
    await user.click(screen.getByTestId('panel-method-cst'));
    expect(baseProps.onSelectGestureType).toHaveBeenCalledWith('CST');
  });

  it('offers only ETH before the first Gesture', () => {
    render(
      <GesturePanel
        {...baseProps}
        data={makeData({ LastBidderAddr: '0x0000000000000000000000000000000000000000' })}
        form={makeForm()}
      />,
    );
    expect(screen.getByTestId('panel-method-eth')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-method-cst')).not.toBeInTheDocument();
    expect(screen.queryByTestId('panel-cst-reward')).not.toBeInTheDocument();
  });

  it('says what ETH + Random Walk needs before anyone mistakes it for the best deal', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ rwlknftIds: [] })} />);

    const rwlk = screen.getByTestId('panel-method-randomWalk');
    expect(rwlk).toHaveClass('border-dashed');
    expect(rwlk).toHaveAccessibleDescription('home.form.method.randomWalk.desc');
    expect(screen.getByTestId('panel-method-explanation')).toHaveTextContent(
      'home.form.method.randomWalk.desc',
    );
  });

  it('treats ETH + Random Walk as a peer when the wallet holds an eligible NFT', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ rwlknftIds: [7] })} />);
    expect(screen.getByTestId('panel-method-randomWalk')).not.toHaveClass('border-dashed');
    expect(screen.getByTestId('panel-method-explanation')).toHaveTextContent(
      'home.orientation.methods.eth',
    );
  });

  it('labels the Random Walk picker by its heading and blocks submit until a token is chosen', () => {
    const { rerender } = render(
      <GesturePanel {...baseProps} form={makeForm({ gestureType: 'RandomWalk' })} />,
    );
    const heading = screen.getByRole('heading', { name: 'home.form.rwlk.title' });
    expect(screen.getByTestId('rwlk-grid')).toHaveAttribute('data-labelledby', heading.id);
    expect(submitButton()).toBeDisabled();

    rerender(
      <GesturePanel {...baseProps} form={makeForm({ gestureType: 'RandomWalk', rwlkId: 42 })} />,
    );
    expect(submitButton()).toBeEnabled();
  });

  /* ── What the Gesture imprints ──────────────────────────────── */

  it('states the Participation CST and the minimum accepted as spec rows', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} />);
    const rows = screen.getByTestId('panel-cst-reward');
    expect(within(rows).getByTestId('panel-cst-metric-reward')).toHaveTextContent(
      /home\.form\.reward\.previewTitle.*100 CST/,
    );
    expect(within(rows).getByTestId('panel-cst-min-accepted')).toHaveTextContent(
      /home\.form\.reward\.minAcceptedLabel.*99 CST/,
    );
  });

  it('shows the CST economics as reward, cost and a signed net', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ gestureType: 'CST' })} />);
    expect(screen.getByTestId('panel-cst-metric-reward')).toHaveTextContent('100 CST');
    expect(screen.getByTestId('panel-cst-metric-cost')).toHaveTextContent('12.50 CST');
    expect(screen.getByTestId('panel-cst-metric-net')).toHaveTextContent('+87.50 CST');
  });

  it('keeps figures pending, not zero, while the reward loads', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ isCstRewardLoading: true })} />);
    expect(screen.getByTestId('panel-cst-metric-reward')).not.toHaveTextContent(/\d/);
    expect(
      within(screen.getByTestId('panel-cst-metric-reward')).getByText('Loading...'),
    ).toHaveClass('sr-only');
  });

  it('surfaces the on-chain duration mismatch note when contract and API disagree', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST' })}
        cstGestureData={{
          ...cstData,
          source: 'contract',
          AuctionDuration: 7200,
          apiAuctionDuration: 3600,
        }}
      />,
    );
    expect(screen.getByText(/home\.form\.reward\.durationMismatch/)).toHaveClass('text-attention');
  });

  /* ── Message ─────────────────────────────────────────────────── */

  it('lets the optional message recede behind "Add a message" in the page form', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    const toggle = screen.getByTestId('gesture-message-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('gesture-message-input')).not.toBeVisible();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const input = screen.getByRole('textbox', { name: 'home.form.advanced.messageLabel' });
    expect(input).toBeVisible();
    // Its permanence is stated in words beside it, not hidden in a tooltip.
    expect(input).toHaveAccessibleDescription(/home\.form\.advanced\.messageTooltip/);
  });

  it('keeps a shared draft open and the sheet editor open from the start', () => {
    const { unmount } = render(
      <GesturePanel {...baseProps} form={makeForm({ message: 'Hello' })} />,
    );
    expect(screen.getByTestId('gesture-message-input')).toBeVisible();
    unmount();

    render(<GesturePanel {...baseProps} form={makeForm()} variant="sheet" />);
    expect(screen.queryByTestId('gesture-message-toggle')).not.toBeInTheDocument();
    expect(screen.getByTestId('gesture-message-input')).toBeVisible();
  });

  it('opens and focuses the editor when the chat asks to join the conversation', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { rerender } = render(
      <GesturePanel {...baseProps} form={makeForm()} messageInputRef={ref} />,
    );
    rerender(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        messageInputRef={ref}
        messageFocusRequest={1}
      />,
    );
    expect(screen.getByTestId('gesture-message-input')).toBeVisible();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(ref.current).toHaveFocus();
  });

  it('counts the drafted characters against the on-chain limit', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ message: 'Hello' })} />);
    expect(screen.getByTestId('gesture-message-char-count')).toHaveTextContent('5/280');
  });

  /* ── Advanced options ────────────────────────────────────────── */

  it('keeps attachments and protections behind the advanced disclosure', async () => {
    const user = userEvent.setup();
    const form = makeForm();
    render(<GesturePanel {...baseProps} form={form} />);
    await user.click(screen.getByRole('button', { name: /home\.form\.advanced\.title/ }));
    expect(form.setAdvancedExpanded).toHaveBeenCalledWith(true);
  });

  it('labels every advanced field and attaches nothing by default', async () => {
    const user = userEvent.setup();
    const form = makeForm({ advancedExpanded: true, contributionType: 'Token' });
    render(<GesturePanel {...baseProps} form={form} />);

    expect(
      screen.getByRole('textbox', { name: 'home.form.advanced.tokenContractLabel' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: 'home.form.advanced.tokenAmountLabel' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', {
        name: 'home.form.advanced.minCstProtection.toleranceLabel',
      }),
    ).toHaveAccessibleDescription(/minAmount\(amount=99\)/);
    const collision = screen.getByRole('spinbutton', {
      name: 'home.form.advanced.collision.raiseBy',
    });
    expect(collision).toHaveAccessibleDescription(/approxCost\(amount=0\.0102\)/);

    const group = screen.getByRole('radiogroup', { name: 'home.form.advanced.attachLabel' });
    await user.click(within(group).getByLabelText('home.form.advanced.attachNone'));
    expect(form.setContributionType).toHaveBeenCalledWith('');
  });

  it('labels the NFT attachment fields', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ advancedExpanded: true, contributionType: 'NFT' })}
      />,
    );
    expect(
      screen.getByRole('textbox', { name: 'home.form.advanced.nftContractLabel' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: 'home.form.advanced.nftIdLabel' }),
    ).toBeInTheDocument();
  });

  it.each(['NFT', 'Token'])(
    'has no accessibility violations with the %s attachment open',
    async (contributionType) => {
      const { container } = render(
        <GesturePanel
          {...baseProps}
          form={makeForm({ advancedExpanded: true, contributionType })}
        />,
      );
      await checkA11y(container);
    },
  );

  it('hides collision prevention for CST gestures (no ETH cost to bump)', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'CST', advancedExpanded: true })}
      />,
    );
    expect(screen.queryByText('home.form.advanced.collision.title')).not.toBeInTheDocument();
  });

  /* ── Action ──────────────────────────────────────────────────── */

  it('commits through one full-width 56px button carrying the verb and the price', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    const submit = submitButton();
    expect(submit).toHaveClass('bg-signature-gradient', 'w-full', 'h-14');
    expect(submit).toHaveTextContent(/home\.form\.submit\.action\.eth.*0\.01.ETH/);
    await user.click(submit);
    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('keeps the button focusable and shows the transaction stage while in flight', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        isGesturing
        txStage={{ status: 'pending', hash: '0xabc' }}
      />,
    );
    const submit = submitButton();
    expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(submit).not.toBeDisabled();
    expect(submit).toHaveTextContent('toasts.tx.button.pending');
    expect(document.querySelector('[data-tx-status="pending"]')).toBeInTheDocument();
  });

  it('puts the not-refunded note directly above the action, beside what the wallet spent', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        cycleSpend={{ status: 'ready', eth: 0.3104, cst: 845.21 }}
      />,
    );
    const action = screen.getByTestId('gesture-panel-action');
    const note = within(action).getByTestId('participation-cost-note');
    expect(note).toHaveTextContent('home.orientation.costsNote');
    const spent = within(action).getByTestId('personal-spent');
    expect(spent).toHaveTextContent('home.observatory.standing.spent 0.3104 ETH · 845.21 CST');
    // Two currencies, never one summed figure.
    expect(spent.querySelectorAll('data')).toHaveLength(2);
  });

  it('leaves the note alone until the wallet has spent something this cycle', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        cycleSpend={{ status: 'ready', eth: 0, cst: 0 }}
      />,
    );
    expect(screen.getByTestId('participation-cost-note')).toBeInTheDocument();
    expect(screen.queryByTestId('personal-spent')).not.toBeInTheDocument();
  });

  it('reads the spend as pending or unknown, never as a confident zero', () => {
    const { rerender } = render(
      <GesturePanel {...baseProps} form={makeForm()} cycleSpend={{ status: 'loading' }} />,
    );
    expect(screen.getByTestId('personal-spent')).not.toHaveTextContent(/\d/);
    rerender(<GesturePanel {...baseProps} form={makeForm()} cycleSpend={{ status: 'unknown' }} />);
    expect(screen.getByTestId('personal-spent')).toHaveTextContent('—');
  });

  it('points the Last Gesture holder to the clock at zero instead of a dead end', async () => {
    const user = userEvent.setup();
    const onGoToFinalize = jest.fn();
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        canGesture={false}
        cycleTimerEnded
        onGoToFinalize={onGoToFinalize}
      />,
    );
    expect(submitButton()).not.toBeInTheDocument();
    const pointer = screen.getByTestId('gesture-finalize-pointer');
    expect(pointer).toHaveTextContent('home.form.finalizeAtClock');
    await user.click(within(pointer).getByRole('button'));
    expect(onGoToFinalize).toHaveBeenCalledTimes(1);
  });

  it('discloses the collision buffer the wallet will be asked for', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ gestureCostPlus: 2 })} />);
    expect(screen.getByTestId('gesture-send-amount')).toHaveTextContent(
      'home.form.submit.sendsNote(amount=0.0102,percent=2)',
    );
  });

  /* ── Wallet states ───────────────────────────────────────────── */

  it.each(['card', 'sheet'] as const)(
    'offers a full-size connect action in the %s, with drafting open to everyone',
    async (variant) => {
      const user = userEvent.setup();
      const form = makeForm();
      render(<GesturePanel {...baseProps} form={form} account={null} variant={variant} />);

      const connect = within(screen.getByTestId('connect-to-gesture')).getByRole('button', {
        name: /home\.form\.connect\.cta/,
      });
      expect(connect).toHaveClass('bg-signature-gradient', 'w-full');
      expect(screen.getByText('home.orientation.connectHelp')).toBeVisible();
      // Prices stay visible — that is the point of the preview.
      expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent('0.01 ETH');
      if (variant === 'card') await user.click(screen.getByTestId('gesture-message-toggle'));
      await user.type(screen.getByTestId('gesture-message-input'), 'A');
      expect(form.setMessage).toHaveBeenCalledWith('A');
      expect(
        screen.queryByRole('button', { name: /home\.form\.advanced\.title/ }),
      ).not.toBeInTheDocument();
      expect(submitButton()).not.toBeInTheDocument();
    },
  );

  it('sets the standing beside the form and can keep a placeholder off phones', () => {
    const { rerender } = render(
      <GesturePanel {...baseProps} form={makeForm()} standing={<p>Standing</p>} />,
    );
    expect(screen.getByTestId('gesture-panel-standing')).toHaveTextContent('Standing');
    expect(screen.getByTestId('gesture-panel-standing')).not.toHaveClass('max-md:hidden');

    rerender(
      <GesturePanel
        {...baseProps}
        form={makeForm()}
        standing={<p>Standing</p>}
        standingOnPhones={false}
      />,
    );
    expect(screen.getByTestId('gesture-panel-standing')).toHaveClass('max-md:hidden');
  });

  /* ── Lifecycle and anchors ───────────────────────────────────── */

  it('renders a labeled skeleton while the dashboard loads', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} loading isRoundActive={false} />);
    expect(screen.getByRole('status', { name: 'home.form.loadingAria' })).toBeInTheDocument();
    expect(screen.getByTestId('gesture-panel-skeleton')).toBeInTheDocument();
  });

  it('renders nothing between cycles', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} isRoundActive={false} />);
    expect(screen.queryByTestId('gesture-panel')).not.toBeInTheDocument();
  });

  it('carries the #make-gesture anchor on the card variant only', () => {
    const { unmount } = render(<GesturePanel {...baseProps} form={makeForm()} variant="card" />);
    expect(document.getElementById('make-gesture')).toBeInTheDocument();
    unmount();

    render(<GesturePanel {...baseProps} form={makeForm()} variant="sheet" />);
    expect(document.getElementById('make-gesture')).not.toBeInTheDocument();
    expect(screen.getByTestId('gesture-panel')).toHaveAttribute('data-variant', 'sheet');
  });

  it('can focus the panel anchor and continue into the method control with the keyboard', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);

    const anchor = screen.getByRole('region', { name: 'home.form.title' });
    anchor.focus();
    expect(anchor).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: /home\.form\.method\.eth\.label/ })).toHaveFocus();
  });

  it.each([
    ['connected', '0x2222222222222222222222222222222222222222'],
    ['disconnected', null],
  ])('has no accessibility violations (%s)', async (_state, account) => {
    const { container } = render(
      <GesturePanel
        {...baseProps}
        account={account}
        form={makeForm({ advancedExpanded: true, contributionType: 'NFT' })}
      />,
    );
    await checkA11y(container);
  });
});
