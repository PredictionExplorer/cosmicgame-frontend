import userEvent from '@testing-library/user-event';
import { zeroAddress } from 'viem';

import type { DashboardInfo } from '@/services/api';
import type { CstGestureData } from '@/utils/cstGesture';

import { renderWithQuery, screen, within, checkA11y } from '@/test-utils';

import { GestureConsole, type ConsoleFinalize, type ConsoleFormState } from '../GestureConsole';

jest.mock('@/components/nft/PaginationRWLKGrid', () => ({
  __esModule: true,
  default: ({ data, labelledBy }: { data: number[]; labelledBy?: string }) => (
    <div data-testid="rwlk-grid" data-count={data.length} aria-labelledby={labelledBy} />
  ),
}));

const ACCOUNT = '0x2222222222222222222222222222222222222222';

const cstGestureData: CstGestureData = {
  AuctionDuration: 8 * 3600,
  SecondsElapsed: 2 * 3600,
  CSTPrice: 250.52,
  CSTPriceWei: 0n,
  isFree: false,
  source: 'api',
};

function makeForm(overrides: Partial<ConsoleFormState> = {}): ConsoleFormState {
  return {
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
    rwlkId: -1,
    setRwlkId: jest.fn(),
    gestureCostPlus: 2,
    setBidPricePlus: jest.fn(),
    advancedExpanded: false,
    setAdvancedExpanded: jest.fn(),
    rwlknftIds: [11, 12],
    ethGestureInfo: { AuctionDuration: 3600, SecondsElapsed: 900, ETHPrice: 0.10211 },
    gestureCstRewardAmount: 186.18,
    gestureCstRewardAmountMin: 184.31,
    isCstRewardLoading: false,
    cstRewardTolerancePercent: 1,
    setCstRewardTolerancePercent: jest.fn(),
    acceptAnyCstReward: false,
    setAcceptAnyCstReward: jest.fn(),
    isGesturing: false,
    gestureTxStage: { status: 'idle' },
    ...overrides,
  };
}

const data = {
  CurRoundNum: 2,
  LastBidderAddr: '0x1111111111111111111111111111111111111111',
} as DashboardInfo;

type ConsoleProps = Parameters<typeof GestureConsole>[0];

function renderConsole(props: Partial<ConsoleProps> = {}) {
  const onGesture = jest.fn();
  const onSelectGestureType = jest.fn();
  const view = renderWithQuery(
    <GestureConsole
      variant="page"
      data={data}
      loading={false}
      account={ACCOUNT}
      form={makeForm()}
      cstGestureData={cstGestureData}
      submitLabel="Gesture with ETH (0.10211 ETH)"
      canGesture
      cycleTimerEnded={false}
      onGesture={onGesture}
      onSelectGestureType={onSelectGestureType}
      {...props}
    />,
  );
  return { ...view, onGesture, onSelectGestureType };
}

/** The method segments (the closed Advanced disclosure holds radios too). */
function methodRadios() {
  return within(screen.getByTestId('gesture-method-selector')).getAllByRole('radio');
}

function visibleText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[hidden], .sr-only').forEach((node) => node.remove());
  return clone.textContent ?? '';
}

