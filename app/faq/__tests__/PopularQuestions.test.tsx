import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { PopularQuestions } from '../components/PopularQuestions';

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

describe('PopularQuestions', () => {
  const onQuestionClick = jest.fn();

  beforeEach(() => {
    onQuestionClick.mockClear();
  });

  it('renders "Popular Questions" heading', () => {
    render(<PopularQuestions onQuestionClick={onQuestionClick} />);
    const heading = screen.getByRole('heading', { name: 'Popular Questions' });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders 4 question cards', () => {
    render(<PopularQuestions onQuestionClick={onQuestionClick} />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(4);
  });

  it('renders correct question text for each card', () => {
    render(<PopularQuestions onQuestionClick={onQuestionClick} />);
    expect(screen.getByText('What is Cosmic Signature?')).toBeInTheDocument();
    expect(screen.getByText('What is the Signature Allocation?')).toBeInTheDocument();
    expect(screen.getByText('How does Stellar Selection work?')).toBeInTheDocument();
    expect(screen.getByText('How does Anchoring work?')).toBeInTheDocument();
  });

  it('shows category label on each card', () => {
    render(<PopularQuestions onQuestionClick={onQuestionClick} />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getAllByText('Allocations & Distributions')).toHaveLength(3);
  });

  it('calls onQuestionClick with correct arguments when clicked', async () => {
    const user = userEvent.setup();
    render(<PopularQuestions onQuestionClick={onQuestionClick} />);
    const cosmicSignatureCard = screen.getByRole('button', {
      name: /What is Cosmic Signature\?/i,
    });
    await user.click(cosmicSignatureCard);
    expect(onQuestionClick).toHaveBeenCalledTimes(1);
    expect(onQuestionClick).toHaveBeenCalledWith('what-is-cosmic-signature', 'getting-started');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PopularQuestions onQuestionClick={onQuestionClick} className="custom-class" />,
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PopularQuestions onQuestionClick={onQuestionClick} />);
    await checkA11y(container);
  });
});
