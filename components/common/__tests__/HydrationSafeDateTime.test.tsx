import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import {
  convertTimestampToDateTime,
  convertTimestampToServerDateTime,
  getRelativeTime,
} from '@/utils';

import { HydrationSafeDateTime, useHydrationSafeNowSeconds } from '../HydrationSafeDateTime';

jest.mock('@/utils', () => {
  const actual = jest.requireActual<typeof import('@/utils')>('@/utils');
  return {
    ...actual,
    convertTimestampToDateTime: jest.fn(actual.convertTimestampToDateTime),
  };
});

const actualDateTime =
  jest.requireActual<typeof import('@/utils')>('@/utils').convertTimestampToDateTime;
const mockDateTime = jest.mocked(convertTimestampToDateTime);

function RelativeTimeProbe({ timestamp }: { timestamp: number }) {
  const nowSeconds = useHydrationSafeNowSeconds(timestamp);
  return <>{getRelativeTime(timestamp, nowSeconds)}</>;
}

describe('HydrationSafeDateTime', () => {
  it.each([
    { zone: 'UTC', offsetSeconds: 0, expectedLocal: 'Jan 01, 00:30:45' },
    { zone: 'UTC-08:00', offsetSeconds: -8 * 3_600, expectedLocal: 'Dec 31, 16:30:45' },
  ])(
    'hydrates deterministic UTC before using browser-local time in $zone',
    async ({ offsetSeconds, expectedLocal }) => {
      // Jest's VM does not reliably change the runtime timezone when TZ is
      // reassigned. Model the browser-local formatter while retaining the real
      // UTC formatting; this tests the hydration boundary in either host zone.
      mockDateTime.mockImplementation(
        (value, showSecond = false, locale = 'en', timeZone = 'local') =>
          actualDateTime(
            value + (timeZone === 'utc' ? 0 : offsetSeconds),
            showSecond,
            locale,
            'utc',
          ),
      );
      const timestamp = Date.UTC(2026, 0, 1, 0, 30, 45) / 1000;
      const serverValue = convertTimestampToServerDateTime(timestamp, true);
      const element = <HydrationSafeDateTime timestamp={timestamp} showSecond locale="en" />;
      const container = document.createElement('div');
      const onRecoverableError = jest.fn();
      const actEnvironment = globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      };
      const originalActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
      let root: Root | undefined;

      try {
        container.innerHTML = renderToString(element);
        expect(serverValue).toBe('Jan 01, 00:30:45');
        expect(container).toHaveTextContent(serverValue);

        await act(async () => {
          root = hydrateRoot(container, element, { onRecoverableError });
        });

        expect(container).toHaveTextContent(expectedLocal);
        expect(onRecoverableError).not.toHaveBeenCalled();
      } finally {
        if (root) {
          await act(async () => root?.unmount());
        }
        if (originalActEnvironment === undefined) {
          delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
        } else {
          actEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
        }
        mockDateTime.mockReset().mockImplementation(actualDateTime);
      }
    },
  );

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
