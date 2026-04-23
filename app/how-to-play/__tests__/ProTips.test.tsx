import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { ProTips } from '../components/ProTips';

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

describe('ProTips', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<ProTips />);
    expect(screen.getByRole('heading', { name: 'Pro Tips & Strategy' })).toBeInTheDocument();
  });

  it('renders all six tip titles', () => {
    renderWithTooltip(<ProTips />);
    expect(screen.getByText('Gesture early, lower cost')).toBeInTheDocument();
    expect(screen.getByText('Attach your Random Walk NFT')).toBeInTheDocument();
    expect(screen.getByText('Increase selection frequency')).toBeInTheDocument();
    expect(screen.getByText('Use a dedicated wallet')).toBeInTheDocument();
    expect(screen.getByText('Watch the Performance clock')).toBeInTheDocument();
    expect(screen.getByText('Pay with CST')).toBeInTheDocument();
  });

  it('renders tip descriptions', () => {
    renderWithTooltip(<ProTips />);
    expect(screen.getByText(/ETH gesture costs start near the calibration floor/)).toBeInTheDocument();
    expect(screen.getByText(/one-time 50% discount on ETH gesture cost/)).toBeInTheDocument();
    expect(screen.getByText(/More gestures in a cycle increase how often/)).toBeInTheDocument();
    expect(screen.getByText(/The contracts are audited/)).toBeInTheDocument();
    expect(screen.getByText(/Each gesture extends the clock/)).toBeInTheDocument();
    expect(screen.getByText(/Already received CST imprints/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<ProTips />);
    await checkA11y(container);
  });
});
