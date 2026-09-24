import userEvent from '@testing-library/user-event';

import type { FAQCategory } from '@/content/faq';
import { protocolFacts } from '@/content/protocol-facts';

import { render, screen, checkA11y } from '@/test-utils';

import { FAQCategorySection } from '../components/FAQCategory';
import { enrichAnswer } from '../components/answerText';

const mockCategory: FAQCategory = {
  id: 'test-cat',
  title: 'Test Category',
  description: 'Test description',
  icon: 'rocket',
  items: [
    {
      id: 'q1',
      question: 'What is a Calibration Window?',
      answer:
        'A Calibration Window descends the Gesture Cost over time. Every Calibration Window ends.',
    },
    {
      id: 'q2',
      question: 'How does Anchoring work?',
      answer: 'Anchoring pays a share of each cycle distribution.',
    },
    {
      id: 'q3',
      question: 'What is an Endurance Champion?',
      answer: 'The longest-interval most-recent gesture maker.',
      hashAnchor: 'endurance-champion',
    },
  ],
};

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

function renderFAQCategory(
  props: {
    category?: FAQCategory;
    searchQuery?: string;
    expandedItems?: string[];
    onItemToggle?: (categoryId: string, itemId: string) => void;
    onExpandAll?: (categoryId: string) => void;
  } = {},
) {
  const {
    category = mockCategory,
    searchQuery = '',
    expandedItems = [],
    onItemToggle = jest.fn(),
    onExpandAll = jest.fn(),
  } = props;
  return render(
    <FAQCategorySection
      category={category}
      searchQuery={searchQuery}
      expandedItems={expandedItems}
      onItemToggle={onItemToggle}
      onExpandAll={onExpandAll}
    />,
  );
}

/** The answer body of an item (Radix's collapsible content). */
const body = (anchor: string) =>
  document.getElementById(anchor)?.querySelector<HTMLElement>('[role="region"]') ?? null;

