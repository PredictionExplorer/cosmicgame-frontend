import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { MarketingStats } from '../MarketingStats';

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

const defaultProps = {
  totalAllocatedCst: 1234.56,
  activeMarketers: 42,
  rewardTransactions: 150,
};

describe('MarketingStats', () => {
  it('renders all three stat labels', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByText('Total Allocations')).toBeInTheDocument();
    expect(screen.getByText('Active Outreach Contributors')).toBeInTheDocument();
    expect(screen.getByText('Allocation Transactions')).toBeInTheDocument();
  });

  it('renders info buttons for each stat', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByLabelText('Info about Total Allocations')).toBeInTheDocument();
    expect(screen.getByLabelText('Info about Active Outreach Contributors')).toBeInTheDocument();
    expect(screen.getByLabelText('Info about Allocation Transactions')).toBeInTheDocument();
  });

  it('renders the CST suffix for total rewards', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByText('CST')).toBeInTheDocument();
  });

  it('has a screen-reader-only heading', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByText('Outreach Program Statistics')).toBeInTheDocument();
  });

  it('renders zero values without crashing', () => {
    renderWithTooltip(
      <MarketingStats totalAllocatedCst={0} activeMarketers={0} rewardTransactions={0} />,
    );
    expect(screen.getByText('Total Allocations')).toBeInTheDocument();
  });

  it('shows unread figures as unavailable, never as 0 CST', () => {
    renderWithTooltip(
      <MarketingStats totalAllocatedCst={null} activeMarketers={3} rewardTransactions={null} />,
    );
    expect(screen.getAllByText('common.status.unavailable')).toHaveLength(2);
    expect(screen.queryByText('CST')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Total Allocations.*0/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<MarketingStats {...defaultProps} />);
    await checkA11y(container);
  });
});
