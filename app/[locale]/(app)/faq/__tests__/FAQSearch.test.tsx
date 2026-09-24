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

const input = () => screen.getByRole('searchbox', { name: 'Search frequently asked questions' });

describe('FAQSearch', () => {
  it('renders the shared search field with its placeholder', () => {
    render(<FAQSearch value="" onChange={jest.fn()} />);
    expect(input()).toHaveAttribute('placeholder', 'Search questions…');
  });

  it('shows a clear button once there is text, and clears through onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<FAQSearch value="wallet" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('reports every keystroke', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<FAQSearchWrapper onChange={onChange} />);
    await user.type(input(), 'test');
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenLastCalledWith('test');
  });

  it('announces how many questions match while filtering', () => {
    const { rerender } = render(
      <FAQSearch value="gas" onChange={jest.fn()} resultCount={5} totalCount={20} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Showing 5 of 20 questions');

    rerender(<FAQSearch value="xyz" onChange={jest.fn()} resultCount={0} totalCount={20} />);
    expect(screen.getByRole('status')).toHaveTextContent(/No questions found/);

    rerender(<FAQSearch value="" onChange={jest.fn()} resultCount={5} totalCount={20} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('claims no "/" shortcut, which could not be turned off (WCAG 2.1.4)', () => {
    render(<FAQSearch value="" onChange={jest.fn()} />);
    const event = new KeyboardEvent('keydown', { key: '/', cancelable: true });
    document.dispatchEvent(event);
    expect(document.activeElement).not.toBe(input());
    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves Cmd+K and Ctrl+K to the site-wide command palette', () => {
    render(<FAQSearch value="" onChange={jest.fn()} />);
    for (const modifier of [{ metaKey: true }, { ctrlKey: true }]) {
      const event = new KeyboardEvent('keydown', { key: 'k', cancelable: true, ...modifier });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(document.activeElement).not.toBe(input());
  });

  it('types "/" into another field instead of stealing focus', () => {
    render(
      <>
        <input aria-label="other field" />
        <FAQSearch value="" onChange={jest.fn()} />
      </>,
    );
    const other = screen.getByLabelText('other field');
    other.focus();
    const event = new KeyboardEvent('keydown', { key: '/', cancelable: true, bubbles: true });
    other.dispatchEvent(event);
    expect(document.activeElement).toBe(other);
    expect(event.defaultPrevented).toBe(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FAQSearch value="" onChange={jest.fn()} />);
    await checkA11y(container);
  });
});
