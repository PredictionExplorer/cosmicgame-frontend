import { render, screen, checkA11y } from '@/test-utils';

import { HeroSection } from '../components/HeroSection';

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

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe('HeroSection', () => {
  it('renders the main heading', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bid. Compete. Win Big.');
  });

  it('renders the tagline', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Outsmart other players/)).toBeInTheDocument();
  });

  it('renders the strategy badge', () => {
    render(<HeroSection />);
    expect(screen.getByText('Strategy Bidding Game')).toBeInTheDocument();
  });

  it('renders Start Playing link pointing to homepage', () => {
    render(<HeroSection />);
    const link = screen.getByRole('link', { name: 'Start Playing' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders Learn More link pointing to game overview section', () => {
    render(<HeroSection />);
    const link = screen.getByRole('link', { name: 'Learn More' });
    expect(link).toHaveAttribute('href', '#game-overview');
  });

  it('has the correct aria-labelledby on the section', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-labelledby', 'hero-heading');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HeroSection />);
    await checkA11y(container);
  });
});
