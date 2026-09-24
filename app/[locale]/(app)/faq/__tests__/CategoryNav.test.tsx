import userEvent from '@testing-library/user-event';
import { BookA, Rocket } from 'lucide-react';

import { render, screen, checkA11y } from '@/test-utils';

import { CategoryNav, categoryAnchor, type CategoryNavEntry } from '../components/CategoryNav';

const entries: CategoryNavEntry[] = [
  { id: 'getting-started', label: 'Getting Started', count: 8, icon: Rocket },
  { id: 'game-mechanics', label: 'Cycle Mechanics', count: 14, icon: Rocket },
  { id: 'glossary', label: 'Glossary', icon: BookA },
];

function renderNav(activeId: string | null = null, onSelect = jest.fn()) {
  render(<CategoryNav entries={entries} activeId={activeId} onSelect={onSelect} />);
  return onSelect;
}

describe('CategoryNav', () => {
  it('is one labelled navigation landmark', () => {
    renderNav();
    expect(screen.getAllByRole('navigation', { name: 'FAQ categories' })).toHaveLength(1);
  });

  it('rides above the sections that scroll under it', () => {
    renderNav();
    // A bare `z-sticky-nav` generates no CSS, and the category headers' buttons
    // then painted over the bar.
    expect(screen.getByRole('navigation', { name: 'FAQ categories' })).toHaveClass(
      'sticky',
      'z-[var(--z-sticky-nav)]',
    );
  });

  it('links every category and the glossary to its section', () => {
    renderNav();
    for (const entry of entries) {
      expect(screen.getByRole('link', { name: new RegExp(entry.label) })).toHaveAttribute(
        'href',
        `#${categoryAnchor(entry.id)}`,
      );
    }
  });

  it('shows how many questions each category holds', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /Getting Started/ })).toHaveTextContent('8');
    expect(screen.getByRole('link', { name: /Glossary/ })).not.toHaveTextContent(/\d/);
  });

  it('marks the section being read', () => {
    renderNav('game-mechanics');
    expect(screen.getByRole('link', { name: /Cycle Mechanics/ })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('link', { name: /Getting Started/ })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('hands the choice to the page instead of jumping', async () => {
    const user = userEvent.setup();
    const onSelect = renderNav();
    await user.click(screen.getByRole('link', { name: /Cycle Mechanics/ }));
    expect(onSelect).toHaveBeenCalledWith('game-mechanics');
  });

  it('has no accessibility violations', async () => {
    renderNav('getting-started');
    await checkA11y(document.body);
  });
});
