import userEvent from '@testing-library/user-event';

import type { FAQCategory } from '@/content/faq/types';
import { protocolFacts } from '@/content/protocol-facts';

import { render, screen, checkA11y, waitFor } from '@/test-utils';

import { FAQCategorySection } from '../components/FAQCategory';
import {
  answerParagraphs,
  enrichAnswer,
  foldForMatch,
  highlightMatches,
  matchesQuery,
} from '../components/answerText';

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
  it('keeps a Chinese question mark on the line of its last word', () => {
    // Regression: a wrapping question put "？" at the start of a line.
    const question = '可以复刻代码并搭建自己的网站吗？';
    renderFAQCategory({
      category: { ...mockCategory, items: [{ id: 'zh', question, answer: '可以。' }] },
    });
    // The glue adds no characters: the question reads as written.
    const trigger = screen.getByText(
      (_, element) => element?.tagName === 'BUTTON' && element.textContent === question,
    );
    expect(trigger.querySelector('.whitespace-nowrap')).toHaveTextContent('吗？');
  });

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
    // Named after its category, so the six toggles on the page read apart.
    const expand = screen.getByRole('button', { name: 'Expand all questions in Test Category' });
    expect(expand).toHaveTextContent('Expand all');
    // The label says what a press does; aria-expanded would say the state again.
    expect(expand).not.toHaveAttribute('aria-expanded');
    await user.click(expand);
    expect(onExpandAll).toHaveBeenCalledWith('test-cat');
    unmount();

    renderFAQCategory({ expandedItems: ['q1', 'q2', 'q3'] });
    expect(
      screen.getByRole('button', { name: 'Collapse all questions in Test Category' }),
    ).toHaveTextContent('Collapse all');
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
    const trigger = screen.getByRole('button', { name: 'How does Anchoring work?' });
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
    expect(screen.getByRole('button', { name: 'How does Anchoring work?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('finds a curly apostrophe from a typed one, and highlights it (V073)', () => {
    const category: FAQCategory = {
      ...mockCategory,
      items: [{ id: 'nfts', question: 'Can I take part if I don’t own NFTs?', answer: 'Yes.' }],
    };
    renderFAQCategory({ category, searchQuery: "don't" });
    expect(document.querySelector('mark')).toHaveTextContent('don’t');
  });

  it('keeps a highlighted question one inline run inside its flex trigger', () => {
    renderFAQCategory({ searchQuery: 'Anchoring' });
    const trigger = screen.getByRole('button', { name: 'How does Anchoring work?' });
    // The trigger is a flex row: a bare <mark> would become its own flex item,
    // pushed apart from the rest of the question and read as a separate word.
    const items = Array.from(trigger.children).filter((child) => child.tagName !== 'svg');
    expect(items).toHaveLength(1);
    expect(items[0]?.querySelector('mark')).toHaveTextContent('Anchoring');
    expect(items[0]).toHaveTextContent('How does Anchoring work?');
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

  it('names each copy link after its question and announces the copy outside it', async () => {
    const user = userEvent.setup();
    renderFAQCategory({ expandedItems: ['q1'] });
    const copy = screen.getByRole('button', {
      name: 'Copy link to “What is a Calibration Window?”',
    });
    expect(copy).toHaveTextContent('Copy link');
    // The status region is not inside the button, whose name overrides its text.
    const status = screen.getByTestId('faq-copy-status');
    expect(status).toHaveAttribute('role', 'status');
    expect(copy).not.toContainElement(status);
    expect(status).toBeEmptyDOMElement();

    await user.click(copy);
    await waitFor(() => expect(status).toHaveTextContent('Link copied'));
    expect(copy).toHaveTextContent('Copied');
  });

  it('sets a long answer as paragraphs, explaining each term once per answer (V235)', () => {
    const category: FAQCategory = {
      ...mockCategory,
      items: [
        {
          id: 'long',
          question: 'How does a Calibration Window work?',
          answer:
            'A Calibration Window descends the cost.\n\nEvery Calibration Window ends at its floor.',
        },
      ],
    };
    renderFAQCategory({ category, expandedItems: ['long'] });
    const paragraphs = body('long')!.querySelectorAll('p.type-prose');
    expect(paragraphs).toHaveLength(2);
    expect(body('long')!.querySelectorAll('[data-term="calibrationWindow"]')).toHaveLength(1);
  });

  it('marks a search match inside any paragraph', () => {
    const category: FAQCategory = {
      ...mockCategory,
      items: [{ id: 'long', question: 'Q?', answer: 'First part.\n\nThe floor is zero.' }],
    };
    renderFAQCategory({ category, searchQuery: 'floor' });
    expect(
      body('long')!.querySelectorAll('p.type-prose')[1]!.querySelector('mark'),
    ).toHaveTextContent('floor');
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

describe('answerParagraphs', () => {
  it('splits on blank lines and drops empty ones', () => {
    expect(answerParagraphs('One.\n\nTwo.\n\n\nThree.')).toEqual(['One.', 'Two.', 'Three.']);
    expect(answerParagraphs('Only one.')).toEqual(['Only one.']);
  });
});

describe('the FAQ search matcher (V073)', () => {
  it('folds typographic quotes to the ones a keyboard types', () => {
    expect(matchesQuery('Can I take part if I don’t own NFTs?', "don't")).toBe(true);
    expect(matchesQuery('the protocol’s security', "PROTOCOL'S")).toBe(true);
    expect(matchesQuery('“Final Gesture”', '"final gesture"')).toBe(true);
  });

  it('folds full-width and no-break forms, as Japanese and Chinese input types them', () => {
    expect(matchesQuery('1,000 CSTを受け取ります', 'ＣＳＴ')).toBe(true);
    expect(matchesQuery('1,000 CST', '1,000 cst')).toBe(true);
    expect(foldForMatch('ＣＳＴ')).toBe('cst');
  });

  it('meets a composed letter with a typed base and combining mark', () => {
    expect(matchesQuery('Hàng hóa công', 'hóa')).toBe(true);
  });

  it('ignores authored phrase breaks inside a match', () => {
    expect(matchesQuery('公共​物品', '公共物品')).toBe(true);
  });

  it('matches nothing for an empty query', () => {
    expect(matchesQuery('anything', '   ')).toBe(false);
  });

  it('marks the text as written wherever the folded match lands', () => {
    render(<p>{highlightMatches('Don’t wait: don’t miss it', "don't")}</p>);
    const marks = Array.from(document.querySelectorAll('mark')).map((mark) => mark.textContent);
    expect(marks).toEqual(['Don’t', 'don’t']);
    expect(document.querySelector('p')).toHaveTextContent('Don’t wait: don’t miss it');
  });

  it('marks a full-width query in Japanese copy', () => {
    render(<p>{highlightMatches('参加CSTを刻印します', 'ＣＳＴ')}</p>);
    expect(document.querySelector('mark')).toHaveTextContent('CST');
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
