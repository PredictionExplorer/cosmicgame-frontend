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
    expect(
      screen.getByRole('heading', { name: 'Lifecycle of a Performance Cycle' }),
    ).toBeInTheDocument();
  });

  it('renders all six phase labels in order', () => {
    renderWithTooltip(<GameCycle />);
    expect(screen.getByText('Cycle Opens')).toBeInTheDocument();
    expect(screen.getByText('Participants Gesture')).toBeInTheDocument();
    expect(screen.getByText('Cycle Finalization Time Expires')).toBeInTheDocument();
    expect(screen.getByText('Cycle Finalizes')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selections')).toBeInTheDocument();
    expect(screen.getByText('Next Cycle')).toBeInTheDocument();
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
    expect(screen.getByText(/Calibration Window opens/)).toBeInTheDocument();
    expect(screen.getByText(/adds ~1 hour to the Cycle Finalization Time/)).toBeInTheDocument();
    expect(screen.getByText(/countdown reaches zero, the cycle closes/)).toBeInTheDocument();
    expect(screen.getByText(/25% of the Cycle Reserve/)).toBeInTheDocument();
    expect(screen.getByText(/Three ETH Stellar Selection recipients/)).toBeInTheDocument();
    expect(screen.getByText(/Cycle Reserve rolls forward/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<GameCycle />);
    await checkA11y(container);
  });
});
