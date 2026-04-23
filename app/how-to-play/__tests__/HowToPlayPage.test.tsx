import { render, screen, checkA11y } from '@/test-utils';

import HowToPlayPage from '../HowToPlayPage';

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

describe('HowToPlayPage', () => {
  it('renders the hero section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Gesture\. Shape\./);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Sign the cycle/);
  });

  it('renders the game overview section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('renders the reward breakdown section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Every gesture imprints value')).toBeInTheDocument();
  });

  it('renders the game cycle section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Lifecycle of a cycle')).toBeInTheDocument();
  });

  it('renders the step-by-step section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders the pro tips section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Pro Tips & Strategy')).toBeInTheDocument();
  });

  it('renders the FAQ callout section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Have Questions?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse FAQ/i })).toHaveAttribute('href', '/faq');
  });

  it('renders the CTA section', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Ready to make a gesture?')).toBeInTheDocument();
  });

  it('has correct heading hierarchy with all section headings', () => {
    render(<HowToPlayPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(7);
  });

  it('renders section dividers between sections', () => {
    const { container } = render(<HowToPlayPage />);
    const dividers = container.querySelectorAll('[class*="bg-gradient-to-r"]');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HowToPlayPage />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
