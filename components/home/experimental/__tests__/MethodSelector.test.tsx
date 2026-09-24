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
