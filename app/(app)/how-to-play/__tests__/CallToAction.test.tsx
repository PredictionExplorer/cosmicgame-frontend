import { render, screen, checkA11y } from '@/test-utils';

import { CallToAction } from '../components/CallToAction';

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

describe('CallToAction', () => {
  it('renders the CTA heading', () => {
    render(<CallToAction />);
    expect(screen.getByRole('heading', { name: 'Ready to Start Bidding?' })).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<CallToAction />);
    expect(screen.getByText(/Join the next round/)).toBeInTheDocument();
  });

  it('renders Start Playing Now link pointing to homepage', () => {
    render(<CallToAction />);
    const link = screen.getByRole('link', { name: 'Start Playing Now' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders Discord link with correct href', () => {
    render(<CallToAction />);
    const link = screen.getByRole('link', { name: /Discord/ });
    expect(link).toHaveAttribute('href', expect.stringContaining('discord.com'));
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders Twitter/X link with correct href', () => {
    render(<CallToAction />);
    const link = screen.getByRole('link', { name: /Twitter/ });
    expect(link).toHaveAttribute('href', expect.stringContaining('x.com'));
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CallToAction />);
    await checkA11y(container);
  });
});
