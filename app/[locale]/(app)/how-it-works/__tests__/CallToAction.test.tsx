import { howItWorksContentEn } from '@/content/how-it-works';

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

const callToAction = howItWorksContentEn.callToAction;

describe('CallToAction', () => {
  it('renders the CTA heading', () => {
    render(<CallToAction callToAction={callToAction} />);
    expect(
      screen.getByRole('heading', { name: 'Ready to Make Your First Gesture?' }),
    ).toBeInTheDocument();
  });

  it('renders the description text with a typographic apostrophe', () => {
    render(<CallToAction callToAction={callToAction} />);
    expect(screen.getByText(callToAction.body)).toBeInTheDocument();
    // Regression guard: the copy previously rendered a literal "\u2019"
    // because unicode escapes are not processed inside JSX text.
    expect(screen.getByText(/shaping the cycle’s Signature\./)).toBeInTheDocument();
    expect(screen.queryByText(/\\u2019/)).not.toBeInTheDocument();
  });

  it('renders Open the Protocol link pointing to homepage', () => {
    render(<CallToAction callToAction={callToAction} />);
    const link = screen.getByRole('link', { name: 'Open the Protocol' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders Discord link with correct href', () => {
    render(<CallToAction callToAction={callToAction} />);
    const link = screen.getByRole('link', { name: /Discord/ });
    expect(link).toHaveAttribute('href', expect.stringContaining('discord.com'));
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders Twitter/X link with correct href', () => {
    render(<CallToAction callToAction={callToAction} />);
    const link = screen.getByRole('link', { name: /Twitter/ });
    expect(link).toHaveAttribute('href', expect.stringContaining('x.com'));
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CallToAction callToAction={callToAction} />);
    await checkA11y(container);
  });
});
