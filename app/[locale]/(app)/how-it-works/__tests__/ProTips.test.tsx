import { howItWorksContentEn } from '@/content/how-it-works';

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

const proTips = howItWorksContentEn.proTips;

describe('ProTips', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<ProTips proTips={proTips} />);
    expect(screen.getByText('Pro Tips & Strategy')).toBeInTheDocument();
  });

  it('renders all six tip titles', () => {
    renderWithTooltip(<ProTips proTips={proTips} />);
    expect(screen.getByText('Watch Both Calibration Windows')).toBeInTheDocument();
    expect(screen.getByText('Attach a Random Walk NFT')).toBeInTheDocument();
    expect(screen.getByText('Stack Stellar Selection Entries')).toBeInTheDocument();
    expect(screen.getByText('Use a Burner Wallet')).toBeInTheDocument();
    expect(screen.getByText('Watch the Finalization Time')).toBeInTheDocument();
    expect(screen.getByText('Gesture with CST')).toBeInTheDocument();
  });

  it('renders every tip description from the content module', () => {
    renderWithTooltip(<ProTips proTips={proTips} />);
    for (const tip of proTips.tips) {
      expect(screen.getByText(tip.description)).toBeInTheDocument();
    }
    expect(screen.getByText(/one-time 50% ETH Gesture Cost reduction/)).toBeInTheDocument();
    expect(
      screen.getByText(/smart contracts are publicly source-verified on-chain/),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<ProTips proTips={proTips} />);
    await checkA11y(container);
  });
});
