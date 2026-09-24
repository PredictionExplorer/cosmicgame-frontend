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
  default: ({ round, isLive }: { round: number; isLive: boolean }) => (
    <div data-testid="endurance-chart">
      {round}
      {isLive ? ' live' : ' final'}
    </div>
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
