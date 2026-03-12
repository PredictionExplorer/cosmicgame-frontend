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
  totalRewardsEth: 1234.56,
  activeMarketers: 42,
  rewardTransactions: 150,
};

describe('MarketingStats', () => {
  it('renders all three stat labels', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByText('Total Rewards')).toBeInTheDocument();
    expect(screen.getByText('Active Marketers')).toBeInTheDocument();
    expect(screen.getByText('Reward Transactions')).toBeInTheDocument();
  });

  it('renders info buttons for each stat', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByLabelText('Info about Total Rewards')).toBeInTheDocument();
    expect(screen.getByLabelText('Info about Active Marketers')).toBeInTheDocument();
    expect(screen.getByLabelText('Info about Reward Transactions')).toBeInTheDocument();
  });

  it('renders the CST suffix for total rewards', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByText('CST')).toBeInTheDocument();
  });

  it('has a screen-reader-only heading', () => {
    renderWithTooltip(<MarketingStats {...defaultProps} />);
    expect(screen.getByText('Marketing Program Statistics')).toBeInTheDocument();
  });

  it('renders zero values without crashing', () => {
    renderWithTooltip(
      <MarketingStats totalRewardsEth={0} activeMarketers={0} rewardTransactions={0} />,
    );
    expect(screen.getByText('Total Rewards')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<MarketingStats {...defaultProps} />);
    await checkA11y(container);
  });
});
