import { render, screen } from '@testing-library/react';

import { Duration } from '../duration';

describe('Duration', () => {
  it('renders a countdown in <time> with an ISO duration and tabular figures', () => {
    render(<Duration seconds={597824} variant="clock" role="timer" />);
    const time = screen.getByRole('timer');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', 'P6DT22H3M44S');
    expect(time).toHaveClass('tabular-nums', 'whitespace-nowrap');
    expect(time.textContent).toBe('6d\u00a022:03:44');
  });

  it('renders the compact form, optionally truncated to leading units', () => {
    const { rerender, container } = render(<Duration seconds={90061} />);
    expect(container.textContent).toBe('1d\u00a01h\u00a01m\u00a01s');
    rerender(<Duration seconds={90061} maxUnits={2} />);
    expect(container.textContent).toBe('1d\u00a01h');
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
