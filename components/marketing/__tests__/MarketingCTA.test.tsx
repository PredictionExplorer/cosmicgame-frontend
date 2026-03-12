import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { MarketingCTA } from '../MarketingCTA';

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

describe('MarketingCTA', () => {
  it('renders the heading', () => {
    renderWithTooltip(<MarketingCTA />);
    expect(screen.getByText('Ready to Start Earning?')).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithTooltip(<MarketingCTA />);
    expect(screen.getByText(/Join our marketing program/)).toBeInTheDocument();
  });

  it('renders the contact link', () => {
    renderWithTooltip(<MarketingCTA />);
    const link = screen.getByRole('link', { name: /contact marketing team/i });
    expect(link).toHaveAttribute('href', 'mailto:marketing@cosmicsignature.com');
  });

  it('has an info tooltip trigger', () => {
    renderWithTooltip(<MarketingCTA />);
    expect(screen.getByLabelText('Info about contacting the marketing team')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<MarketingCTA />);
    await checkA11y(container);
  });
});
