import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { SegmentedControl } from '../SegmentedControl';

function Harness({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('day');
  return (
    <SegmentedControl
      label="Time interval"
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      options={[
        { value: 'day', label: 'Daily' },
        { value: 'hour', label: 'Hourly' },
        { value: 'week', label: '1w', ariaLabel: 'Weekly' },
      ]}
    />
  );
}

describe('SegmentedControl', () => {
  it('is a named radio group with one checked option', () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Time interval' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Weekly' })).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps one tab stop and moves the choice with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const tabbable = screen.getAllByRole('radio').filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('hour');
    expect(screen.getByRole('radio', { name: 'Hourly' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('week');
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('day');
    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveAttribute('aria-checked', 'true');
  });

  it('chooses on click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('radio', { name: 'Hourly' }));
    expect(screen.getByRole('radio', { name: 'Hourly' })).toHaveAttribute('aria-checked', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Harness />);
    await checkA11y(container);
  });
});
