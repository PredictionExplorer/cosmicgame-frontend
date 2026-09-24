import userEvent from '@testing-library/user-event';

import { faqContentEn } from '@/content/faq';

import { GLOSSARY_TERM_IDS } from '@/lib/glossary';

import { render, screen, checkA11y, waitFor, within } from '@/test-utils';

import FAQPage from '../FAQPage';

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

const scrollIntoView = jest.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  window.matchMedia =
    window.matchMedia ??
    ((query: string) =>
      ({ matches: false, media: query, addEventListener: jest.fn() }) as unknown as MediaQueryList);
  window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  };
  window.history.replaceState(null, '', '/faq');
});

const searchbox = () =>
  screen.getByRole('searchbox', { name: /search frequently asked questions/i });

describe('FAQPage', () => {
  it('renders the hero heading', () => {
    render(<FAQPage content={faqContentEn} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature FAQ' }),
    ).toBeInTheDocument();
  });

  it('renders every category as an H2 section', () => {
    render(<FAQPage content={faqContentEn} />);
    for (const category of faqContentEn.categories) {
      expect(screen.getByRole('heading', { level: 2, name: category.title })).toBeInTheDocument();
    }
  });

  it('starts with every answer closed (F013)', () => {
    render(<FAQPage content={faqContentEn} />);
    const questions = screen
      .getAllByRole('button', { expanded: false })
      .filter((button) => button.hasAttribute('aria-controls'));
    expect(questions).toHaveLength(
      faqContentEn.categories.reduce((sum, category) => sum + category.items.length, 0),
    );
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
  });

  it('lists the categories and the glossary in its contents', () => {
    render(<FAQPage content={faqContentEn} />);
    const nav = screen.getByRole('navigation', { name: 'FAQ categories' });
    expect(nav.querySelectorAll('a')).toHaveLength(faqContentEn.categories.length + 1);
    expect(screen.getByRole('link', { name: /^Glossary/ })).toHaveAttribute(
      'href',
      '#faq-category-glossary',
    );
  });

  it('defines every glossary term on the page', () => {
    render(<FAQPage content={faqContentEn} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Glossary' })).toBeInTheDocument();
    for (const id of GLOSSARY_TERM_IDS) {
      expect(document.getElementById(`glossary-${id}`)).toBeInTheDocument();
    }
  });

  it('opens a popular question’s answer in place, scrolls to it and moves focus there (D289)', async () => {
    const user = userEvent.setup();
    render(<FAQPage content={faqContentEn} />);
    await user.click(screen.getByRole('link', { name: /How do I get ETH on Arbitrum\?/ }));

    const question = screen.getByRole('button', {
      name: 'How do I get ETH on Arbitrum?',
      expanded: true,
    });
    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(
      document.getElementById('how-to-get-eth-on-arbitrum'),
    );
    // The next Tab continues from the opened question, and its link is in the address bar.
    expect(question).toHaveFocus();
    expect(window.location.hash).toBe('#how-to-get-eth-on-arbitrum');
  });

  it('moves focus to the category a contents entry jumps to (D289)', async () => {
    const user = userEvent.setup();
    render(<FAQPage content={faqContentEn} />);
    const nav = screen.getByRole('navigation', { name: 'FAQ categories' });
    const category = faqContentEn.categories[2]!;
    await user.click(within(nav).getByRole('link', { name: new RegExp(category.title) }));

    const heading = screen.getByRole('heading', { level: 2, name: category.title });
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(window.location.hash).toBe(`#faq-category-${category.id}`);
  });

  it('opens the answer a shared link points at', () => {
    window.history.replaceState(null, '', '/faq#main-allocation');
    render(<FAQPage content={faqContentEn} />);
    expect(
      screen.getByRole('button', { name: 'What is the Signature Allocation?', expanded: true }),
    ).toBeInTheDocument();
  });

  it('shows a deep-linked question even when a search would hide it', async () => {
    const user = userEvent.setup();
    render(<FAQPage content={faqContentEn} />);
    await user.type(searchbox(), 'Endurance Champion');
    await screen.findByText(/Showing \d+ of \d+ questions/i, {}, { timeout: 10_000 });
    expect(
      screen.queryByRole('button', { name: 'What is the Signature Allocation?' }),
    ).not.toBeInTheDocument();

    // A same-page link to another question (hashchange, no reload).
    window.history.pushState(null, '', '/faq#main-allocation');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(
      await screen.findByRole('button', {
        name: 'What is the Signature Allocation?',
        expanded: true,
      }),
    ).toBeInTheDocument();
    expect(searchbox()).toHaveValue('');
  }, 30_000);

  it('filters questions when searching and hides the index', async () => {
    const user = userEvent.setup();
    render(<FAQPage content={faqContentEn} />);
    expect(screen.getByText('Popular questions')).toBeInTheDocument();

    await user.type(searchbox(), 'Endurance Champion');
    await screen.findByText(/Showing \d+ of \d+ questions/i, {}, { timeout: 10_000 });
    await waitFor(() => expect(screen.queryByText('Popular questions')).not.toBeInTheDocument());
    expect(screen.queryByRole('navigation', { name: 'FAQ categories' })).not.toBeInTheDocument();
  }, 30_000);

  it('offers to clear a search that matches nothing', async () => {
    const user = userEvent.setup();
    render(<FAQPage content={faqContentEn} />);
    await user.type(searchbox(), 'xyznonexistentquestion123');

    const clear = await screen.findByRole(
      'button',
      { name: 'Clear the search' },
      { timeout: 10_000 },
    );
    await user.click(clear);
    await waitFor(() => expect(searchbox()).toHaveValue(''), { timeout: 10_000 });
  }, 30_000);

  it('has no accessibility violations', async () => {
    const { container } = render(<FAQPage content={faqContentEn} />);
    await checkA11y(container, {
      rules: {
        'heading-order': { enabled: false },
        region: { enabled: false },
      },
    });
  });
});
