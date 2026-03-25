import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { CategoryNav } from '../components/CategoryNav';
import { faqCategories } from '../data/faq-data';

describe('CategoryNav', () => {
  const onCategoryClick = jest.fn();

  beforeEach(() => {
    onCategoryClick.mockClear();
    window.scrollTo = jest.fn();
  });

  it('renders "All" button', () => {
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory={null}
        onCategoryClick={onCategoryClick}
      />,
    );
    expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument();
  });

  it('renders a button for each category', () => {
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory={null}
        onCategoryClick={onCategoryClick}
      />,
    );
    for (const cat of faqCategories) {
      expect(screen.getByRole('button', { name: new RegExp(cat.title, 'i') })).toBeInTheDocument();
    }
  });

  it('shows question count for each category', () => {
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory={null}
        onCategoryClick={onCategoryClick}
      />,
    );
    const gettingStarted = faqCategories.find((c) => c.id === 'getting-started');
    expect(gettingStarted).toBeDefined();
    expect(screen.getByText(String(gettingStarted!.items.length))).toBeInTheDocument();
  });

  it('highlights active category', () => {
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory="prizes-and-rewards"
        onCategoryClick={onCategoryClick}
      />,
    );
    const prizesButton = screen.getByRole('button', { name: /Prizes & Rewards/i });
    expect(prizesButton).toHaveClass('text-primary');
  });

  it('highlights "All" when activeCategory is null', () => {
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory={null}
        onCategoryClick={onCategoryClick}
      />,
    );
    const allButton = screen.getByRole('button', { name: /All/i });
    expect(allButton).toHaveClass('text-primary');
  });

  it('calls onCategoryClick(null) when "All" clicked', async () => {
    const user = userEvent.setup();
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory="getting-started"
        onCategoryClick={onCategoryClick}
      />,
    );
    const allButton = screen.getByRole('button', { name: /All/i });
    await user.click(allButton);
    expect(onCategoryClick).toHaveBeenCalledTimes(1);
    expect(onCategoryClick).toHaveBeenCalledWith(null);
  });

  it('calls onCategoryClick(categoryId) when category clicked', async () => {
    const user = userEvent.setup();
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory={null}
        onCategoryClick={onCategoryClick}
      />,
    );
    const gameMechanicsButton = screen.getByRole('button', { name: /Game Mechanics/i });
    await user.click(gameMechanicsButton);
    expect(onCategoryClick).toHaveBeenCalledTimes(1);
    expect(onCategoryClick).toHaveBeenCalledWith('game-mechanics');
  });

  it('has correct aria-label on nav', () => {
    render(
      <CategoryNav
        categories={faqCategories}
        activeCategory={null}
        onCategoryClick={onCategoryClick}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'FAQ categories' });
    expect(nav).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CategoryNav
        categories={faqCategories}
        activeCategory={null}
        onCategoryClick={onCategoryClick}
      />,
    );
    await checkA11y(container);
  });
});
