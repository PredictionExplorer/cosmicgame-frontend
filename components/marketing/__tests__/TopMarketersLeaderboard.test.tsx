import { TooltipProvider } from '@/components/ui/tooltip';
import type { MarketingReward } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

import { TopMarketersLeaderboard } from '../TopMarketersLeaderboard';


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

jest.mock('../../../components/common/AddressLink', () => ({
  AddressLink: ({ address, url }: { address: string; url: string }) => (
    <a href={url} data-testid="address-link">
      {address}
    </a>
  ),
}));

const makeReward = (addr: string, amount: number, id: number): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${id}`,
  TimeStamp: Date.now() / 1000,
  MarketerAddr: addr,
  AmountEth: amount,
});

describe('TopMarketersLeaderboard', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<TopMarketersLeaderboard rewards={[]} />);
    expect(screen.getByText('Top Marketers')).toBeInTheDocument();
  });

  it('shows empty state when no rewards', () => {
    renderWithTooltip(<TopMarketersLeaderboard rewards={[]} />);
    expect(screen.getByText('No marketers yet.')).toBeInTheDocument();
  });

  it('aggregates and ranks marketers by total earned', () => {
    const rewards = [
      makeReward('0xAAA', 10, 1),
      makeReward('0xBBB', 50, 2),
      makeReward('0xAAA', 30, 3),
    ];
    renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);

    const links = screen.getAllByTestId('address-link');
    expect(links[0]).toHaveTextContent('0xBBB');
    expect(links[1]).toHaveTextContent('0xAAA');
  });

  it('shows rank numbers', () => {
    const rewards = [makeReward('0xAAA', 100, 1), makeReward('0xBBB', 50, 2)];
    renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('limits to top 5 marketers', () => {
    const rewards = Array.from({ length: 8 }, (_, i) =>
      makeReward(`0x${String(i).padStart(40, '0')}`, (8 - i) * 10, i),
    );
    renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);
    const links = screen.getAllByTestId('address-link');
    expect(links).toHaveLength(5);
  });

  it('displays total earned with CST suffix', () => {
    const rewards = [makeReward('0xAAA', 123.45, 1)];
    renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
    expect(screen.getByText('CST')).toBeInTheDocument();
  });

  it('displays reward count', () => {
    const rewards = [
      makeReward('0xAAA', 10, 1),
      makeReward('0xAAA', 20, 2),
      makeReward('0xAAA', 30, 3),
    ];
    renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);
    expect(screen.getByText('3 rewards')).toBeInTheDocument();
  });

  it('uses singular "reward" for count of 1', () => {
    const rewards = [makeReward('0xAAA', 10, 1)];
    renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);
    expect(screen.getByText('1 reward')).toBeInTheDocument();
  });

  it('links to marketer detail page', () => {
    const rewards = [makeReward('0xAAA', 10, 1)];
    renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);
    const link = screen.getByTestId('address-link');
    expect(link).toHaveAttribute('href', '/marketing/0xAAA');
  });

  it('has an info tooltip trigger', () => {
    renderWithTooltip(<TopMarketersLeaderboard rewards={[]} />);
    expect(screen.getByLabelText('Info about top marketers')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const rewards = [makeReward('0xAAA', 10, 1)];
    const { container } = renderWithTooltip(<TopMarketersLeaderboard rewards={rewards} />);
    await checkA11y(container);
  });
});
