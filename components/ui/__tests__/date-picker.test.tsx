import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DatePicker } from '../date-picker';

describe('DatePicker', () => {
  it('opens calendar popover and selects a date', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DatePicker id="test-date" label="Start" value="2026-05-06" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByTestId('date-picker-calendar')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '15' }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15');
  });
});
