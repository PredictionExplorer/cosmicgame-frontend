import { render, screen, checkA11y } from '@/test-utils';

import { FAQCallout } from '../components/FAQCallout';

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
                custom: _c,
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

describe('FAQCallout', () => {
  it('renders the heading', () => {
    render(<FAQCallout />);
    expect(screen.getByRole('heading', { name: /Have Questions\?/i })).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<FAQCallout />);
    expect(screen.getByText(/comprehensive FAQ/i)).toBeInTheDocument();
  });

  it('renders a link to the FAQ page', () => {
    render(<FAQCallout />);
    const link = screen.getByRole('link', { name: /Browse FAQ/i });
    expect(link).toHaveAttribute('href', '/faq');
  });

  it('has the correct aria-labelledby', () => {
    render(<FAQCallout />);
    const section = screen.getByRole('heading', { name: /Have Questions\?/i }).closest('section');
    expect(section).toHaveAttribute('aria-labelledby', 'faq-callout-heading');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FAQCallout />);
    await checkA11y(container);
  });
});
