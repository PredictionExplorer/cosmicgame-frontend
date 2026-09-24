import { act, type ReactElement } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';

import { DateTime, TimeZoneNote, useTimeZoneLabel } from '../date-time';

// 2026-01-01 00:30:45 UTC is still 31 December in Los Angeles: a date and
// year boundary, so the hydration switch is visible in every field.
const NEW_YEAR = Date.UTC(2026, 0, 1, 0, 30, 45) / 1000;
const MID_2026 = Date.UTC(2026, 5, 15, 12, 0, 0);

/** Server-renders `element`, hydrates it, and returns the container for assertions. */
async function hydrate(element: ReactElement) {
  const container = document.createElement('div');
  container.innerHTML = renderToString(element);
  const serverHtml = container.innerHTML;
  const onRecoverableError = jest.fn();
  const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previous = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  let root: Root | undefined;
  await act(async () => {
    root = hydrateRoot(container, element, { onRecoverableError });
  });
  const cleanup = async () => {
    await act(async () => root?.unmount());
    if (previous === undefined) delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    else actEnvironment.IS_REACT_ACT_ENVIRONMENT = previous;
  };
  return { container, serverHtml, onRecoverableError, cleanup };
}

describe('DateTime', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(MID_2026);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders UTC on the server and the reader zone after hydration, without a mismatch', async () => {
    const { container, serverHtml, onRecoverableError, cleanup } = await hydrate(
      <DateTime timestamp={NEW_YEAR} seconds timeZone="America/Los_Angeles" />,
    );
    try {
      expect(serverHtml).toContain('Jan 01, 00:30:45');
      expect(serverHtml).toContain('title="Jan 1, 2026, 00:30:45 UTC"');
      const time = container.querySelector('time');
      expect(time).toHaveAttribute('datetime', '2026-01-01T00:30:45.000Z');
      // Local time crosses into the previous year, so the year appears.
      expect(time).toHaveTextContent('Dec 31, 2025, 16:30:45');
      expect(time?.getAttribute('title')).toMatch(
        /^Dec 31, 2025, 16:30:45 UTC-8 · \d+ months ago$/,
      );
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await cleanup();
    }
  });

  it('renders the full detail variant with the year and seconds', () => {
    render(<DateTime timestamp={NEW_YEAR} variant="full" timeZone="utc" locale="ja" />);
    expect(screen.getByText('2026年1月1日 00:30:45').tagName).toBe('TIME');
  });

  it('shows a relative age on live surfaces, keeping the absolute value on hover', () => {
    const threeHoursAgo = MID_2026 / 1000 - 3 * 3_600;
    render(<DateTime timestamp={threeHoursAgo} variant="relative" timeZone="utc" />);
    const time = screen.getByText('3 hours ago');
    expect(time).toHaveAttribute('title', 'Jun 15, 2026, 09:00:00 UTC · 3 hours ago');
  });

  it('passes the formatted value to a render prop', () => {
    render(
      <DateTime timestamp={NEW_YEAR} timeZone="utc">
        {(value) => <strong>{value}</strong>}
      </DateTime>,
    );
    expect(screen.getByText('Jan 01, 00:30').tagName).toBe('STRONG');
  });

  it('renders an em dash, not a broken <time>, for a missing timestamp', () => {
    const { container } = render(<DateTime timestamp={undefined} />);
    expect(container).toHaveTextContent('—');
    expect(container.querySelector('time')).toBeNull();
  });

  it('never wraps and keeps caller classes', () => {
    render(<DateTime timestamp={NEW_YEAR} timeZone="utc" className="text-xs" />);
    expect(screen.getByText('Jan 01, 00:30')).toHaveClass('whitespace-nowrap', 'text-xs');
  });
});

describe('time zone captions', () => {
  function Probe() {
    return <span data-testid="zone">{useTimeZoneLabel()}</span>;
  }

  it('reads UTC on the server', () => {
    expect(renderToString(<Probe />)).toContain('>UTC<');
  });

  it('reads the browser offset after mount', () => {
    render(<Probe />);
    expect(screen.getByTestId('zone').textContent).toMatch(/^UTC([+-]\d{1,2}(:\d{2})?)?$/);
  });

  it('states the zone once through the formats catalog', () => {
    render(<TimeZoneNote />);
    expect(screen.getByText(/^formats\.dateTime\.timeZone\(zone=UTC/)).toBeInTheDocument();
  });
});
