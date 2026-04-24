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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Gesture. Endure. Shape the Signature.',
    );
  });

  it('renders the tagline', () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/Participants make gestures during a Performance Cycle/),
    ).toBeInTheDocument();
  });

  it('renders the protocol badge', () => {
    render(<HeroSection />);
    expect(screen.getByText('Procedural On-Chain Art Protocol')).toBeInTheDocument();
  });

  it('renders Open the Protocol link pointing to homepage', () => {
    render(<HeroSection />);
    const link = screen.getByRole('link', { name: 'Open the Protocol' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders Learn More link pointing to game overview section', () => {
    render(<HeroSection />);
    const link = screen.getByRole('link', { name: 'Learn More' });
    expect(link).toHaveAttribute('href', '#protocol-overview');
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
