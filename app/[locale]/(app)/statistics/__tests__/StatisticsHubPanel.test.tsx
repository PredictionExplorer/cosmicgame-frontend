import userEvent from '@testing-library/user-event';

import statisticsMessages from '@/messages/en/statistics.json';

import { render, screen, within, checkA11y } from '@/test-utils';

import StatisticsHubPanel from '../StatisticsHubPanel';
import { STATISTICS_SECTIONS } from '../statistics-sections';
import { createDashboardInfo } from '../test-support/statisticsTestFixtures';

const mockUseDashboardInfo = jest.fn();
const mockUseCTStatistics = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCTStatistics: (...args: unknown[]) => mockUseCTStatistics(...args),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

function mockDashboard(overrides: Partial<ReturnType<typeof baseQueryState>> = {}) {
  mockUseDashboardInfo.mockReturnValue({ ...baseQueryState(), ...overrides });
}

function baseQueryState() {
  return {
    data: createDashboardInfo(),
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDashboard();
  mockUseCTStatistics.mockReturnValue({ data: { TotalSupplyEth: 55707.11 } });
});

describe('StatisticsHubPanel', () => {
  it('renders headline stat cards from the dashboard', () => {
    render(<StatisticsHubPanel />);
    expect(screen.getByText('Total Cycles')).toBeInTheDocument();
    // The StatCard label is a Term (the card has a tooltip); the economy row
    // of the same name further down the panel has its own explanation.
    const [headline] = screen.getAllByRole('button', {
      name: 'More information about Allocations Distributed',
    });
    expect(headline).toHaveTextContent('Allocations Distributed');
    expect(screen.getByText('Contract Balance')).toBeInTheDocument();
    expect(screen.getByText('36.1595 ETH')).toBeInTheDocument();
  });

  it('gives each headline figure its own pictogram', () => {
    render(<StatisticsHubPanel />);
    // Allocations Distributed and NFTs Imprinted sit side by side: one
    // concept, one glyph, and never the same glyph for two concepts.
    const headline = screen.getByTestId('statistics-hub').firstElementChild;
    const glyphs = [...(headline?.querySelectorAll('svg') ?? [])].map(
      (svg) => [...svg.classList].find((name) => name.startsWith('lucide-')) ?? '',
    );
    expect(glyphs).toHaveLength(4);
    expect(new Set(glyphs).size).toBe(glyphs.length);
    expect(glyphs).toEqual(expect.arrayContaining(['lucide-layers', 'lucide-stamp']));
  });

  it('renders an explore card linking to every section page', () => {
    render(<StatisticsHubPanel />);
    const nav = screen.getByRole('navigation', { name: 'Statistics section pages' });
    for (const section of STATISTICS_SECTIONS) {
      expect(nav.querySelector(`a[href="${section.href}"]`)).toBeInTheDocument();
      expect(
        within(nav).getByRole('heading', {
          name: statisticsMessages.navigation[section.messageKey].label,
        }),
      ).toBeInTheDocument();
    }
  });

  it('shows live headline stats inside explore cards', () => {
    render(<StatisticsHubPanel />);
    expect(screen.getByText('unique participants')).toBeInTheDocument();
    expect(screen.getByText('gestures this cycle')).toBeInTheDocument();
    expect(screen.getByText('allocations distributed')).toBeInTheDocument();
  });

  it('renders the protocol economy groups', () => {
    render(<StatisticsHubPanel />);
    expect(screen.getByText('Allocation Economy')).toBeInTheDocument();
    expect(screen.getByText('Token Economy')).toBeInTheDocument();
    expect(screen.getByText('Public Goods & Contributions')).toBeInTheDocument();
  });

  it('groups every count, like the amounts beside it', () => {
    const base = createDashboardInfo();
    mockDashboard({
      data: createDashboardInfo({
        NumRwalkTokensUsed: 3_101,
        MainStats: {
          ...base.MainStats,
          NumBidsCST: 1_254,
          NumMktRewards: 2_048,
          TotalNamedTokens: 4_096,
        },
      }),
    });
    render(<StatisticsHubPanel />);
    for (const count of ['1,254', '2,048', '4,096', '3,101']) {
      expect(screen.getByText(count)).toBeInTheDocument();
    }
    expect(screen.queryByText('1254')).not.toBeInTheDocument();
  });

  it('does not render the heavy detail sections on the hub', () => {
    render(<StatisticsHubPanel />);
    expect(screen.queryByText('Unique Participants')).not.toBeInTheDocument();
    expect(screen.queryByText('Anchor / Release Actions')).not.toBeInTheDocument();
    expect(screen.queryByText('Gesture Frequency Over Time')).not.toBeInTheDocument();
  });

  it('shows skeletons while the dashboard loads', () => {
    mockDashboard({ data: undefined, isLoading: true });
    render(<StatisticsHubPanel />);
    expect(screen.getByTestId('statistics-hub-loading')).toBeInTheDocument();
  });

  it('shows an error state with retry when the dashboard fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockDashboard({ data: undefined, isError: true, refetch });
    render(<StatisticsHubPanel />);
    expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('keeps polling enabled on the hub dashboard query', () => {
    render(<StatisticsHubPanel />);
    // Hub is a live overview: it must not opt out of polling.
    const optionsArg = mockUseDashboardInfo.mock.calls[0]?.[1];
    expect(optionsArg?.poll ?? true).toBe(true);
  });

  it('links to the anchoring statistics page from the snapshot', () => {
    render(<StatisticsHubPanel />);
    expect(screen.getByRole('link', { name: /anchoring statistics/i })).toHaveAttribute(
      'href',
      '/statistics/anchoring',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatisticsHubPanel />);
    await checkA11y(container);
  });
});