describe('GestureConsole', () => {
  it('prices every method inside its segment, the discount beside RandomWalk', () => {
    renderConsole();

    const radios = methodRadios();
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveTextContent('0.10211 ETH');
    expect(radios[1]).toHaveTextContent('0.051055 ETH');
    expect(radios[1]).toHaveTextContent('home.form.method.randomWalk.desc');
    expect(radios[2]).toHaveTextContent('250.52 CST');
  });

  it('keeps the Calibration Window right under the methods', () => {
    renderConsole();

    const selector = screen.getByTestId('gesture-method-selector');
    const calibration = screen.getByTestId('calibration-window');
    expect(
      selector.compareDocumentPosition(calibration) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('reads a free CST Gesture on the CST segment itself', () => {
    renderConsole({ cstGestureData: { ...cstGestureData, isFree: true } });

    expect(methodRadios()[2]).toHaveTextContent('home.deck.console.free');
  });

  it('offers only ETH before the first Gesture of a cycle', () => {
    renderConsole({ data: { ...data, LastBidderAddr: zeroAddress } as DashboardInfo });

    expect(methodRadios()).toHaveLength(1);
    expect(screen.queryByTestId('gesture-reward-preview')).not.toBeInTheDocument();
  });

  it('selects a method through the shared handler', async () => {
    const { onSelectGestureType } = renderConsole();

    await userEvent.click(methodRadios()[2]!);
    expect(onSelectGestureType).toHaveBeenCalledWith('CST');
  });

  it('keeps the message field visible and counts its characters', () => {
    renderConsole({ form: makeForm({ message: 'hello' }) });

    const input = screen.getByTestId('gesture-message-input');
    expect(input).toHaveValue('hello');
    expect(screen.getByTestId('gesture-message-char-count')).toHaveTextContent('5/280');
    expect(input).toHaveAccessibleDescription(/home\.deck\.console\.messageHint/);
  });

  it('previews the Participation CST as spec rows, explained on the label', () => {
    renderConsole();

    const preview = screen.getByTestId('gesture-reward-preview');
    expect(visibleText(preview)).toContain('home.deck.console.reward');
    expect(visibleText(preview)).toContain('186.18 CST');
    expect(visibleText(preview)).toContain('home.deck.console.minAccepted');
    expect(visibleText(preview)).toContain('184.31 CST');
    // The long description lives in the explanation, not in the layout.
    expect(visibleText(preview)).not.toContain('home.form.reward.previewDescription');
  });

  it('shows reward, cost and net for a CST Gesture', () => {
    renderConsole({ form: makeForm({ gestureType: 'CST' }) });

    const preview = screen.getByTestId('gesture-reward-preview');
    expect(visibleText(preview)).toContain('home.form.reward.rewardLabel');
    expect(visibleText(preview)).toContain('home.form.reward.costLabel');
    expect(visibleText(preview)).toContain('\u221264.34 CST');
    expect(screen.getByText('home.form.reward.netNegative')).toBeInTheDocument();
  });

  it('submits through the one commit button, priced by the shared label', async () => {
    const { onGesture } = renderConsole();

    const submit = screen.getByRole('button', { name: 'Gesture with ETH (0.10211 ETH)' });
    expect(submit).toHaveAttribute('id', 'gesture-submit');
    await userEvent.click(submit);
    expect(onGesture).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('gesture-send-amount')).toHaveTextContent(
      'home.form.submit.sendsNote(amount=0.10415,percent=2)',
    );
  });

  it('keeps the submit unavailable until a RandomWalk NFT is chosen', () => {
    renderConsole({ form: makeForm({ gestureType: 'RandomWalk', rwlkId: -1 }) });

    expect(screen.getByTestId('gesture-submit')).toBeDisabled();
    expect(screen.getByTestId('rwlk-grid')).toHaveAttribute('data-count', '2');
  });

  it('keeps the label and focus while the transaction is busy', () => {
    renderConsole({
      form: makeForm({ isGesturing: true, gestureTxStage: { status: 'preparing' } }),
    });

    const submit = screen.getByTestId('gesture-submit');
    expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(submit).not.toBeDisabled();
  });

  it('says when the connected wallet made the Final Gesture', () => {
    renderConsole({ canGesture: false });

    expect(screen.queryByTestId('gesture-submit')).not.toBeInTheDocument();
    expect(screen.getByText('home.form.finalGestureMade')).toBeInTheDocument();
  });

  it('opens Advanced inline with the attachment, protection and buffer groups', async () => {
    const setAdvancedExpanded = jest.fn();
    renderConsole({ form: makeForm({ advancedExpanded: true, setAdvancedExpanded }) });

    const advanced = screen.getByTestId('gesture-advanced');
    expect(advanced).toHaveAttribute('open');
    expect(within(advanced).getByTestId('min-cst-protection')).toBeInTheDocument();
    expect(within(advanced).getByTestId('collision-buffer')).toBeInTheDocument();
    await userEvent.click(within(advanced).getByText('home.form.advanced.title'));
    expect(setAdvancedExpanded).toHaveBeenCalledWith(false);
  });

  it('without a wallet: one connect block, no Advanced, the draft still writable', () => {
    renderConsole({ account: null });

    const connect = screen.getByTestId('connect-to-gesture');
    expect(within(connect).getByTestId('connect-wallet-button')).toBeInTheDocument();
    expect(screen.getAllByTestId('connect-wallet-button')).toHaveLength(1);
    expect(screen.queryByTestId('gesture-advanced')).not.toBeInTheDocument();
    expect(screen.queryByTestId('gesture-submit')).not.toBeInTheDocument();
    expect(screen.getByTestId('gesture-message-input')).toBeEnabled();
    expect(screen.queryByText('home.form.preview')).not.toBeInTheDocument();
  });

  it('shows the layout skeleton while the cycle loads', () => {
    renderConsole({ loading: true });

    expect(screen.getByTestId('gesture-form-skeleton')).toHaveAttribute('role', 'status');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('offers finalization once the clock reached zero', async () => {
    const onFinalize = jest.fn();
    const finalize: ConsoleFinalize = {
      canClaim: true,
      isClaiming: false,
      isLatestParticipant: true,
      openToAllAtMs: 0,
      nowMs: 0,
      onFinalize,
    };
    renderConsole({ canGesture: false, cycleTimerEnded: true, finalize });

    await userEvent.click(screen.getByTestId('finalize-submit'));
    expect(onFinalize).toHaveBeenCalledTimes(1);
  });

  it('holds finalization for others until the exclusive window ends', () => {
    renderConsole({
      finalize: {
        canClaim: true,
        isClaiming: false,
        isLatestParticipant: false,
        openToAllAtMs: 120_000,
        nowMs: 30_000,
        onFinalize: jest.fn(),
      },
    });

    expect(screen.getByTestId('finalize-submit')).toBeDisabled();
    // One sentence with the wait inside it, so every locale orders and spaces it.
    expect(screen.getByTestId('finalize-wait')).toHaveTextContent(
      'home.deck.console.finalizeOpensIn(duration=1m 30s)',
    );
  });

  it('owns #make-gesture only on the page, not in the sheet', () => {
    const { unmount } = renderConsole({ variant: 'sheet' });
    expect(screen.getByTestId('gesture-console')).not.toHaveAttribute('id');
    expect(screen.getByTestId('gesture-submit')).not.toHaveAttribute('id');
    unmount();

    renderConsole();
    expect(screen.getByTestId('gesture-console')).toHaveAttribute('id', 'make-gesture');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderConsole();
    await checkA11y(container);
  });
});
