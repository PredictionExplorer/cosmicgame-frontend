import userEvent from '@testing-library/user-event';

import { flushDynamicImports } from '@/test-utils/dynamic';

import { render, screen, checkA11y, within } from '@/test-utils';

import ActivityPanel from '../ActivityPanel';
import { createDashboardInfo } from '../../test-support/statisticsTestFixtures';

// The code-split charts render synchronously once their modules resolve.
jest.mock('next/dynamic', () => require('@/test-utils/dynamic').syncDynamic);
beforeAll(() => flushDynamicImports());

const mockUseDashboardInfo = jest.fn();
const mockUseSystemModelist = jest.fn();

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useSystemModelist: (...args: unknown[]) => mockUseSystemModelist(...args),
}));

interface CycleChartProps {
  round: number;
  isLive?: boolean;
}
const cycleChart = (testId: string) => {
  const CycleChart = ({ round, isLive }: CycleChartProps) => (
    <div data-testid={testId}>
      {round}
      {isLive ? ' live' : ''}
    </div>
  );
  return CycleChart;
};

jest.mock('../../../../../../components/statistics/BidFrequencyChart', () => ({
  BidFrequencyChart: () => <div data-testid="gesture-frequency-chart" />,
}));
jest.mock('../../../../../../components/statistics/LastBidSpikeChart', () => ({
  LastBidSpikeChart: () => <div data-testid="gesture-spike-chart" />,
}));
jest.mock('../../../../../../components/statistics/BidderActivePeriodsTimeline', () => ({
  BidderActivePeriodsTimeline: () => <div data-testid="active-periods-timeline" />,
}));
jest.mock('../../../../../../components/statistics/GestureTypeMixChart', () => ({
  GestureTypeMixChart: (props: CycleChartProps) => cycleChart('gesture-type-mix-chart')(props),
}));
jest.mock('../../../../../../components/statistics/EnduranceTimelineChart', () => ({
  __esModule: true,
  default: (props: CycleChartProps) => cycleChart('endurance-timeline-chart')(props),
}));
jest.mock('../../../../../../components/statistics/CstCalibrationWindowChart', () => ({
  __esModule: true,
  default: (props: CycleChartProps) => cycleChart('cst-calibration-window-chart')(props),
}));
jest.mock('../../../../../../components/statistics/CstGestureCostChart', () => ({
  __esModule: true,
  default: (props: CycleChartProps) => cycleChart('cst-gesture-cost-chart')(props),
}));
jest.mock('../../../../../../components/tables/SystemModesTable', () => ({
  SystemModesTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="system-modes-table">{list.length} events</div>
  ),
}));

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

const CYCLE_CHARTS = [
  'gesture-type-mix-chart',
  'endurance-timeline-chart',
  'cst-calibration-window-chart',
  'cst-gesture-cost-chart',
];

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState(null, '', '/statistics/activity');
  mockUseDashboardInfo.mockReturnValue(okQuery(createDashboardInfo()));
  mockUseSystemModelist.mockReturnValue(
    okQuery([{ RoundNum: 0, EvtLogId: 1, TimeStamp: 1_700_000_000 }]),
  );
});

