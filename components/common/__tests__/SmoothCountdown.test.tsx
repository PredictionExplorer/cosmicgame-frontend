import { act, render, screen } from '@/test-utils';

import { getCountdownParts, SmoothCountdown } from '../SmoothCountdown';

describe('getCountdownParts', () => {
  it('derives stable countdown parts from a target and current time', () => {
    expect(getCountdownParts(90_500, 30_000)).toMatchObject({
      total: 60_500,
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 0,
      milliseconds: 500,
      completed: false,
    });
  });

  it('clamps completed countdowns to zero', () => {
    expect(getCountdownParts(10_000, 12_000)).toMatchObject({
      total: 0,
      seconds: 0,
      milliseconds: 0,
      completed: true,
    });
  });
});

describe('SmoothCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ticks from the shared clock without skipping seconds', () => {
    render(
      <SmoothCountdown
        date={3_000}
        intervalMs={1000}
        renderer={({ seconds }) => <span data-testid="seconds">{seconds}</span>}
      />,
    );

    expect(screen.getByTestId('seconds')).toHaveTextContent('3');
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('seconds')).toHaveTextContent('2');
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('seconds')).toHaveTextContent('1');
  });

  it('feeds tenths to the existing Counter renderer under one minute', () => {
    render(<SmoothCountdown date={12_900} />);

    expect(screen.getByTestId('countdown-tenths')).toHaveTextContent('.9');
  });

  it('supplies localized unit labels to the shared Counter', () => {
    render(<SmoothCountdown date={90_000} />);

    expect(screen.getByText('formats.countdown.minutes')).toBeInTheDocument();
    expect(screen.getByText('formats.countdown.seconds')).toBeInTheDocument();
  });
});
