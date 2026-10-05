import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { SegmentedControl } from '../segmented-control';

function Harness({ onChange, scroll }: { onChange?: (value: string) => void; scroll?: boolean }) {
  const [value, setValue] = useState('day');
  return (
    <SegmentedControl
      label="Time interval"
      value={value}
      scroll={scroll}
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
  it('is a named group of native radios with one checked option', () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Time interval' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Daily' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Weekly' })).not.toBeChecked();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.tagName).toBe('INPUT');
    }
  });

  it('keeps one tab stop and moves the choice with the arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('hour');
    expect(screen.getByRole('radio', { name: 'Hourly' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Hourly' })).toBeChecked();
    // Tab leaves the group rather than stepping through its options.
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('chooses on click and marks the chosen option active', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('Hourly'));
    expect(screen.getByRole('radio', { name: 'Hourly' })).toBeChecked();
    expect(screen.getByText('Hourly').closest('label')).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Daily').closest('label')).toHaveAttribute('data-state', 'inactive');
  });

  it('wraps from the start of the row, never centred', () => {
    render(<Harness />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveClass('justify-start', 'flex-wrap');
    expect(group).not.toHaveClass('justify-center');
  });

  it('scrolls a long set in one row instead of wrapping', () => {
    render(<Harness scroll />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveClass('flex-nowrap');
    expect(group).not.toHaveClass('flex-wrap');
  });

  it('draws an icon before a label and keeps an unavailable option out of reach', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <SegmentedControl
        label="View"
        value="still"
        onValueChange={onChange}
        options={[
          { value: 'still', label: 'Still', icon: <svg data-testid="still-icon" aria-hidden /> },
          { value: 'motion', label: 'In motion', disabled: true },
        ]}
      />,
    );
    expect(screen.getByTestId('still-icon')).toBeInTheDocument();
    const motion = screen.getByRole('radio', { name: 'In motion' });
    expect(motion).toBeDisabled();
    await user.click(motion);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Harness />);
    await checkA11y(container);
  });
});