describe('ActivityPanel', () => {
  it('renders every gesture activity chart', () => {
    render(<ActivityPanel />);
    expect(screen.getByTestId('gesture-frequency-chart')).toBeInTheDocument();
    expect(screen.getByTestId('gesture-spike-chart')).toBeInTheDocument();
    expect(screen.getByTestId('active-periods-timeline')).toBeInTheDocument();
    for (const id of CYCLE_CHARTS) expect(screen.getByTestId(id)).toBeInTheDocument();
  });

  it('drives every cycle chart from one cycle picker, starting on the live cycle', () => {
    render(<ActivityPanel />);
    for (const id of CYCLE_CHARTS) expect(screen.getByTestId(id)).toHaveTextContent(/^3/);
    expect(screen.getByTestId('endurance-timeline-chart')).toHaveTextContent('3 live');
    // One picker for the page, not one per chart.
    expect(screen.getAllByRole('button', { name: 'Previous cycle' })).toHaveLength(1);
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
  });

  it('moves every cycle chart together and keeps the cycle in the URL', async () => {
    const user = userEvent.setup();
    render(<ActivityPanel />);
    await user.click(screen.getByRole('button', { name: 'Previous cycle' }));
    for (const id of CYCLE_CHARTS) expect(screen.getByTestId(id)).toHaveTextContent(/^2$/);
    expect(window.location.search).toBe('?cycle=2');

    await user.click(screen.getByRole('button', { name: 'Jump to live' }));
    for (const id of CYCLE_CHARTS) expect(screen.getByTestId(id)).toHaveTextContent(/^3/);
    expect(screen.getByTestId('endurance-timeline-chart')).toHaveTextContent('3 live');
    expect(window.location.search).toBe('');
  });

  it('opens on the cycle a link names', () => {
    window.history.replaceState(null, '', '/statistics/activity?cycle=1');
    render(<ActivityPanel />);
    for (const id of CYCLE_CHARTS) expect(screen.getByTestId(id)).toHaveTextContent(/^1$/);
  });

  it('links the endurance timeline to its pop-out window for the chosen cycle', () => {
    render(<ActivityPanel />);
    const section = screen
      .getByRole('heading', { name: 'Endurance & Chrono timeline' })
      .closest('section')!;
    expect(within(section).getByRole('link', { name: /open in a new window/i })).toHaveAttribute(
      'href',
      '/embed/endurance/3',
    );
  });

  it('keeps cycle activations collapsed and unmounted by default (lazy)', () => {
    render(<ActivityPanel />);
    expect(screen.queryByTestId('system-modes-table')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cycle activations' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('mounts the cycle activations table when expanded', async () => {
    const user = userEvent.setup();
    render(<ActivityPanel />);
    await user.click(screen.getByRole('button', { name: 'Cycle activations' }));
    expect(screen.getByTestId('system-modes-table')).toHaveTextContent('1 events');
  });

  it('shows an error state instead of an infinite spinner when cycle activations fail', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseSystemModelist.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<ActivityPanel />);
    await user.click(screen.getByRole('button', { name: 'Cycle activations' }));
    expect(screen.getByText(/failed to load cycle activations/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('holds the cycle section on a chart skeleton while the dashboard loads', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<ActivityPanel />);
    const section = screen
      .getByRole('heading', { name: 'One cycle in detail' })
      .closest('section')!;
    expect(section).toHaveAttribute('aria-busy', 'true');
    expect(within(section).getByRole('status')).toBeInTheDocument();
    // No chart claims a state for a cycle it does not know yet.
    for (const id of CYCLE_CHARTS) expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    expect(screen.queryByText(/hasn.t started yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/select a cycle/i)).not.toBeInTheDocument();
    // The all-time charts do not wait for the dashboard.
    expect(screen.getByTestId('gesture-frequency-chart')).toBeInTheDocument();
  });

  it('shows an error with a retry, not a chart state, when the dashboard read fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<ActivityPanel />);
    const section = screen
      .getByRole('heading', { name: 'One cycle in detail' })
      .closest('section')!;
    expect(within(section).getByText(/failed to load one cycle in detail/i)).toBeInTheDocument();
    for (const id of CYCLE_CHARTS) expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    expect(within(section).queryByRole('combobox')).not.toBeInTheDocument();

    await user.click(within(section).getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('keeps the cycle charts when a later dashboard read fails', () => {
    mockUseDashboardInfo.mockReturnValue({
      ...okQuery(createDashboardInfo()),
      isError: true,
    });
    render(<ActivityPanel />);
    for (const id of CYCLE_CHARTS) expect(screen.getByTestId(id)).toHaveTextContent(/^3/);
  });

  it('requests the dashboard without polling', () => {
    render(<ActivityPanel />);
    expect(mockUseDashboardInfo).toHaveBeenCalledWith(undefined, { poll: false });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ActivityPanel />);
    await checkA11y(container);
  });
});
