import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { GameOverview } from '../components/GameOverview';

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

describe('GameOverview', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<GameOverview />);
    expect(screen.getByRole('heading', { name: 'How It Works' })).toBeInTheDocument();
  });

  it('renders all three card titles', () => {
    renderWithTooltip(<GameOverview />);
    expect(screen.getByText('Gesture')).toBeInTheDocument();
    expect(screen.getByText('Endure')).toBeInTheDocument();
    expect(screen.getByText('Receive')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    renderWithTooltip(<GameOverview />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('renders card descriptions', () => {
    renderWithTooltip(<GameOverview />);
    expect(screen.getByText(/Make a gesture with ETH or CST/)).toBeInTheDocument();
    expect(screen.getByText(/Cycle Finalization Time expires/)).toBeInTheDocument();
    expect(
      screen.getByText(/Participate in allocations when the cycle finalizes/),
    ).toBeInTheDocument();
  });

  it('has the correct section id for anchor linking', () => {
    const { container } = renderWithTooltip(<GameOverview />);
    expect(container.querySelector('#game-overview')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<GameOverview />);
    await checkA11y(container);
  });
});
