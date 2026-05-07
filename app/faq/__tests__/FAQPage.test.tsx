import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y, waitFor } from '@/test-utils';

import FAQPage from '../FAQPage';

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

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

beforeEach(() => {
  window.scrollTo = jest.fn();
  window.history.replaceState(null, '', '/faq');
});

describe('FAQPage', () => {
  it('renders the hero heading', () => {
    render(<FAQPage />);
    expect(
      screen.getByRole('heading', { name: /frequently asked questions/i }),
    ).toBeInTheDocument();
  });

  it('renders all 6 category sections', () => {
    render(<FAQPage />);
    const categoryHeadings = [
      'Getting Started',
      'Allocations & Distributions',
      'Cycle Mechanics',
      'Tokens & Cosmic Signatures',
      'Arbitrum & Technical',
      'Trust & Coordination',
    ];
    for (const title of categoryHeadings) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  it('renders the Popular Questions section', () => {
    render(<FAQPage />);
    expect(screen.getByText('Popular Questions')).toBeInTheDocument();
  });

  it('renders the contact CTA', () => {
    render(<FAQPage />);
    expect(screen.getByText('Still have a question?')).toBeInTheDocument();
  });

  it('renders category navigation with All button', () => {
    render(<FAQPage />);
    const nav = screen.getByRole('navigation', { name: /FAQ categories/i });
    expect(nav).toBeInTheDocument();
    const allButton = nav.querySelector('button');
    expect(allButton).toHaveTextContent('All');
  });

  it('renders the search input', () => {
    render(<FAQPage />);
    expect(
      screen.getByRole('textbox', { name: /search frequently asked questions/i }),
    ).toBeInTheDocument();
  });

  it('filters questions when searching', async () => {
    const user = userEvent.setup();
    render(<FAQPage />);

    const searchInput = screen.getByRole('textbox', {
      name: /search frequently asked questions/i,
    });
    await user.type(searchInput, 'Endurance Champion');

    await screen.findByText(/Showing \d+ of \d+ questions/i);
  }, 15_000);

  it('shows "No questions found" for nonsense search', async () => {
    const user = userEvent.setup();
    render(<FAQPage />);

    const searchInput = screen.getByRole('textbox', {
      name: /search frequently asked questions/i,
    });
    await user.type(searchInput, 'xyznonexistentquestion123');

    await waitFor(() => {
      expect(
        screen.getByText('No questions found. Try a different search term.'),
      ).toBeInTheDocument();
    });
  }, 15_000);

  it('hides popular questions and category nav when searching', async () => {
    const user = userEvent.setup();
    render(<FAQPage />);

    expect(screen.getByText('Popular Questions')).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox', {
      name: /search frequently asked questions/i,
    });
    await user.type(searchInput, 'anchoring'); // lexicon-allow-line

    await waitFor(() => {
      expect(screen.queryByText('Popular Questions')).not.toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FAQPage />);
    await checkA11y(container, {
      rules: {
        'heading-order': { enabled: false },
        region: { enabled: false },
      },
    });
  });
});
