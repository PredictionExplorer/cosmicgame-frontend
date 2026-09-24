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
    expect(links[0]).toHaveTextContent('What is Cosmic Signature?');
    expect(links[1]).toHaveAttribute('href', '#main-allocation');
  });

  it('names each question’s category', () => {
    render(<PopularQuestions content={faqContentEn} onQuestionClick={onQuestionClick} />);
    expect(screen.getByText('Getting started')).toBeInTheDocument();
    expect(screen.getAllByText('Allocations & distributions')).toHaveLength(3);
  });

  it('opens the answer in place instead of jumping', async () => {
    const user = userEvent.setup();
    render(<PopularQuestions content={faqContentEn} onQuestionClick={onQuestionClick} />);
    await user.click(screen.getByRole('link', { name: /What is Cosmic Signature\?/ }));
    expect(onQuestionClick).toHaveBeenCalledWith('what-is-cosmic-signature', 'getting-started');
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
