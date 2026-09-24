import userEvent from '@testing-library/user-event';

import { faqContentEn } from '@/content/faq';

import { render, screen, checkA11y, within } from '@/test-utils';

import { PopularQuestions } from '../components/PopularQuestions';

describe('PopularQuestions', () => {
  const onQuestionClick = jest.fn();

  beforeEach(() => {
    onQuestionClick.mockClear();
  });

  it('renders its heading as an H2', () => {
    render(<PopularQuestions content={faqContentEn} onQuestionClick={onQuestionClick} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Popular questions' }),
    ).toBeInTheDocument();
  });

  it('lists the four popular questions as links to their answers', () => {
    render(<PopularQuestions content={faqContentEn} onQuestionClick={onQuestionClick} />);
    const list = screen.getByRole('list');
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveTextContent('How does a Performance Cycle work?');
    expect(links[3]).toHaveAttribute('href', '#how-to-get-eth-on-arbitrum');
  });

  it('never repeats a question that opens its own category (D085)', () => {
    for (const id of faqContentEn.popularQuestionIds) {
      const category = faqContentEn.categories.find((entry) =>
        entry.items.some((item) => item.id === id),
      );
      expect(category?.items[0]?.id).not.toBe(id);
    }
  });

  it('names each question’s category', () => {
    render(<PopularQuestions content={faqContentEn} onQuestionClick={onQuestionClick} />);
    expect(screen.getByText('Getting started')).toBeInTheDocument();
    expect(screen.getAllByText('Allocations & distributions')).toHaveLength(2);
    expect(screen.getByText('Arbitrum & technical')).toBeInTheDocument();
  });

  it('opens the answer in place instead of jumping', async () => {
    const user = userEvent.setup();
    render(<PopularQuestions content={faqContentEn} onQuestionClick={onQuestionClick} />);
    await user.click(screen.getByRole('link', { name: /How does a Performance Cycle work\?/ }));
    // lexicon-allow-start — a legacy public URL fragment id.
    expect(onQuestionClick).toHaveBeenCalledWith(
      'how-does-the-bidding-game-work',
      'getting-started',
    );
    // lexicon-allow-end
  });

  it('applies a custom className', () => {
    render(
      <PopularQuestions
        content={faqContentEn}
        onQuestionClick={onQuestionClick}
        className="custom-class"
      />,
    );
    expect(screen.getByRole('region', { name: 'Popular questions' })).toHaveClass('custom-class');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PopularQuestions content={faqContentEn} onQuestionClick={onQuestionClick} />,
    );
    await checkA11y(container);
  });
});
