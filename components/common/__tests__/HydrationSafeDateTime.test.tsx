import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';

import { getRelativeTime } from '@/utils';

import {
  HydrationSafeDateTime,
  useHydrationSafeDateTime,
  useHydrationSafeNowSeconds,
} from '../HydrationSafeDateTime';

function RelativeTimeProbe({ timestamp }: { timestamp: number }) {
  const nowSeconds = useHydrationSafeNowSeconds(timestamp);
  return <>{getRelativeTime(timestamp, nowSeconds)}</>;
}

function StringProbe({ timestamp }: { timestamp: number }) {
  return <>{useHydrationSafeDateTime(timestamp, true)}</>;
}

const TIMESTAMP = Date.UTC(2026, 0, 1, 0, 30, 45) / 1000;

async function withActEnvironment(run: () => Promise<void>): Promise<void> {
  const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previous = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await run();
  } finally {
    if (previous === undefined) delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    else actEnvironment.IS_REACT_ACT_ENVIRONMENT = previous;
  }
}

describe('HydrationSafeDateTime', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 5, 15));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('delegates to <DateTime>: a <time> element with the instant and a hover title', () => {
    render(<HydrationSafeDateTime timestamp={TIMESTAMP} showSecond locale="en" />);
    const time = document.querySelector('time');
    expect(time).toHaveAttribute('datetime', '2026-01-01T00:30:45.000Z');
    expect(time?.getAttribute('title')).toMatch(
      /^[A-Z][a-z]{2} \d{2}, 202[56], \d{2}:\d{2}:45 UTC/,
    );
  });

  it('follows the active locale when no locale is passed, like <DateTime>', () => {
    const nextIntl = jest.requireMock('next-intl') as { useLocale: () => string };
    jest.spyOn(nextIntl, 'useLocale').mockReturnValue('zh');
    render(
      <>
        <HydrationSafeDateTime timestamp={TIMESTAMP} showSecond />
        <span data-testid="string">
          <StringProbe timestamp={TIMESTAMP} />
        </span>
      </>,
    );
    // The zh compact form ("1月1日 00:30:45"), in the runner's local zone after
    // hydration, which may fall on 2025-12-31 and so carry the year.
    const zhDateTime = /^(?:\d{4}年)?\d{1,2}月\d{1,2}日 \d{2}:\d{2}:45$/;
    expect(document.querySelector('time')?.textContent).toMatch(zhDateTime);
    expect(screen.getByTestId('string').textContent).toMatch(zhDateTime);
  });

  it('still supports the render prop', () => {
    render(
      <HydrationSafeDateTime timestamp={TIMESTAMP}>
        {(value) => <em data-testid="value">{value}</em>}
      </HydrationSafeDateTime>,
    );
    expect(screen.getByTestId('value').closest('time')).not.toBeNull();
  });

  it('serves deterministic UTC strings through hydration without a mismatch', async () => {
    await withActEnvironment(async () => {
      const element = <StringProbe timestamp={TIMESTAMP} />;
      const container = document.createElement('div');
      container.innerHTML = renderToString(element);
      expect(container).toHaveTextContent('Jan 01, 00:30:45');

      const onRecoverableError = jest.fn();
      let root: Root | undefined;
      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError });
      });
      expect(onRecoverableError).not.toHaveBeenCalled();
      await act(async () => root?.unmount());
    });
  });

  it('defers relative time until hydration instead of reading the clock during render', async () => {
    const timestamp = 1_700_000_000;
    jest.spyOn(Date, 'now').mockReturnValue((timestamp + 120) * 1000);
    await withActEnvironment(async () => {
      const element = <RelativeTimeProbe timestamp={timestamp} />;
      const container = document.createElement('div');
      container.innerHTML = renderToString(element);
      expect(container).toHaveTextContent('just now');

      let root: Root | undefined;
      await act(async () => {
        root = hydrateRoot(container, element);
      });
      expect(container).toHaveTextContent('2 minutes ago');
      await act(async () => root?.unmount());
    });
  });
});
