// lexicon-allow-start: test ids mirror internal analytics component names
import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import ActivityPanel from '../ActivityPanel';
import { createDashboardInfo } from '../../test-support/statisticsTestFixtures';

const mockUseDashboardInfo = jest.fn();
const mockUseSystemModelist = jest.fn();

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useSystemModelist: (...args: unknown[]) => mockUseSystemModelist(...args),
}));

jest.mock('../../../../../../components/statistics/BidFrequencyChart', () => ({
  BidFrequencyChart: () => <div data-testid="bid-frequency-chart" />,
}));
jest.mock('../../../../../../components/statistics/LastBidSpikeChart', () => ({
  LastBidSpikeChart: () => <div data-testid="last-bid-spike-chart" />,
}));
jest.mock('../../../../../../components/statistics/BidderActivePeriodsTimeline', () => ({
  BidderActivePeriodsTimeline: () => <div data-testid="bidder-active-periods-timeline" />,
}));
jest.mock('../../../../../../components/statistics/BidTypeRatioChart', () => ({
  BidTypeRatioChart: ({ roundStartTs }: { roundStartTs: number }) => (
    <div data-testid="bid-type-ratio-chart">{roundStartTs}</div>
  ),
}));
jest.mock('../../../../../../components/statistics/EnduranceTimelineChart', () => ({
  EnduranceTimelineSection: ({ currentRoundNum }: { currentRoundNum: number }) => (
    <div data-testid="endurance-timeline-section">{currentRoundNum}</div>
  ),
}));
jest.mock('../../../../../../components/statistics/CstCalibrationWindowChart', () => ({
  CstCalibrationWindowSection: ({ currentRoundNum }: { currentRoundNum: number }) => (
    <div data-testid="cst-calibration-window-section">{currentRoundNum}</div>
  ),
}));
jest.mock('../../../../../../components/statistics/CstGestureCostChart', () => ({
  CstGestureCostSection: ({ currentRoundNum }: { currentRoundNum: number }) => (
    <div data-testid="cst-gesture-cost-section">{currentRoundNum}</div>
  ),
}));
jest.mock('../../../../../../components/tables/SystemModesTable', () => ({
  SystemModesTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="system-modes-table">{list.length} events</div>
  ),
}));

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue(okQuery(createDashboardInfo()));
  mockUseSystemModelist.mockReturnValue(
    okQuery([{ RoundNum: 0, EvtLogId: 1, TimeStamp: 1_700_000_000 }]),
  );
});

describe('ActivityPanel', () => {
  it('renders all gesture activity chart sections', () => {
    render(<ActivityPanel />);
    expect(screen.getByTestId('bid-frequency-chart')).toBeInTheDocument();
    expect(screen.getByTestId('last-bid-spike-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bidder-active-periods-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('bid-type-ratio-chart')).toBeInTheDocument();
    expect(screen.getByTestId('endurance-timeline-section')).toBeInTheDocument();
    expect(screen.getByTestId('cst-calibration-window-section')).toBeInTheDocument();
    expect(screen.getByTestId('cst-gesture-cost-section')).toBeInTheDocument();
  });

  it('feeds dashboard round data into the charts', () => {
    render(<ActivityPanel />);
    expect(screen.getByTestId('bid-type-ratio-chart')).toHaveTextContent('1700000000');
    expect(screen.getByTestId('endurance-timeline-section')).toHaveTextContent('3');
    expect(screen.getByTestId('cst-calibration-window-section')).toHaveTextContent('3');
    expect(screen.getByTestId('cst-gesture-cost-section')).toHaveTextContent('3');
  });

  it('keeps cycle activations collapsed and unmounted by default (lazy)', () => {
    render(<ActivityPanel />);
    expect(screen.queryByTestId('system-modes-table')).not.toBeInTheDocument();
    // Exact name — the info-tooltip button also mentions "Cycle Activations".
    expect(screen.getByRole('button', { name: 'Cycle Activations' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('mounts the cycle activations table when expanded', async () => {
    const user = userEvent.setup();
    render(<ActivityPanel />);
    await user.click(screen.getByRole('button', { name: 'Cycle Activations' }));
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
    await user.click(screen.getByRole('button', { name: 'Cycle Activations' }));
    expect(screen.getByText(/failed to load cycle activations/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
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
// lexicon-allow-end
