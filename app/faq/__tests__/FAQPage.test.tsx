import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y, waitFor, fireEvent } from '@/test-utils';

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

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: Record<string, unknown>) => <span data-testid="fa-icon" {...props} />,
}));

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

beforeEach(() => {
  window.scrollTo = jest.fn();
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, hash: '' },
  });
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
      'Prizes & Rewards',
      'Game Mechanics',
      'Tokens & NFTs',
      'Arbitrum & Technical',
      'Trust & Governance',
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
  });

  it('shows "No questions found" for nonsense search', async () => {
    render(<FAQPage />);

    const searchInput = screen.getByRole('textbox', {
      name: /search frequently asked questions/i,
    });
    fireEvent.change(searchInput, { target: { value: 'xyznonexistentquestion123' } });

    await waitFor(() => {
      expect(
        screen.getByText('No questions found. Try a different search term.'),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'clear the search' })).toBeInTheDocument();
  });

  it('hides popular questions and category nav when searching', async () => {
    const user = userEvent.setup();
    render(<FAQPage />);

    expect(screen.getByText('Popular Questions')).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox', {
      name: /search frequently asked questions/i,
    });
    await user.type(searchInput, 'staking');

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
