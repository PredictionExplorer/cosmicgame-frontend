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

  it('uses Chinese date formatting and a Monday-first calendar', async () => {
    const nextIntl = jest.requireMock('next-intl') as { useLocale: () => string };
    const localeSpy = jest.spyOn(nextIntl, 'useLocale').mockReturnValue('zh');
    const user = userEvent.setup();

    render(<DatePicker id="zh-date" label="日期" value="2026-05-06" onChange={jest.fn()} />);
    expect(screen.getByText('2026/5/6')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '日期' }));
    const monday = screen.getByText('forms.datePicker.weekdays.monday');
    const sunday = screen.getByText('forms.datePicker.weekdays.sunday');
    expect(monday.compareDocumentPosition(sunday) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    localeSpy.mockRestore();
  });
});
