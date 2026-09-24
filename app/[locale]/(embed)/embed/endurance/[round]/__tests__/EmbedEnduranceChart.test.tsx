import userEvent from '@testing-library/user-event';

import { render, screen } from '@/test-utils';

import EmbedEnduranceChart from '../EmbedEnduranceChart';
import EmbedEndurancePage, { generateMetadata } from '../page';

const mockUseDashboardInfo = jest.fn();
const mockNotFound = jest.fn();

jest.mock('../../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: () => mockNotFound(),
}));
jest.mock('../../../../../../../components/statistics/EnduranceTimelineChart', () => ({
  __esModule: true,
  default: function MockEnduranceTimelineChart({
    round,
    isLive,
    laneLimit,
  }: {
    round: number;
    isLive: boolean;
    laneLimit?: number | null;
  }) {
    const { useChartLinksOpenNewWindow } = jest.requireActual<
      typeof import('@/components/statistics/charts/timeline')
    >('@/components/statistics/charts/timeline');
    return (
      <div
        data-testid="endurance-chart"
        data-lane-limit={String(laneLimit)}
        data-new-window-links={String(useChartLinksOpenNewWindow())}
      >
        {round}
        {isLive ? ' live' : ' final'}
      </div>
    );
  },
  EnduranceTimelineSkeleton: ({ lanes }: { lanes?: number }) => (
    <div role="status" data-testid="endurance-skeleton" data-lanes={String(lanes)} />
  ),
}));

const dashboard = (overrides: Record<string, unknown>) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockNotFound.mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND');
  });
});

describe('endurance embed page', () => {
  it.each(['abc', '-1', '01', '1.5', String(Number.MAX_SAFE_INTEGER + 1)])(
    '404s the non-cycle %j in metadata and page rendering',
    async (round) => {
      const props = { params: Promise.resolve({ locale: 'en', round }) };
      await expect(generateMetadata(props)).rejects.toThrow('NEXT_NOT_FOUND');
      await expect(EmbedEndurancePage(props)).rejects.toThrow('NEXT_NOT_FOUND');
    },
  );
});

describe('EmbedEnduranceChart', () => {
  it('claims neither live nor final while the dashboard loads', () => {
    mockUseDashboardInfo.mockReturnValue(dashboard({ isLoading: true }));
    render(<EmbedEnduranceChart roundNum={3} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cycle 3');
    expect(screen.queryByText('Live cycle')).not.toBeInTheDocument();
    expect(screen.queryByText('Final')).not.toBeInTheDocument();
    expect(screen.queryByTestId('endurance-chart')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('marks the live cycle live and an earlier cycle final', () => {
    mockUseDashboardInfo.mockReturnValue(dashboard({ data: { CurRoundNum: 3 } }));
    const { rerender } = render(<EmbedEnduranceChart roundNum={3} />);
    expect(screen.getByText('Live cycle')).toBeInTheDocument();
    expect(screen.getByTestId('endurance-chart')).toHaveTextContent('3 live');

    rerender(<EmbedEnduranceChart roundNum={1} />);
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getByTestId('endurance-chart')).toHaveTextContent('1 final');
  });

  it('draws every lane: the embed is a page of its own, never a scroll box in one', () => {
    mockUseDashboardInfo.mockReturnValue(dashboard({ data: { CurRoundNum: 3 } }));
    render(<EmbedEnduranceChart roundNum={1} />);
    expect(screen.getByTestId('endurance-chart')).toHaveAttribute('data-lane-limit', 'null');
  });

  it('opens the chart’s links in a new window, like its source link', () => {
    mockUseDashboardInfo.mockReturnValue(dashboard({ data: { CurRoundNum: 3 } }));
    render(<EmbedEnduranceChart roundNum={1} />);
    expect(screen.getByTestId('endurance-chart')).toHaveAttribute('data-new-window-links', 'true');
    expect(screen.getByRole('link', { name: /opens in a new window/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('puts the badge and the chart in the server render from the server read', () => {
    // The client's dashboard has not answered: the server's live cycle decides.
    mockUseDashboardInfo.mockReturnValue(dashboard({ isLoading: true }));
    render(<EmbedEnduranceChart roundNum={1} seedLiveCycle={3} expectedLanes={19} />);
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getByTestId('endurance-chart')).toHaveTextContent('1 final');
  });

  it('never 404s from the server read alone, and sizes the wait to its lane count', () => {
    mockUseDashboardInfo.mockReturnValue(dashboard({ isLoading: true }));
    render(<EmbedEnduranceChart roundNum={4} seedLiveCycle={3} expectedLanes={19} />);
    expect(mockNotFound).not.toHaveBeenCalled();
    expect(screen.queryByText('Live cycle')).not.toBeInTheDocument();
    expect(screen.getByTestId('endurance-skeleton')).toHaveAttribute('data-lanes', '19');
  });

  it('treats a cycle past the live one as not found, never as live', () => {
    mockNotFound.mockImplementation(() => undefined);
    mockUseDashboardInfo.mockReturnValue(dashboard({ data: { CurRoundNum: 3 } }));
    render(<EmbedEnduranceChart roundNum={99} />);
    expect(mockNotFound).toHaveBeenCalled();
    expect(screen.queryByText('Live cycle')).not.toBeInTheDocument();
  });

  it('shows an error with a retry, not a final badge, when the dashboard fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseDashboardInfo.mockReturnValue(dashboard({ isError: true, refetch }));
    render(<EmbedEnduranceChart roundNum={3} />);
    expect(screen.queryByText('Final')).not.toBeInTheDocument();
    expect(screen.queryByTestId('endurance-chart')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
