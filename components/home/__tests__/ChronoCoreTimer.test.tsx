import type { DashboardInfo } from '@/services/api';

import { render, screen, checkA11y } from '@/test-utils';

import { ChronoCoreTimer, getChronoCorePhase } from '../ChronoCoreTimer';

const mockCountdownProps: Array<Record<string, unknown>> = [];
let mockCountdownMounts = 0;

jest.mock('react-countdown', () => ({
  __esModule: true,
  default: function MockCountdown(props: Record<string, unknown>) {
    const React = jest.requireActual('react') as typeof import('react');
    React.useEffect(() => {
      mockCountdownMounts += 1;
    }, []);
    mockCountdownProps.push(props);
    return <div data-testid="chrono-countdown" />;
  },
}));

jest.mock('../../common/Counter', () => ({
  __esModule: true,
  default: ({ size }: { size?: string }) => <div data-testid="counter">Counter {size}</div>,
}));

const NOW = 1_700_000_000_000;
const ZERO = '0x0000000000000000000000000000000000000000';

function dashboard(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    CurRoundNum: 9,
    CurNumBids: 27,
    CurPrizeAmountEth: 2,
    PrizeAmountEth: 2.5,
    PrizeClaimTs: 0,
    TsRoundStart: Math.floor(NOW / 1000) - 3600,
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    GestureCostEth: 0.01,
    StakingAmountEth: 0,
    MainStats: { NumCSTokenMints: 100 },
    NumRaffleNFTWinnersBidding: 0,
    NumRaffleNFTWinnersStakingRWalk: 0,
    ...overrides,
  } as DashboardInfo;
}

const baseProps = {
  data: dashboard(),
  loading: false,
  allocationTime: NOW + 13 * 60 * 60 * 1000,
  activationTime: 0,
  now: NOW,
  canOpenGesturePanel: true,
};

describe('getChronoCorePhase', () => {
  it.each([
    ['loading', { loading: true }],
    ['unavailable', { data: null }],
    ['pre-activation', { activationTime: NOW / 1000 + 60 }],
    ['waiting', { data: dashboard({ TsRoundStart: 0, LastBidderAddr: ZERO }) }],
    ['stable', { allocationTime: NOW + 13 * 60 * 60 * 1000 }],
    ['approach', { allocationTime: NOW + 12 * 60 * 60 * 1000 }],
    ['final-hour', { allocationTime: NOW + 60 * 60 * 1000 }],
    ['final-ten', { allocationTime: NOW + 10 * 60 * 1000 }],
    ['final-minute', { allocationTime: NOW + 60 * 1000 }],
    ['ready', { allocationTime: NOW - 1 }],
  ] as const)('returns %s phase', (phase, overrides) => {
    expect(getChronoCorePhase({ ...baseProps, ...overrides })).toBe(phase);
  });
});

describe('<ChronoCoreTimer />', () => {
  beforeEach(() => {
    mockCountdownProps.length = 0;
    mockCountdownMounts = 0;
  });

  it('renders the clean monument clock with large smooth countdown props', () => {
    render(<ChronoCoreTimer {...baseProps} />);

    const timer = screen.getByTestId('chrono-core-timer');
    expect(timer).toHaveAttribute('data-phase', 'stable');
    expect(screen.getByText('Time left in this cycle')).toBeInTheDocument();
    expect(
      screen.getByText('Each Gesture extends the Cycle Finalization Time.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Protocol clock locked')).not.toBeInTheDocument();
    expect(screen.queryByText('Chrono Core')).not.toBeInTheDocument();
    expect(screen.queryByText('2.5000 ETH')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Make a Gesture/ })).toHaveAttribute(
      'href',
      '#make-gesture',
    );
    expect(mockCountdownProps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          intervalDelay: 100,
          precision: 1,
        }),
      ]),
    );
  });

  it('keeps the countdown mounted when the target time refreshes in the same phase', () => {
    const { rerender } = render(<ChronoCoreTimer {...baseProps} />);

    expect(mockCountdownMounts).toBe(1);
    rerender(<ChronoCoreTimer {...baseProps} allocationTime={baseProps.allocationTime + 5_000} />);

    expect(mockCountdownMounts).toBe(1);
    expect(mockCountdownProps.at(-1)).toEqual(
      expect.objectContaining({ date: baseProps.allocationTime + 5_000 }),
    );
  });

  it('uses critical final-minute copy and keeps the timer accessible', () => {
    render(<ChronoCoreTimer {...baseProps} allocationTime={NOW + 30_000} />);

    const timer = screen.getByTestId('chrono-core-timer');
    expect(timer).toHaveAttribute('data-phase', 'final-minute');
    expect(screen.getByText('Final minute. Tenths are live.')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveAccessibleName(
      'Final minute. Final minute. Tenths are live.',
    );
  });

  it('shows ready-to-finalize state when the target has passed', () => {
    render(<ChronoCoreTimer {...baseProps} allocationTime={NOW - 1} />);

    expect(screen.getByTestId('chrono-core-timer')).toHaveAttribute('data-phase', 'ready');
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('Cycle ready to finalize.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Finalize Cycle/ })).toHaveAttribute(
      'href',
      '#make-gesture',
    );
  });

  it('shows first-gesture waiting state without rendering the countdown component', () => {
    render(
      <ChronoCoreTimer
        {...baseProps}
        data={dashboard({ TsRoundStart: 0, LastBidderAddr: ZERO })}
      />,
    );

    expect(screen.getByTestId('chrono-core-timer')).toHaveAttribute('data-phase', 'waiting');
    expect(screen.getByText('Awaiting Gesture')).toBeInTheDocument();
    expect(mockCountdownProps).toHaveLength(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ChronoCoreTimer {...baseProps} />);
    await checkA11y(container);
  });
});
