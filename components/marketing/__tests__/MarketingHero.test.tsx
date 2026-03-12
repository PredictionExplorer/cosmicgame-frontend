import { render, screen, checkA11y } from '@/test-utils';

import { MarketingHero } from '../MarketingHero';

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

describe('MarketingHero', () => {
  it('renders the headline', () => {
    render(<MarketingHero />);
    expect(screen.getByText(/Earn Rewards by/)).toBeInTheDocument();
    expect(screen.getByText(/Spreading the Word/)).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<MarketingHero />);
    expect(screen.getByText(/Promote Cosmic Signature/)).toBeInTheDocument();
  });

  it('renders the Learn How link pointing to #how-it-works', () => {
    render(<MarketingHero />);
    const link = screen.getByRole('link', { name: /learn how/i });
    expect(link).toHaveAttribute('href', '#how-it-works');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MarketingHero />);
    await checkA11y(container);
  });
});
