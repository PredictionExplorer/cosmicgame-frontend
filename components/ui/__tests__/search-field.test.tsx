import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { SearchField } from '@/components/ui/search-field';

import { checkA11y, fireEvent, render, screen } from '@/test-utils';

describe('SearchField', () => {
  it('is a 16px search input on phones with the icon above its fill', () => {
    const { container } = render(<SearchField aria-label="Search the FAQ" />);
    const input = screen.getByRole('searchbox', { name: 'Search the FAQ' });
    expect(input).toHaveClass('text-base', 'sm:text-sm');
    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('pointer-events-none', 'z-[1]');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows a clear button once there is text and clears back to focus', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <SearchField aria-label="Search" clearLabel="Clear search" onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();

    await user.type(input, 'cycle');
    expect(onValueChange).toHaveBeenLastCalledWith('cycle');

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(input).toHaveFocus();
  });

  it('works as a controlled field', () => {
    const onValueChange = jest.fn();
    render(<SearchField aria-label="Search" value="gesture" onValueChange={onValueChange} />);
    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(input).toHaveValue('gesture');
    fireEvent.change(input, { target: { value: 'gestures' } });
    expect(onValueChange).toHaveBeenCalledWith('gestures');
  });

  it('focuses from its ⌘ or Ctrl shortcut and announces it', () => {
    render(<SearchField aria-label="Search" shortcutKey="k" />);
    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(input).toHaveAttribute('aria-keyshortcuts', 'Meta+K Control+K');
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(input).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SearchField aria-label="Search" clearLabel="Clear" />);
    await checkA11y(container);
  });
});
