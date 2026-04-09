import { render, screen, checkA11y } from '@/test-utils';

import MarketingRewards from '../MarketingRewards';

const mockUseMarketingRewards = jest.fn();
const mockUseDashboardInfo = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useMarketingRewards: (...args: unknown[]) => mockUseMarketingRewards(...args),
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  const cache: Record<string, React.ForwardRefExoticComponent<unknown>> = {};
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          if (!cache[prop]) {
            const Comp = React.forwardRef(function MotionProxy(
              props: Record<string, unknown>,
              ref: React.Ref<HTMLElement>,
            ) {
              const {
                initial: _i,
                animate: _a,
                whileInView: _w,
                viewport: _v,
                transition: _t,
                variants: _va,
                ...rest
              } = props;
              return React.createElement(prop, { ...rest, ref });
            });
            Comp.displayName = `motion.${prop}`;
            cache[prop] = Comp;
          }
          return cache[prop];
        },
      },
    ),
    useInView: () => true,
  };
});

function MockHero() {
  return <div data-testid="hero">Hero</div>;
}
jest.mock('../../../../components/marketing/MarketingHero', () => ({
  MarketingHero: MockHero,
}));

function MockStats(props: Record<string, unknown>) {
  return (
    <div
      data-testid="stats"
      data-total={props.totalRewardsEth}
      data-marketers={props.activeMarketers}
      data-transactions={props.rewardTransactions}
    >
      Stats
    </div>
  );
}
jest.mock('../../../../components/marketing/MarketingStats', () => ({
  MarketingStats: MockStats,
}));

function MockHowItWorks() {
  return <div data-testid="how-it-works">HowItWorks</div>;
}
jest.mock('../../../../components/marketing/HowItWorks', () => ({
  HowItWorks: MockHowItWorks,
}));

function MockLeaderboard({ rewards }: { rewards: unknown[] }) {
  return <div data-testid="leaderboard">Leaderboard: {rewards.length}</div>;
}
jest.mock('../../../../components/marketing/TopMarketersLeaderboard', () => ({
  TopMarketersLeaderboard: MockLeaderboard,
}));

function MockHistory({ rewards }: { rewards: unknown[] }) {
  return <div data-testid="history">History: {rewards.length}</div>;
}
jest.mock('../../../../components/marketing/RewardsHistorySection', () => ({
  RewardsHistorySection: MockHistory,
}));

function MockCTA() {
  return <div data-testid="cta">CTA</div>;
}
jest.mock('../../../../components/marketing/MarketingCTA', () => ({
  MarketingCTA: MockCTA,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue({
    data: { MainStats: { TotalMktRewardsEth: 500, NumMktRewards: 25 } },
    isLoading: false,
  });
});

const sampleRewards = [
  { EvtLogId: 1, TxHash: '0x1', TimeStamp: 1000, MarketerAddr: '0xAAA', AmountEth: 10 },
  { EvtLogId: 2, TxHash: '0x2', TimeStamp: 2000, MarketerAddr: '0xBBB', AmountEth: 20 },
];

describe('MarketingRewards', () => {
  it('shows loading state when rewards are loading', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: true });
    render(<MarketingRewards />);
    expect(screen.getByLabelText('Loading marketing rewards')).toBeInTheDocument();
  });

  it('shows loading state when dashboard is loading', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: false });
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: true });
    render(<MarketingRewards />);
    expect(screen.getByLabelText('Loading marketing rewards')).toBeInTheDocument();
  });

  it('renders all sections when loaded', () => {
    mockUseMarketingRewards.mockReturnValue({ data: sampleRewards, isLoading: false });
    render(<MarketingRewards />);

    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('stats')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
    expect(screen.getByTestId('history')).toBeInTheDocument();
    expect(screen.getByTestId('cta')).toBeInTheDocument();
  });

  it('passes rewards data to leaderboard and history', () => {
    mockUseMarketingRewards.mockReturnValue({ data: sampleRewards, isLoading: false });
    render(<MarketingRewards />);

    expect(screen.getByTestId('leaderboard')).toHaveTextContent('Leaderboard: 2');
    expect(screen.getByTestId('history')).toHaveTextContent('History: 2');
  });

  it('passes dashboard stats to MarketingStats', () => {
    mockUseMarketingRewards.mockReturnValue({ data: sampleRewards, isLoading: false });
    render(<MarketingRewards />);

    const stats = screen.getByTestId('stats');
    expect(stats).toHaveAttribute('data-total', '500');
    expect(stats).toHaveAttribute('data-transactions', '25');
  });

  it('computes unique active marketers', () => {
    mockUseMarketingRewards.mockReturnValue({ data: sampleRewards, isLoading: false });
    render(<MarketingRewards />);

    const stats = screen.getByTestId('stats');
    expect(stats).toHaveAttribute('data-marketers', '2');
  });

  it('handles null rewards gracefully', () => {
    mockUseMarketingRewards.mockReturnValue({ data: null, isLoading: false });
    render(<MarketingRewards />);

    expect(screen.getByTestId('leaderboard')).toHaveTextContent('Leaderboard: 0');
    expect(screen.getByTestId('history')).toHaveTextContent('History: 0');
  });

  it('handles missing dashboard stats gracefully', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: false });
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false });
    render(<MarketingRewards />);

    const stats = screen.getByTestId('stats');
    expect(stats).toHaveAttribute('data-total', '0');
    expect(stats).toHaveAttribute('data-transactions', '0');
  });

  it('does not render sections while loading', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: true });
    render(<MarketingRewards />);

    expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stats')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseMarketingRewards.mockReturnValue({ data: sampleRewards, isLoading: false });
    const { container } = render(<MarketingRewards />);
    await checkA11y(container);
  });
});
