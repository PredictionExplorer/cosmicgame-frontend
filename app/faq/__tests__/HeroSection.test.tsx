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

jest.mock('../components/FAQSearch', () => ({
  FAQSearch: (props: Record<string, unknown>) => (
    <div data-testid="faq-search" data-value={props.value} />
  ),
}));

describe('HeroSection', () => {
  const defaultProps = {
    searchValue: '',
    onSearchChange: jest.fn(),
    resultCount: 0,
    totalCount: 50,
    categoryCount: 8,
  };

  it('renders the heading', () => {
    render(<HeroSection {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: /Frequently Asked Questions/i }),
    ).toBeInTheDocument();
  });

  it('renders "Knowledge Base" badge', () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
  });

  it('renders the subtitle text', () => {
    render(<HeroSection {...defaultProps} />);
    expect(
      screen.getByText(
        /Everything you need to know about Cosmic Signature — from getting started to advanced game mechanics\./,
      ),
    ).toBeInTheDocument();
  });

  it('displays total count in stats', () => {
    render(<HeroSection {...defaultProps} totalCount={100} />);
    expect(screen.getByText('100+ Answers')).toBeInTheDocument();
  });

  it('displays category count in stats', () => {
    render(<HeroSection {...defaultProps} categoryCount={12} />);
    expect(screen.getByText('12 Categories')).toBeInTheDocument();
  });

  it('renders "Always Updated" text', () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText('Always Updated')).toBeInTheDocument();
  });

  it('passes search props through to FAQSearch', () => {
    render(<HeroSection {...defaultProps} searchValue="wallet" resultCount={3} totalCount={50} />);
    const faqSearch = screen.getByTestId('faq-search');
    expect(faqSearch).toHaveAttribute('data-value', 'wallet');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    await checkA11y(container);
  });
});
