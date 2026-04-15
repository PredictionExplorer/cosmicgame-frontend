import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { RewardBreakdown } from '../components/RewardBreakdown';

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

describe('RewardBreakdown', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<RewardBreakdown />);
    expect(screen.getByRole('heading', { name: 'Every Bid Earns You' })).toBeInTheDocument();
  });

  it('renders all four reward titles', () => {
    renderWithTooltip(<RewardBreakdown />);
    expect(screen.getByText('100 CST Tokens')).toBeInTheDocument();
    expect(screen.getByText('1 Raffle Ticket')).toBeInTheDocument();
    expect(screen.getByText('NFT Chance')).toBeInTheDocument();
    expect(screen.getByText('Main Prize')).toBeInTheDocument();
  });

  it('renders reward descriptions', () => {
    renderWithTooltip(<RewardBreakdown />);
    expect(screen.getByText(/Earn 100 Cosmic Signature Tokens/)).toBeInTheDocument();
    expect(screen.getByText(/earns a raffle ticket/)).toBeInTheDocument();
    expect(screen.getByText(/Win a unique COSMIC NFT/)).toBeInTheDocument();
    expect(screen.getByText(/25% of the entire round prize pool/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<RewardBreakdown />);
    await checkA11y(container);
  });
});
