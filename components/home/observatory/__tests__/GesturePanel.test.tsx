import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { IDLE_TX_STAGE } from '@/lib/txStage';

import { render, screen, within, checkA11y } from '@/test-utils';

import { GesturePanel, type GesturePanelFormState } from '../GesturePanel';

jest.mock('@rainbow-me/rainbowkit');

jest.mock('../../../nft/PaginationRWLKGrid', () => ({
  __esModule: true,
  default: ({
    selectedToken,
    labelledBy,
    loading,
  }: {
    selectedToken: number;
    labelledBy?: string;
    loading: boolean;
  }) => (
    <div
      data-testid="rwlk-grid"
      data-selected={selectedToken}
      data-labelledby={labelledBy}
      data-loading={loading}
    >
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
    // One choice of three: a radio group with the selection checked.
    expect(within(tabs.parentElement!).getByRole('radiogroup')).toBe(tabs);
    expect(
      within(tabs).getByRole('radio', { name: /home\.form\.method\.eth\.label/ }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(within(tabs).getAllByRole('radio', { checked: false })).toHaveLength(2);
  });

  it('prints both ETH methods at one precision, so their prices line up', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({
          ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.10210695, SecondsElapsed: 1800 },
        })}
      />,
    );
    expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent(/^0\.10211 ETH$/);
    // Five decimals like the price beside it, never "0.051053".
    expect(screen.getByTestId('panel-method-randomWalk-cost')).toHaveTextContent(/^0\.05105 ETH$/);
  });

  it('draws the selection as a straight bar inset from the rounded corners', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} />);
    const eth = screen.getByTestId('panel-method-eth');
    const bar = eth.querySelector('[data-slot="method-selected-bar"]');
    expect(bar).toHaveClass('absolute', 'rounded-pill', 'bg-primary');
    expect(eth.className).not.toMatch(/shadow-\[inset/);
    expect(screen.getByTestId('panel-method-cst').querySelector('[data-slot]')).toBeNull();
  });

  it('moves and selects with the arrow keys, from one tab stop', async () => {
    const user = userEvent.setup();
    render(<GesturePanel {...baseProps} form={makeForm()} />);
    const radios = within(screen.getByTestId('panel-method-tabs')).getAllByRole('radio');
    expect(radios.map((radio) => radio.tabIndex)).toEqual([0, -1, -1]);

    radios[0]!.focus();
    await user.keyboard('{ArrowRight}');
    expect(baseProps.onSelectGestureType).toHaveBeenLastCalledWith('RandomWalk');
    expect(radios[1]).toHaveFocus();
    await user.keyboard('{End}');
    expect(baseProps.onSelectGestureType).toHaveBeenLastCalledWith('CST');
    await user.keyboard('{ArrowRight}');
    // Wraps around to the first.
    expect(baseProps.onSelectGestureType).toHaveBeenLastCalledWith('ETH');
  });

  it('reads each method with the condition that decides whether it is usable', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ rwlknftIds: [] })} />);
    expect(screen.getByTestId('panel-method-eth')).toHaveAccessibleDescription(
      'home.orientation.methods.eth',
    );
    expect(screen.getByTestId('panel-method-randomWalk')).toHaveAccessibleDescription(
      'home.form.method.randomWalk.desc',
    );
    expect(screen.getByTestId('panel-method-cst')).toHaveAccessibleDescription(
      'home.orientation.methods.cst',
    );
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

      // A skeleton with a spoken "Loading", never the text "Loading..." on screen.
      const cost = screen.getByTestId('panel-method-eth-cost');
      expect(within(cost).getByText('common.status.loadingEllipsis')).toHaveClass('sr-only');
      expect(cost.querySelector('[data-slot="value-pending"]')).not.toBeNull();
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
    expect(screen.getByTestId('panel-method-cst-cost')).toHaveTextContent(
      'common.status.loadingEllipsis',
    );
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

  it.each(['CST', 'RandomWalk'])(
    'never arms the submit for %s, a method the first Gesture cannot use',
    (gestureType) => {
      render(
        <GesturePanel
          {...baseProps}
          data={makeData({ LastBidderAddr: '0x0000000000000000000000000000000000000000' })}
          form={makeForm({ gestureType, rwlkId: 3, rwlknftIds: [3] })}
          submit={{ action: 'home.form.submit.action.cst', cost: `12.50${NBSP}CST` }}
        />,
      );
      expect(submitButton()).toBeDisabled();
    },
  );

  it('says what ETH + Random Walk needs before anyone mistakes it for the best deal', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ rwlknftIds: [] })} />);

    const rwlk = screen.getByTestId('panel-method-randomWalk');
    // Subordinate by its muted price and its description, never by a dashed
    // outline that reads as a broken or drop-zone state.
    expect(rwlk.className).not.toMatch(/border-dashed/);
    expect(screen.getByTestId('panel-method-randomWalk-cost')).toHaveClass('text-subtle');
    expect(rwlk).toHaveAccessibleDescription('home.form.method.randomWalk.desc');
    expect(screen.getByTestId('panel-method-explanation')).toHaveTextContent(
      'home.form.method.randomWalk.desc',
    );
  });

  it('treats ETH + Random Walk as a peer when the wallet holds an eligible NFT', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ rwlknftIds: [7] })} />);
    expect(screen.getByTestId('panel-method-randomWalk-cost')).toHaveClass('text-muted-foreground');
    expect(screen.getByTestId('panel-method-randomWalk')).toHaveAccessibleDescription(
      'home.orientation.methods.randomWalk',
    );
    expect(screen.getByTestId('panel-method-explanation')).toHaveTextContent(
      'home.orientation.methods.eth',
    );
  });

  it('labels the Random Walk picker by its heading and blocks submit until a token is chosen', () => {
    const { rerender } = render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'RandomWalk', rwlknftIds: [42] })}
      />,
    );
    const heading = screen.getByRole('heading', { name: 'home.form.rwlk.title' });
    expect(screen.getByTestId('rwlk-grid')).toHaveAttribute('data-labelledby', heading.id);
    expect(submitButton()).toBeDisabled();

    rerender(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'RandomWalk', rwlkId: 42, rwlknftIds: [42] })}
      />,
    );
    expect(submitButton()).toBeEnabled();
  });

  it.each([
    ['not one of the wallet’s unused NFTs', { rwlkId: 42, rwlknftIds: [7] }],
    ['still being read', { rwlkId: 42, rwlknftIds: [42], rwlkListStatus: 'loading' as const }],
    ['from a list that could not be read', { rwlkId: 42, rwlkListStatus: 'error' as const }],
  ])('never arms a Random Walk Gesture with a token %s', (_case, overrides) => {
    render(
      <GesturePanel {...baseProps} form={makeForm({ gestureType: 'RandomWalk', ...overrides })} />,
    );
    expect(submitButton()).toBeDisabled();
  });

  it('says once why a linked token was not selected', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'RandomWalk', rwlknftIds: [3], rwlkRejectedId: 7 })}
      />,
    );
    const note = screen.getByTestId('panel-rwlk-rejected');
    expect(note).toHaveAttribute('role', 'status');
    expect(note).toHaveTextContent('home.form.rwlk.linkedUnavailable(tokenId=7)');
  });

  it('asks a visitor without a wallet to connect one instead of offering an empty search', () => {
    render(
      <GesturePanel
        {...baseProps}
        account={null}
        form={makeForm({ gestureType: 'RandomWalk', rwlkListStatus: 'no-wallet' })}
      />,
    );
    const picker = screen.getByTestId('panel-rwlk-picker');
    expect(within(picker).getByText('home.form.rwlk.connect')).toBeVisible();
    expect(screen.queryByTestId('rwlk-grid')).not.toBeInTheDocument();
    // The method's own explanation already says what the NFT does.
    expect(within(picker).queryByText('home.form.rwlk.tooltip')).not.toBeInTheDocument();
  });

  it("waits for the wallet's NFTs, and says so when they cannot be read", () => {
    const { rerender } = render(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'RandomWalk', rwlkListStatus: 'loading' })}
      />,
    );
    expect(screen.getByTestId('rwlk-grid')).toHaveAttribute('data-loading', 'true');

    rerender(
      <GesturePanel
        {...baseProps}
        form={makeForm({ gestureType: 'RandomWalk', rwlkListStatus: 'error' })}
      />,
    );
    expect(screen.getByTestId('panel-rwlk-error')).toHaveAttribute('role', 'status');
    expect(screen.getByTestId('panel-rwlk-error')).toHaveTextContent('home.form.rwlk.error');
    expect(screen.queryByTestId('rwlk-grid')).not.toBeInTheDocument();
  });

  /* ── What the Gesture imprints ──────────────────────────────── */

  it('states the Participation CST and the minimum accepted as spec rows', () => {
    render(<GesturePanel {...baseProps} form={makeForm()} />);
    const rows = screen.getByTestId('panel-cst-reward');
    // Live figures keep two decimals, so a ticking value never jumps between 141 and 141.01.
    expect(within(rows).getByTestId('panel-cst-metric-reward')).toHaveTextContent(
      /home\.form\.reward\.previewTitle.*100\.00 CST/,
    );
    expect(within(rows).getByTestId('panel-cst-min-accepted')).toHaveTextContent(
      /home\.form\.reward\.minAcceptedLabel.*99\.00 CST/,
    );
  });

  it('shows the CST economics as reward, cost and a signed net', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ gestureType: 'CST' })} />);
    expect(screen.getByTestId('panel-cst-metric-reward')).toHaveTextContent('100.00 CST');
    expect(screen.getByTestId('panel-cst-metric-cost')).toHaveTextContent('12.50 CST');
    expect(screen.getByTestId('panel-cst-metric-net')).toHaveTextContent('+87.50 CST');
  });

  it('shows the dashboard’s Participation CST, marked approximate, until the live preview lands', () => {
    const { rerender } = render(
      <GesturePanel
        {...baseProps}
        data={makeData({ ParticipationCstReward: 141.2 })}
        form={makeForm({ gestureCstRewardAmount: null, gestureCstRewardAmountMin: null })}
      />,
    );
    const reward = () => screen.getByTestId('panel-cst-metric-reward');
    expect(reward().textContent).toContain(`≈${NBSP}141.20${NBSP}CST`);
    // The minimum the transaction accepts waits for the live read.
    expect(screen.getByTestId('panel-cst-min-accepted')).not.toHaveTextContent(/\d/);

    rerender(
      <GesturePanel
        {...baseProps}
        data={makeData({ ParticipationCstReward: 141.2 })}
        form={makeForm({ gestureCstRewardAmount: 140.5 })}
      />,
    );
    expect(reward()).toHaveTextContent('140.50 CST');
    expect(reward()).not.toHaveTextContent('≈');
  });

  it('keeps figures pending, not zero, while the reward loads', () => {
    render(<GesturePanel {...baseProps} form={makeForm({ isCstRewardLoading: true })} />);
    expect(screen.getByTestId('panel-cst-metric-reward')).not.toHaveTextContent(/\d/);
    expect(
      within(screen.getByTestId('panel-cst-metric-reward')).getByText(
        'common.status.loadingEllipsis',
      ),
    ).toHaveClass('sr-only');
  });

  it('says the preview is unavailable when its read failed, instead of pulsing forever', () => {
    render(
      <GesturePanel
        {...baseProps}
        form={makeForm({
          gestureCstRewardAmount: null,
          gestureCstRewardAmountMin: null,
          cstRewardReadFailed: true,
        })}
      />,
    );
    for (const testId of ['panel-cst-metric-reward', 'panel-cst-min-accepted']) {
      const row = screen.getByTestId(testId);
      expect(row).toHaveTextContent('—');
      expect(row).toHaveTextContent('common.status.unavailable');
      expect(within(row).queryByText('common.status.loadingEllipsis')).not.toBeInTheDocument();
    }
  });

  it('prices the ETH methods from the dashboard, marked approximate, until the live quote lands', () => {
    const { rerender } = render(
      <GesturePanel
        {...baseProps}
        data={makeData({ CurBidPriceEth: 0.01 })}
        form={makeForm({ ethGestureInfo: null })}
        submit={{ action: 'home.form.submit.action.eth', cost: null }}
      />,
    );
    // The mark joins its figure with a no-break space, so it never ends a line.
    expect(screen.getByTestId('panel-method-eth-cost').textContent).toContain(`≈${NBSP}0.01`);
    expect(screen.getByTestId('panel-method-randomWalk-cost').textContent).toContain(
      `≈${NBSP}0.005`,
    );
    // An approximate price never arms the submit: the live quote prices the Gesture.
    expect(submitButton()).toBeDisabled();

    rerender(
      <GesturePanel {...baseProps} data={makeData({ CurBidPriceEth: 0.01 })} form={makeForm()} />,
    );
    expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent('0.01 ETH');
    expect(screen.getByTestId('panel-method-eth-cost')).not.toHaveTextContent('≈');
  });

  it('keeps the connect action on one line, with a short label on phones', () => {
    render(<GesturePanel {...baseProps} account={null} form={makeForm()} />);
    const connect = within(screen.getByTestId('connect-to-gesture')).getByRole('button');
    expect(connect).toHaveClass('whitespace-nowrap', 'w-full');
    expect(within(connect).getByText('home.form.connect.ctaShort')).toHaveClass('sm:hidden');
    expect(within(connect).getByText('home.form.connect.cta')).toHaveClass('max-sm:hidden');
    // The line under the button carries the purpose, balanced so no word strands.
    expect(screen.getByText('home.orientation.connectHelp')).toHaveClass('text-balance');
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

  it('counts UTF-8 bytes, as the contract does, against its live cap', () => {
    render(
      <GesturePanel {...baseProps} form={makeForm({ message: '落笔', messageMaxBytes: 100 })} />,
    );
    // Two Chinese characters take six bytes.
    expect(screen.getByTestId('gesture-message-char-count')).toHaveTextContent('6/100');
    expect(screen.getByTestId('gesture-message-toggle')).toHaveTextContent(
      'home.form.advanced.messageOptionalHint(maxLength=100)',
    );
  });

  it('cuts a pasted Chinese message at the byte cap, after a whole character', () => {
    const form = makeForm({ message: 'x' });
    render(<GesturePanel {...baseProps} form={form} />);
    fireEvent.change(screen.getByTestId('gesture-message-input'), {
      target: { value: '落'.repeat(100) },
    });
    expect(form.setMessage).toHaveBeenLastCalledWith('落'.repeat(93));
  });

  it('closes the editor from its toggle even while a draft exists', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<GesturePanel {...baseProps} form={makeForm({ message: 'Hi' })} />);
    const toggle = screen.getByTestId('gesture-message-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Editing the kept draft elsewhere does not force it open again…
    rerender(<GesturePanel {...baseProps} form={makeForm({ message: 'Hi there' })} />);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // …but a new draft arriving from the other surface does.
    rerender(<GesturePanel {...baseProps} form={makeForm({ message: '' })} />);
    rerender(<GesturePanel {...baseProps} form={makeForm({ message: 'New' })} />);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
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
    // At least 56px tall, and free to take a second line where a label is long.
    expect(submit).toHaveClass('bg-signature-gradient', 'w-full', 'min-h-14', 'whitespace-normal');
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
    expect(screen.getByRole('radio', { name: /home\.form\.method\.eth\.label/ })).toHaveFocus();
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
