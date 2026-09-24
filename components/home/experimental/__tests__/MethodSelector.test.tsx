import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { MethodSelector, type MethodOption } from '../MethodSelector';

const OPTIONS: MethodOption[] = [
  { value: 'ETH', label: 'ETH', price: '0.10211 ETH' },
  { value: 'RandomWalk', label: 'ETH + RWLK', price: '0.051055 ETH', note: '50% discount' },
  { value: 'CST', label: 'CST', price: '250.52 CST' },
];

function renderSelector(value = 'ETH', onChange = jest.fn()) {
  render(
    <>
      <p id="method-label">Gesture method</p>
      <MethodSelector
        options={OPTIONS}
        value={value}
        onChange={onChange}
        labelledBy="method-label"
      />
    </>,
  );
  return onChange;
}

function StatefulSelector({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState('ETH');
  return (
    <>
      <p id="method-label">Gesture method</p>
      <MethodSelector
        options={OPTIONS}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
        labelledBy="method-label"
      />
    </>
  );
}

describe('MethodSelector', () => {
  it('shows every method with its live price inside the segment', () => {
    renderSelector();

    const group = screen.getByRole('radiogroup', { name: 'Gesture method' });
    const radios = screen.getAllByRole('radio');
    expect(group).toContainElement(radios[0]!);
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveTextContent('ETH0.10211 ETH');
    expect(radios[1]).toHaveTextContent('ETH + RWLK0.051055 ETH50% discount');
    expect(radios[2]).toHaveTextContent('CST250.52 CST');
  });

  it('marks the chosen row along its start edge when stacked, its foot when side by side', () => {
    renderSelector('RandomWalk');

    const [eth, rwlk] = screen.getAllByRole('radio');
    // Stacked rows (a narrow column): a start-edge rule and a ring, never a
    // bottom rule that reads as a row divider.
    expect(rwlk).toHaveClass('shadow-[inset_2px_0_0_hsl(var(--primary))]', 'ring-1');
    // Side by side: the segmented control's foot rule, no ring.
    expect(rwlk).toHaveClass(
      '@min-[21rem]:shadow-[inset_0_-2px_0_hsl(var(--primary))]',
      '@min-[21rem]:ring-0',
    );
    expect(eth).not.toHaveClass('ring-1');
  });

  it('lines the prices up across the segments whatever a label wraps to', () => {
    renderSelector();

    // Each segment shares the group's label and price rows.
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveClass('@min-[21rem]:row-span-2', '@min-[21rem]:grid-rows-subgrid');
    });
  });

  it('reads a note once under the track when the segments sit side by side', () => {
    renderSelector('RandomWalk');

    // No note row inside the segments, so the chosen one is not a tall,
    // mostly empty box; its own note stays in its name for screen readers.
    const rwlk = screen.getByRole('radio', { name: /ETH \+ RWLK/ });
    // Stacked, the note runs the row's full width under label and price.
    expect(screen.getByText('50% discount', { selector: 'button span' })).toHaveClass(
      'col-span-2',
      '@min-[21rem]:sr-only',
    );
    expect(rwlk).toHaveTextContent('50% discount');
    const notes = screen.getByTestId('gesture-method-notes');
    expect(notes).toHaveAttribute('aria-hidden', 'true');
    expect(notes).toHaveClass('hidden', '@min-[21rem]:block');
    expect(notes).toHaveTextContent(/^50% discount$/);
    // The chosen method's note reads a step stronger.
    expect(notes.firstElementChild).toHaveClass('text-muted-foreground');
  });

  it('shows no note line when no method has one', () => {
    render(
      <MethodSelector
        options={OPTIONS.filter((option) => !option.note)}
        value="ETH"
        onChange={jest.fn()}
        labelledBy="method-label"
      />,
    );
    expect(screen.queryByTestId('gesture-method-notes')).not.toBeInTheDocument();
  });

  it('marks only the selected method as checked, with one tab stop', () => {
    renderSelector('CST');

    const [eth, rwlk, cst] = screen.getAllByRole('radio');
    expect(cst).toHaveAttribute('aria-checked', 'true');
    expect(eth).toHaveAttribute('aria-checked', 'false');
    expect(rwlk).toHaveAttribute('aria-checked', 'false');
    expect(cst).toHaveAttribute('tabindex', '0');
    expect(eth).toHaveAttribute('tabindex', '-1');
  });

  it('selects on click', async () => {
    const onChange = renderSelector();

    await userEvent.click(screen.getByRole('radio', { name: /CST/ }));
    expect(onChange).toHaveBeenCalledWith('CST');
  });

  it('moves the selection with the arrow keys, wrapping at the ends', async () => {
    const onChange = jest.fn();
    render(<StatefulSelector onChange={onChange} />);
    screen.getAllByRole('radio')[0]!.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('RandomWalk');
    expect(screen.getByRole('radio', { name: /RWLK/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('CST');
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('ETH');
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('CST');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <p id="method-label">Gesture method</p>
        <MethodSelector
          options={OPTIONS}
          value="ETH"
          onChange={jest.fn()}
          labelledBy="method-label"
        />
      </>,
    );
    await checkA11y(container);
  });
});
