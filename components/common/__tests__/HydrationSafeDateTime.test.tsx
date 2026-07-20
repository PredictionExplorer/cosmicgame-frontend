import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import {
  convertTimestampToDateTime,
  convertTimestampToServerDateTime,
  getRelativeTime,
} from '@/utils';

import { HydrationSafeDateTime, useHydrationSafeNowSeconds } from '../HydrationSafeDateTime';

function RelativeTimeProbe({ timestamp }: { timestamp: number }) {
  const nowSeconds = useHydrationSafeNowSeconds(timestamp);
  return <>{getRelativeTime(timestamp, nowSeconds)}</>;
}

describe('HydrationSafeDateTime', () => {
  it('hydrates a deterministic server snapshot before switching to browser-local time', async () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';
    const timestamp = Date.UTC(2026, 0, 1, 0, 30, 45) / 1000;
    const serverValue = convertTimestampToServerDateTime(timestamp, true);
    const localValue = convertTimestampToDateTime(timestamp, true);
    const element = <HydrationSafeDateTime timestamp={timestamp} showSecond locale="en" />;
    const container = document.createElement('div');
    const actEnvironment = globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    };
    const originalActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    let root: Root | undefined;

    try {
      container.innerHTML = renderToString(element);
      expect(container).toHaveTextContent(serverValue);

      await act(async () => {
        root = hydrateRoot(container, element);
      });

      expect(localValue).not.toBe(serverValue);
      expect(container).toHaveTextContent(localValue);
    } finally {
      if (root) {
        await act(async () => root?.unmount());
      }
      if (originalActEnvironment === undefined) {
        delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
      } else {
        actEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
      }
      if (originalTimeZone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimeZone;
    }
  });

  it('defers relative time until hydration instead of reading the clock during render', async () => {
    const timestamp = 1_700_000_000;
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue((timestamp + 120) * 1000);
    const element = <RelativeTimeProbe timestamp={timestamp} />;
    const container = document.createElement('div');
    const actEnvironment = globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    };
    const originalActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    let root: Root | undefined;

    try {
      container.innerHTML = renderToString(element);
      expect(container).toHaveTextContent('just now');

      await act(async () => {
        root = hydrateRoot(container, element);
      });

      expect(container).toHaveTextContent('2 minutes ago');
    } finally {
      if (root) {
        await act(async () => root?.unmount());
      }
      if (originalActEnvironment === undefined) {
        delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
      } else {
        actEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
      }
      nowSpy.mockRestore();
    }
  });
});