describe('FAQCategorySection', () => {
  it('renders the category heading and description', () => {
    renderFAQCategory();
    expect(screen.getByRole('heading', { level: 2, name: 'Test Category' })).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders every question as a disclosure button', () => {
    renderFAQCategory();
    for (const item of mockCategory.items) {
      expect(screen.getByRole('button', { name: item.question })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    }
  });

  it('keeps closed answers in the HTML but hidden until found (F013)', () => {
    const { container } = renderFAQCategory({ expandedItems: [] });

    // Crawlers still read every answer (ignoring the terms' own hidden definitions).
    const html = container.cloneNode(true) as HTMLElement;
    html.querySelectorAll('span[hidden]').forEach((node) => node.remove());
    expect(html).toHaveTextContent('Anchoring pays a share of each cycle distribution.');
    // A closed answer is out of the page: hidden until find-in-page reaches it.
    const closed = body('q2');
    expect(closed).toHaveAttribute('data-state', 'closed');
    expect(closed).toHaveAttribute('hidden', 'until-found');
  });

  it('shows an open answer and hides it again when it closes', () => {
    const { rerender } = renderFAQCategory({ expandedItems: ['q1'] });
    expect(body('q1')).toHaveAttribute('data-state', 'open');
    expect(body('q1')).not.toHaveAttribute('hidden');

    rerender(
      <FAQCategorySection
        category={mockCategory}
        searchQuery=""
        expandedItems={[]}
        onItemToggle={jest.fn()}
        onExpandAll={jest.fn()}
      />,
    );
    expect(body('q1')).toHaveAttribute('hidden', 'until-found');
  });

  it('opens the item when find-in-page reveals its answer', () => {
    const onItemToggle = jest.fn();
    renderFAQCategory({ onItemToggle });
    body('q2')!.dispatchEvent(new Event('beforematch'));
    expect(onItemToggle).toHaveBeenCalledWith('test-cat', 'q2');
  });

  it('calls onItemToggle when a question is clicked', async () => {
    const user = userEvent.setup();
    const onItemToggle = jest.fn();
    renderFAQCategory({ onItemToggle });
    await user.click(screen.getByRole('button', { name: 'What is a Calibration Window?' }));
    expect(onItemToggle).toHaveBeenCalledWith('test-cat', 'q1');
  });

  it('offers "Expand all", then "Collapse all" once every item is open', async () => {
    const user = userEvent.setup();
    const onExpandAll = jest.fn();
    const { unmount } = renderFAQCategory({ onExpandAll });
    await user.click(screen.getByRole('button', { name: 'Expand all questions' }));
    expect(onExpandAll).toHaveBeenCalledWith('test-cat');
    unmount();

    renderFAQCategory({ expandedItems: ['q1', 'q2', 'q3'] });
    expect(screen.getByRole('button', { name: 'Collapse all questions' })).toBeInTheDocument();
  });

  it('filters by the search and opens every matching answer, highlighted', () => {
    renderFAQCategory({ searchQuery: 'share' });
    expect(screen.queryByRole('button', { name: /Calibration Window/ })).not.toBeInTheDocument();
    // The match is in the answer only, so the answer is open.
    expect(body('q2')).toHaveAttribute('data-state', 'open');
    expect(document.querySelector('mark')).toHaveTextContent('share');
  });

  it('lets the reader close a matching answer during a search, until the query changes', async () => {
    const user = userEvent.setup();
    const onItemToggle = jest.fn();
    const { rerender } = renderFAQCategory({ searchQuery: 'Anchoring', onItemToggle });
    const trigger = screen.getByRole('button', { name: /How does Anchoring work\?/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(body('q2')).toHaveAttribute('hidden', 'until-found');
    // Closing during a search does not touch the reader's own open set.
    expect(onItemToggle).not.toHaveBeenCalled();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);

    // A new query opens every match again.
    rerender(
      <FAQCategorySection
        category={mockCategory}
        searchQuery="Anchoring pays"
        expandedItems={[]}
        onItemToggle={onItemToggle}
        onExpandAll={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /How does Anchoring work\?/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('renders nothing when the search matches nothing in this category', () => {
    const { container } = renderFAQCategory({ searchQuery: 'xyznonexistent' });
    expect(container.firstChild).toBeNull();
  });

  it('explains a coined term in place from the glossary, once per answer', () => {
    renderFAQCategory({ expandedItems: ['q1'] });
    const terms = body('q1')!.querySelectorAll('[data-term="calibrationWindow"]');
    expect(terms).toHaveLength(1);
    expect(terms[0]).toHaveAttribute('role', 'button');
  });

  it('offers a copy link inside an open answer', () => {
    renderFAQCategory({ expandedItems: ['q1'] });
    expect(
      screen.getAllByRole('button', { name: 'Copy link to this question' })[0],
    ).toHaveTextContent('Copy link');
  });

  it('keeps legacy ids for deep links', () => {
    renderFAQCategory();
    expect(document.getElementById('q1')).toBeInTheDocument();
    expect(document.getElementById('endurance-champion')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderFAQCategory({ expandedItems: ['q1'] });
    await checkA11y(container);
  });
});

describe('enrichAnswer', () => {
  const visibleText = () => {
    const copy = document.body.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('[hidden]').forEach((node) => node.remove());
    return copy.textContent;
  };

  it('marks a CJK term as a substring, only at its first use', () => {
    render(
      <p>
        {enrichAnswer('坚守冠军由坚守冠军规则确定。', [
          { term: '坚守冠军', definition: '连续保持最近落笔者身份时间最长的参与者。' },
        ])}
      </p>,
    );
    expect(visibleText()).toBe('坚守冠军由坚守冠军规则确定。');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('matches a Latin term only as a whole word', () => {
    render(<p>{enrichAnswer('CSTs are not CST.', [{ term: 'CST', definition: 'The token.' }])}</p>);
    const [trigger] = screen.getAllByRole('button');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(trigger).toHaveTextContent(/^CST$/);
    expect(visibleText()).toBe('CSTs are not CST.');
  });

  it('sets a quoted contract formula as code', () => {
    const formula = protocolFacts.dynamicCstRewardFormula;
    render(<p>{enrichAnswer(`It uses ${formula} today.`, [], [formula])}</p>);
    expect(document.querySelector('code')).toHaveTextContent(formula);
    expect(visibleText()).toBe(`It uses ${formula} today.`);
  });
});
