import { act, type ReactElement } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';

import { DateTime, TimeZoneNote, useHydrationSafeDateTime, useTimeZoneLabel } from '../date-time';

// 2026-01-01 00:30:45 UTC is still 31 December in Los Angeles: a date and
// year boundary, so any switch of zone would be visible in every field.
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

  it('renders UTC on the server and after hydration: a date never rewrites itself', async () => {
    const { container, serverHtml, onRecoverableError, cleanup } = await hydrate(
      <DateTime timestamp={NEW_YEAR} seconds />,
    );
    try {
      expect(serverHtml).toContain('Jan 01, 00:30:45');
      expect(serverHtml).toContain('title="Jan 1, 2026, 00:30:45 UTC"');
      const time = container.querySelector('time');
      expect(time).toHaveAttribute('datetime', '2026-01-01T00:30:45.000Z');
      // The regression: after hydration the value flipped to the reader's zone
      // (here the previous year) and moved the page.
      expect(time).toHaveTextContent(/^Jan 01, 00:30:45$/);
      // The reader's own time joins the hover text once hydrated, where it differs.
      const title = time?.getAttribute('title') ?? '';
      expect(title).toMatch(/^Jan 1, 2026, 00:30:45 UTC · /);
      expect(title).toMatch(/ · \d+ months ago$/);
      if (new Date(NEW_YEAR * 1000).getTimezoneOffset() !== 0) {
        expect(title.split(' · ')).toHaveLength(3);
      }
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await cleanup();
    }
  });

  it("shows the reader's clock only where asked, and only after hydration", async () => {
    const { container, serverHtml, onRecoverableError, cleanup } = await hydrate(
      <DateTime timestamp={NEW_YEAR} seconds timeZone="local" />,
    );
    try {
      expect(serverHtml).toContain('Jan 01, 00:30:45');
      const local = new Date(NEW_YEAR * 1000);
      const expected = `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}:45`;
      expect(container.querySelector('time')?.textContent).toContain(expected);
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await cleanup();
    }
  });

  it('renders a named zone the same on the server and the client', async () => {
    const { container, serverHtml, cleanup } = await hydrate(
      <DateTime timestamp={NEW_YEAR} seconds timeZone="America/Los_Angeles" />,
    );
    try {
      expect(serverHtml).toContain('Dec 31, 2025, 16:30:45');
      expect(container.querySelector('time')).toHaveTextContent('Dec 31, 2025, 16:30:45');
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
    expect(time.getAttribute('title')).toMatch(
      /^Jun 15, 2026, 09:00:00 UTC · (.+ · )?3 hours ago$/,
    );
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

  it('names its zone like a unit when it stands alone', () => {
    const { container } = render(<DateTime timestamp={NEW_YEAR} timeZone="utc" showZone />);
    const time = container.querySelector('time');
    expect(time).toHaveTextContent('Jan 01, 00:30 UTC');
    const zone = time?.querySelector('[data-slot="zone"]');
    expect(zone).toHaveTextContent(/^UTC$/);
    expect(zone).toHaveClass('text-subtle');
  });

  it("keeps the locale's own brackets around the zone", () => {
    const { container } = render(
      <DateTime timestamp={NEW_YEAR} timeZone="utc" locale="ja" showZone />,
    );
    expect(container.querySelector('time')).toHaveTextContent('1月1日 00:30（UTC）');
    expect(container.querySelector('[data-slot="zone"]')).toHaveTextContent(/^UTC$/);
  });
});

describe('time zone captions', () => {
  function Probe() {
    return <span data-testid="zone">{useTimeZoneLabel()}</span>;
  }

  it('reads UTC on the server', () => {
    expect(renderToString(<Probe />)).toContain('>UTC<');
  });

  it('reads UTC after mount too, as every date-time is shown', () => {
    render(<Probe />);
    expect(screen.getByTestId('zone')).toHaveTextContent(/^UTC$/);
  });

  it('states the zone once through the formats catalog', () => {
    render(<TimeZoneNote />);
    expect(screen.getByText(/^formats\.dateTime\.timeZone\(zone=UTC/)).toBeInTheDocument();
  });
});

describe('hydration-safe date strings', () => {
  function StringProbe({ timestamp, locale }: { timestamp: number; locale?: string }) {
    return <>{useHydrationSafeDateTime(timestamp, true, locale)}</>;
  }

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(MID_2026);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('serves deterministic UTC strings through hydration without a mismatch', async () => {
    const { serverHtml, onRecoverableError, cleanup } = await hydrate(
      <StringProbe timestamp={NEW_YEAR} />,
    );
    expect(serverHtml).toContain('Jan 01, 00:30:45');
    expect(onRecoverableError).not.toHaveBeenCalled();
    await cleanup();
  });

  it('follows the active locale when no locale is passed', () => {
    const nextIntl = jest.requireMock('next-intl') as { useLocale: () => string };
    jest.spyOn(nextIntl, 'useLocale').mockReturnValue('zh');
    render(<StringProbe timestamp={NEW_YEAR} />);
    // The zh compact form, in UTC after hydration as on the server.
    expect(document.body).toHaveTextContent(/^1月1日 00:30:45$/);
  });
});
