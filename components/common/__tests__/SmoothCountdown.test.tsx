import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

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

  it('renders an epoch deadline against the serialized clock before hydration', () => {
    const initialNowMs = Date.UTC(2026, 8, 5);
    const html = renderToString(
      <SmoothCountdown
        date={initialNowMs + 90_000}
        initialNowMs={initialNowMs}
        renderer={({ total }) => <span>{total}</span>}
      />,
    );

    expect(html).toBe('<span>90000</span>');
  });

  it('hydrates the seeded countdown before taking over with the live browser clock', async () => {
    const initialNowMs = Date.UTC(2026, 8, 5);
    jest.setSystemTime(initialNowMs + 10_000);
    const onRecoverableError = jest.fn();
    const element = (
      <SmoothCountdown
        date={initialNowMs + 90_000}
        initialNowMs={initialNowMs}
        intervalMs={137}
        renderer={({ total }) => <span>{total}</span>}
      />
    );
    const container = document.createElement('div');
    let root: Root | undefined;

    try {
      container.innerHTML = renderToString(element);
      expect(container).toHaveTextContent('90000');

      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError });
      });

      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(container).toHaveTextContent('80000');
      act(() => {
        jest.advanceTimersByTime(137);
      });
      expect(container).toHaveTextContent('79863');
    } finally {
      await act(async () => root?.unmount());
    }
  });
});
