import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { GameCycle } from '../components/GameCycle';

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
  };
});

const renderWithTooltip = (ui: React.ReactElement) =>
  render(<TooltipProvider>{ui}</TooltipProvider>);

describe('GameCycle', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<GameCycle />);
    expect(screen.getByRole('heading', { name: 'Lifecycle of a Round' })).toBeInTheDocument();
  });

  it('renders all six phase labels in order', () => {
    renderWithTooltip(<GameCycle />);
    expect(screen.getByText('Round Starts')).toBeInTheDocument();
    expect(screen.getByText('Players Bid')).toBeInTheDocument();
    expect(screen.getByText('Timer Expires')).toBeInTheDocument();
    expect(screen.getByText('Winner Collects')).toBeInTheDocument();
    expect(screen.getByText('Raffles Drawn')).toBeInTheDocument();
    expect(screen.getByText('New Round')).toBeInTheDocument();
  });

  it('renders phase numbers 01 through 06', () => {
    renderWithTooltip(<GameCycle />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('04')).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();
    expect(screen.getByText('06')).toBeInTheDocument();
  });

  it('renders phase descriptions', () => {
    renderWithTooltip(<GameCycle />);
    expect(screen.getByText(/24-hour countdown timer/)).toBeInTheDocument();
    expect(screen.getByText(/adds 1 hour to the timer/)).toBeInTheDocument();
    expect(screen.getByText(/countdown reaches zero/)).toBeInTheDocument();
    expect(screen.getByText(/25% of the prize pool/)).toBeInTheDocument();
    expect(screen.getByText(/4 raffle winners share/)).toBeInTheDocument();
    expect(screen.getByText(/bid price resets/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<GameCycle />);
    await checkA11y(container);
  });
});
