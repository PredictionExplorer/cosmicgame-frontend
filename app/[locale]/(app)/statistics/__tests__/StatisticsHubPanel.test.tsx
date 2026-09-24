import userEvent from '@testing-library/user-event';

import statisticsMessages from '@/messages/en/statistics.json';

import { render, screen, within, checkA11y } from '@/test-utils';

import StatisticsHubPanel from '../StatisticsHubPanel';
import { STATISTICS_SECTIONS } from '../statistics-sections';
import { createDashboardInfo } from '../test-support/statisticsTestFixtures';

const mockUseDashboardInfo = jest.fn();
const mockUseCTStatistics = jest.fn();
const mockUseGestureFrequency = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCTStatistics: (...args: unknown[]) => mockUseCTStatistics(...args),
  // lexicon-allow-start: the hook name mirrors the backend route
  useBidFrequency: (...args: unknown[]) => mockUseGestureFrequency(...args),
  // lexicon-allow-end
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

const { hub, metrics, groups, navigation } = statisticsMessages;

beforeEach(() => {
  jest.clearAllMocks();
  mockDashboard();
  mockUseCTStatistics.mockReturnValue({ data: { TotalSupplyEth: 55707.11 }, isLoading: false });
  mockUseGestureFrequency.mockReturnValue({ data: [], isLoading: false, isError: false });
});

describe('StatisticsHubPanel', () => {
  it('leaves the headline figures to the page header: each appears once per page', () => {
    render(<StatisticsHubPanel />);
    // StatisticsSeoSummary shows the cycle and its gestures, allocations, imprints and
    // balance once, from the same dashboard query; the body repeats none of them.
    for (const label of [
      metrics.activePerformanceCycle.label,
      metrics.contractBalance.label,
      metrics.allocationsDistributed.label,
      metrics.cosmicSignatureNftsImprinted.shortLabel,
    ]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it('opens on the live cycle: when it opened, what it has taken in, and its daily rhythm', () => {
    render(<StatisticsHubPanel />);
    const cycle = screen.getByRole('region', { name: 'Cycle 3 so far' });
    expect(within(cycle).getByText(hub.cycle.opened)).toBeInTheDocument();
    expect(within(cycle).getByText(metrics.ethInGesturesCurrentCycle.label)).toBeInTheDocument();
    const eth = within(cycle).getByText(metrics.ethInGesturesCurrentCycle.label).parentElement!;
    expect(eth).toHaveTextContent('2.3294 ETH');
    expect(within(cycle).getByRole('img', { name: /^Gestures per day/ })).toBeInTheDocument();
    expect(within(cycle).getByRole('link', { name: hub.cycle.open })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
  });

  it('draws where the Cycle Reserve goes against 100%, in the allocation tracks', () => {
    mockDashboard({
      data: createDashboardInfo({
        PrizePercentage: 25,
        ChronoWarriorPercentage: 8,
        RafflePercentage: 4,
        StakingPercentage: 6,
        CharityPercentage: 7,
      }),
    });
    const { container } = render(<StatisticsHubPanel />);
    expect(screen.getByRole('heading', { name: hub.cycle.splitTitle })).toBeInTheDocument();
    const segments = [...container.querySelectorAll<HTMLElement>('[data-track]')];
    expect(segments.map((segment) => segment.dataset.track)).toEqual([
      'signature',
      'chrono',
      'stellar',
      'anchor',
      'publicGoods',
      'nextCycle',
    ]);
    // What the tracks leave carries into the next cycle: the bar always sums to 100%.
    expect(segments.at(-1)).toHaveStyle({ width: '50%' });
  });

  it('indexes every section page with what it covers and its key figure', () => {
    render(<StatisticsHubPanel />);
    const nav = screen.getByRole('navigation', { name: hub.exploreAria });
    for (const section of STATISTICS_SECTIONS) {
      const link = nav.querySelector(`a[href="${section.href}"]`);
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent(navigation[section.messageKey].label);
      expect(link).toHaveTextContent(hub.index[section.messageKey as keyof typeof hub.index]);
    }
  });

  it('keeps the index entries to one headline figure each, none repeating the header', () => {
    render(<StatisticsHubPanel />);
    const nav = screen.getByRole('navigation', { name: hub.exploreAria });
    // A bare figure is a text node of digits (and grouping marks) alone.
    expect(within(nav).queryAllByText(/^[\d,.\s]+$/)).toHaveLength(0);
  });

  it('renders the protocol economy as three spec sheets with one Definitions disclosure', () => {
    render(<StatisticsHubPanel />);
    for (const group of [groups.allocationEconomy, groups.tokenEconomy, groups.publicGoods]) {
      expect(screen.getByRole('heading', { level: 3, name: group.label })).toBeInTheDocument();
    }
    const disclosure = screen.getByText(statisticsMessages.shared.definitions).closest('details');
    expect(disclosure).not.toHaveAttribute('open');
    expect(within(disclosure!).getByText(metrics.namedTokens.tooltip)).toBeInTheDocument();
    // No ⓘ after every label: the definitions live in the disclosure.
    expect(screen.queryAllByRole('button', { name: /^More information about/ })).toHaveLength(0);
  });

  it('groups every count, like the amounts beside it', () => {
    const base = createDashboardInfo();
    mockDashboard({
      data: createDashboardInfo({
        NumRwalkTokensUsed: 3_101,
        MainStats: {
          ...base.MainStats,
          NumBidsCST: 1_254,
          TotalNamedTokens: 4_096,
        },
      }),
    });
    render(<StatisticsHubPanel />);
    for (const count of ['1,254', '4,096', '3,101']) {
      expect(screen.getByText(count)).toBeInTheDocument();
    }
    expect(screen.queryByText('1254')).not.toBeInTheDocument();
  });

  it('links a figure to the ledger it counts', () => {
    render(<StatisticsHubPanel />);
    expect(screen.getByRole('link', { name: /^5\b/ })).toHaveAttribute('href', '/named-nfts');
  });

  it('shows an unread figure as unavailable, never as 0', () => {
    const base = createDashboardInfo();
    mockDashboard({
      data: createDashboardInfo({
        MainStats: { ...base.MainStats, TotalCSTConsumedEth: undefined as unknown as number },
      }),
    });
    render(<StatisticsHubPanel />);
    const row = screen.getAllByText(metrics.totalCstConsumed.label)[0]!.closest('div')!;
    expect(row).toHaveTextContent('—');
    expect(row).not.toHaveTextContent(/\b0\b/);
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
    expect(screen.getByText(hub.loadErrorTitle)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('keeps polling enabled on the hub dashboard query', () => {
    render(<StatisticsHubPanel />);
    // Hub is a live overview: it must not opt out of polling.
    const optionsArg = mockUseDashboardInfo.mock.calls[0]?.[1];
    expect(optionsArg?.poll ?? true).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatisticsHubPanel />);
    await checkA11y(container);
  });
});
