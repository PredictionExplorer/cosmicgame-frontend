import { howItWorksContentEn } from '@/content/how-it-works';

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

const hero = howItWorksContentEn.hero;

describe('HeroSection', () => {
  it('renders the main heading', () => {
    render(<HeroSection hero={hero} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'How Cosmic Signature Works',
    );
  });

  it('renders the tagline', () => {
    render(<HeroSection hero={hero} />);
    expect(screen.getByText(hero.paragraph)).toBeInTheDocument();
    expect(
      screen.getByText(/Participants make gestures during a Performance Cycle/),
    ).toBeInTheDocument();
  });

  it('names the Learn section in the eyebrow without linking the hub to itself', () => {
    render(<HeroSection hero={hero} />);
    expect(screen.getByText('common.pageHeader.sections.learn')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'common.pageHeader.sections.learn' })).toBeNull();
  });

  it('accents the words the copy marks, without a separator added in code', () => {
    render(<HeroSection hero={hero} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.querySelector('.text-primary')).toHaveTextContent('Works');
    expect(heading.textContent).toBe('How Cosmic Signature Works');
  });

  it('renders the Make a Gesture link pointing to the Observatory', () => {
    render(<HeroSection hero={hero} />);
    const link = screen.getByRole('link', { name: 'Make a Gesture' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders Learn More link pointing to game overview section', () => {
    render(<HeroSection hero={hero} />);
    const link = screen.getByRole('link', { name: 'Learn More' });
    expect(link).toHaveAttribute('href', '#protocol-overview');
  });

  it('keeps the H1 id the page links to', () => {
    render(<HeroSection hero={hero} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'hero-heading');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HeroSection hero={hero} />);
    await checkA11y(container);
  });
});
