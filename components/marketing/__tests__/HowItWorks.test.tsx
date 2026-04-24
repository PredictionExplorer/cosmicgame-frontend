import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { HowItWorks } from '../HowItWorks';

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

describe('HowItWorks', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<HowItWorks />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('renders all three steps', () => {
    renderWithTooltip(<HowItWorks />);
    expect(screen.getByText('Promote')).toBeInTheDocument();
    expect(screen.getByText('Get Verified')).toBeInTheDocument();
    expect(screen.getByText('Receive CST')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    renderWithTooltip(<HowItWorks />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    renderWithTooltip(<HowItWorks />);
    expect(screen.getByText(/Share Cosmic Signature/)).toBeInTheDocument();
    expect(screen.getByText(/reviews and verifies/)).toBeInTheDocument();
    expect(screen.getByText(/Receive CST token/)).toBeInTheDocument();
  });

  it('has an info tooltip for the section heading', () => {
    renderWithTooltip(<HowItWorks />);
    expect(screen.getByLabelText('Info about how it works')).toBeInTheDocument();
  });

  it('has info tooltips for each step', () => {
    renderWithTooltip(<HowItWorks />);
    expect(screen.getByLabelText('More info about Promote')).toBeInTheDocument();
    expect(screen.getByLabelText('More info about Get Verified')).toBeInTheDocument();
    expect(screen.getByLabelText('More info about Receive CST')).toBeInTheDocument();
  });

  it('has the correct section id for scroll linking', () => {
    const { container } = renderWithTooltip(<HowItWorks />);
    expect(container.querySelector('#how-it-works')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<HowItWorks />);
    await checkA11y(container);
  });
});
