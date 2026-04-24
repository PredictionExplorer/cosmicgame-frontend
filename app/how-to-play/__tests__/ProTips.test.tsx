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
    expect(screen.getByText('Pro Tips & Strategy')).toBeInTheDocument();
  });

  it('renders all six tip titles', () => {
    renderWithTooltip(<ProTips />);
    expect(screen.getByText('Gesture Early, Gesture Cheap')).toBeInTheDocument();
    expect(screen.getByText('Attach a Random Walk NFT')).toBeInTheDocument();
    expect(screen.getByText('Stack Stellar Selection Entries')).toBeInTheDocument();
    expect(screen.getByText('Use a Burner Wallet')).toBeInTheDocument();
    expect(screen.getByText('Watch the Finalization Time')).toBeInTheDocument();
    expect(screen.getByText('Gesture with CST')).toBeInTheDocument();
  });

  it('renders tip descriptions', () => {
    renderWithTooltip(<ProTips />);
    expect(screen.getByText(/Gesture Cost starts low/)).toBeInTheDocument();
    expect(screen.getByText(/one-time 50% cost reduction/)).toBeInTheDocument();
    expect(screen.getByText(/higher Selection frequency/)).toBeInTheDocument();
    expect(screen.getByText(/smart contract is formally verified/)).toBeInTheDocument();
    expect(screen.getByText(/Cycle Finalization Time gains/)).toBeInTheDocument();
    expect(screen.getByText(/Already imprinted CST/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<ProTips />);
    await checkA11y(container);
  });
});
