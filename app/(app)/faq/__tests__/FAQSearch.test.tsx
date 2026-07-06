import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { FAQSearch } from '../components/FAQSearch';

function FAQSearchWrapper({ onChange }: { onChange: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <FAQSearch
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe('FAQSearch', () => {
  it('renders search input with correct placeholder', () => {
    render(<FAQSearch value="" onChange={jest.fn()} />);
    const input = screen.getByPlaceholderText('Search questions...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-label', 'Search frequently asked questions');
  });

  it('renders keyboard shortcut hint when empty', () => {
    render(<FAQSearch value="" onChange={jest.fn()} />);
    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('shows clear button when value is non-empty', () => {
    render(<FAQSearch value="test" onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('hides keyboard shortcut when filtering', () => {
    render(<FAQSearch value="test" onChange={jest.fn()} />);
    expect(screen.queryByText('⌘')).not.toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<FAQSearchWrapper onChange={onChange} />);
    const input = screen.getByPlaceholderText('Search questions...');
    await user.type(input, 'test');
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenNthCalledWith(1, 't');
    expect(onChange).toHaveBeenNthCalledWith(2, 'te');
    expect(onChange).toHaveBeenNthCalledWith(3, 'tes');
    expect(onChange).toHaveBeenNthCalledWith(4, 'test');
  });

  it('calls onChange when clear button clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<FAQSearch value="test" onChange={onChange} />);
    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows result count when filtering', () => {
    render(<FAQSearch value="test" onChange={jest.fn()} resultCount={5} totalCount={20} />);
    expect(screen.getByText('Showing 5 of 20 questions')).toBeInTheDocument();
  });

  it('shows "No questions found" message when resultCount is 0', () => {
    render(<FAQSearch value="test" onChange={jest.fn()} resultCount={0} totalCount={20} />);
    expect(
      screen.getByText('No questions found. Try a different search term.'),
    ).toBeInTheDocument();
  });

  it('does not show result count when not filtering', () => {
    render(<FAQSearch value="" onChange={jest.fn()} resultCount={5} totalCount={20} />);
    expect(screen.queryByText('Showing 5 of 20 questions')).not.toBeInTheDocument();
  });

  it('focuses input on Cmd+K', () => {
    render(<FAQSearch value="" onChange={jest.fn()} />);
    const input = screen.getByPlaceholderText('Search questions...');
    expect(document.activeElement).not.toBe(input);

    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    document.dispatchEvent(event);

    expect(document.activeElement).toBe(input);
  });

  it('focuses input on Ctrl+K', () => {
    render(<FAQSearch value="" onChange={jest.fn()} />);
    const input = screen.getByPlaceholderText('Search questions...');
    expect(document.activeElement).not.toBe(input);

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    document.dispatchEvent(event);

    expect(document.activeElement).toBe(input);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FAQSearch value="" onChange={jest.fn()} />);
    await checkA11y(container);
  });
});
