import { render, screen } from '@testing-library/react';

import { Duration } from '../duration';

describe('Duration', () => {
  it('renders a countdown in <time> with an ISO duration and tabular figures', () => {
    render(<Duration seconds={597824} variant="clock" role="timer" />);
    const time = screen.getByRole('timer');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', 'P6DT22H3M44S');
    expect(time).toHaveClass('tabular-nums', 'whitespace-nowrap');
    expect(time.textContent).toBe('6d 22:03:44');
  });

  it('renders the compact form, optionally truncated to leading units', () => {
    const { rerender, container } = render(<Duration seconds={90061} />);
    expect(container.textContent).toBe('1d\u00a01h\u00a01m\u00a01s');
    rerender(<Duration seconds={90061} maxUnits={2} />);
    expect(container.textContent).toBe('1d\u00a01h');
  });

  // V427: Vietnamese writes the unit words ("9 ngày 1 giờ 36 phút 42 giây"),
  // which a nowrap duration pushed out of a narrow ledger cell.
  it('lets a narrow box wrap a compact duration between unit groups, never inside one', () => {
    const { container } = render(<Duration seconds={9 * 86_400 + 5_802} locale="vi" />);
    const time = container.querySelector('time')!;
    expect(time).not.toHaveClass('whitespace-nowrap');
    expect(time).toHaveClass('break-keep');
    expect(time.querySelectorAll('wbr')).toHaveLength(3);
    // The text is formatDuration's: each number is tied to its unit.
    expect(time.textContent).toBe(
      '9\u00a0ngày\u00a01\u00a0giờ\u00a036\u00a0phút\u00a042\u00a0giây',
    );
  });

  it('breaks only at the <wbr> between groups where the language has no word spaces', () => {
    const { container } = render(<Duration seconds={90061} locale="ja" />);
    const time = container.querySelector('time')!;
    expect(time).toHaveClass('break-keep');
    expect(time.querySelectorAll('wbr')).toHaveLength(3);
    expect(time.textContent).toBe('1日1時間1分1秒');
  });

  it('lets a wrapping countdown break only between the days and the clock', () => {
    const { container, rerender } = render(
      <Duration seconds={5 * 86_400 + 3_723} variant="clock" locale="vi" wrap />,
    );
    const time = container.querySelector('time')!;
    expect(time).not.toHaveClass('whitespace-nowrap');
    expect(time.querySelectorAll('wbr')).toHaveLength(1);
    expect(time.textContent).toBe('5\u00a0ngày\u00a001:02:03');
    rerender(<Duration seconds={5 * 86_400 + 3_723} variant="clock" locale="vi" />);
    expect(container.querySelector('time')).toHaveClass('whitespace-nowrap');
    expect(container.querySelectorAll('wbr')).toHaveLength(0);
  });

  it('uses the locale units, run together where the language has no word spaces', () => {
    const { container } = render(<Duration seconds={597824} variant="clock" locale="ja" />);
    expect(container.textContent).toBe('6日22:03:44');
  });

  it('renders an unknown duration as an em dash with no machine value', () => {
    const { container } = render(<Duration seconds={undefined} />);
    expect(container.textContent).toBe('—');
    expect(container.querySelector('time')).not.toHaveAttribute('datetime');
  });
});
