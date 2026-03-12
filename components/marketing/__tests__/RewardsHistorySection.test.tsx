import { TooltipProvider } from '@/components/ui/tooltip';
import type { MarketingReward } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

import { RewardsHistorySection } from '../RewardsHistorySection';


const renderWithTooltip = (ui: React.ReactElement) =>
  render(<TooltipProvider>{ui}</TooltipProvider>);

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

jest.mock('../../../components/tables/GlobalMarketingRewardsTable', () => ({
  GlobalMarketingRewardsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="rewards-table">rows: {list.length}</div>
  ),
}));

const makeReward = (id: number): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${id}`,
  TimeStamp: Date.now() / 1000,
  MarketerAddr: `0x${String(id).padStart(40, '0')}`,
  AmountEth: id * 10,
});

describe('RewardsHistorySection', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<RewardsHistorySection rewards={[]} />);
    expect(screen.getByText('Reward History')).toBeInTheDocument();
  });

  it('shows empty state when no rewards', () => {
    renderWithTooltip(<RewardsHistorySection rewards={[]} />);
    expect(screen.getByText('No rewards distributed yet')).toBeInTheDocument();
  });

  it('renders the table when rewards exist', () => {
    const rewards = [makeReward(1), makeReward(2)];
    renderWithTooltip(<RewardsHistorySection rewards={rewards} />);
    expect(screen.getByTestId('rewards-table')).toHaveTextContent('rows: 2');
  });

  it('displays the reward count', () => {
    const rewards = [makeReward(1), makeReward(2), makeReward(3)];
    renderWithTooltip(<RewardsHistorySection rewards={rewards} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/rewards$/)).toBeInTheDocument();
  });

  it('uses singular form for one reward', () => {
    renderWithTooltip(<RewardsHistorySection rewards={[makeReward(1)]} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/reward$/)).toBeInTheDocument();
  });

  it('does not show count badge for empty list', () => {
    renderWithTooltip(<RewardsHistorySection rewards={[]} />);
    expect(screen.queryByText('Showing')).not.toBeInTheDocument();
  });

  it('has an info tooltip trigger', () => {
    renderWithTooltip(<RewardsHistorySection rewards={[]} />);
    expect(screen.getByLabelText('Info about reward history')).toBeInTheDocument();
  });

  it('has no accessibility violations with rewards', async () => {
    const { container } = renderWithTooltip(<RewardsHistorySection rewards={[makeReward(1)]} />);
    await checkA11y(container);
  });

  it('has no accessibility violations when empty', async () => {
    const { container } = renderWithTooltip(<RewardsHistorySection rewards={[]} />);
    await checkA11y(container);
  });
});
