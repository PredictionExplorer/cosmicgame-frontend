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
    expect(screen.getByText('Bid Early, Bid Cheap')).toBeInTheDocument();
    expect(screen.getByText('Use Your Random Walk NFT')).toBeInTheDocument();
    expect(screen.getByText('Stack Raffle Tickets')).toBeInTheDocument();
    expect(screen.getByText('Use a Burner Wallet')).toBeInTheDocument();
    expect(screen.getByText('Watch the Timer')).toBeInTheDocument();
    expect(screen.getByText('Pay with CST')).toBeInTheDocument();
  });

  it('renders tip descriptions', () => {
    renderWithTooltip(<ProTips />);
    expect(screen.getByText(/Bid prices start low/)).toBeInTheDocument();
    expect(screen.getByText(/one-time 50% discount/)).toBeInTheDocument();
    expect(screen.getByText(/More bids means better odds/)).toBeInTheDocument();
    expect(screen.getByText(/smart contract is audited/)).toBeInTheDocument();
    expect(screen.getByText(/timer gains 1 hour per bid/)).toBeInTheDocument();
    expect(screen.getByText(/Already earned CST/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<ProTips />);
    await checkA11y(container);
  });
});
