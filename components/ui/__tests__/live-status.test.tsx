import { readFileSync } from 'node:fs';
import path from 'node:path';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as renderWithWrapper } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useLiveFreshness } from '@/hooks/useLiveFreshness';

import { act, checkA11y, render, renderHook, screen } from '@/test-utils';

import { LiveStatus, LiveStatusView as ReExportedView } from '../live-status';
import { LiveStatusView } from '../live-status-view';

jest.unmock('@tanstack/react-query');

describe('LiveStatusView', () => {
  it('stays free of React Query and the wallet stack so the landing can render it', () => {
    const source = readFileSync(path.join(__dirname, '..', 'live-status-view.tsx'), 'utf8');
    expect(source).not.toMatch(/@tanstack\/react-query|wagmi|rainbowkit|@\/hooks\//);
    expect(ReExportedView).toBe(LiveStatusView);
  });

  it('pulses only while live, with the state as text', () => {
    render(<LiveStatusView state="live" variant="dot" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('common.liveStatus.live');
    expect(status.parentElement).toHaveAttribute('data-live-state', 'live');
    expect(status.previousElementSibling).toHaveClass('animate-live-dot');
  });

  it('stops pulsing and ages when updates are delayed', () => {
    render(<LiveStatusView state="delayed" ageMs={120_000} variant="chip" clockCaveat />);
    // Screen readers hear the state once, not the ticking age.
    expect(screen.getByRole('status')).toHaveTextContent('common.liveStatus.delayedShort');
    // One message carries the state and the caveat (no space-joined halves).
    expect(
      screen.getByText(
        'common.liveStatus.delayedCaveat(age=common.liveStatus.age.minutes(count=2))',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('status').previousElementSibling).not.toHaveClass('animate-live-dot');
  });

  it('shows the freshness stamp inline', () => {
    render(<LiveStatusView state="live" ageMs={12_000} variant="inline" />);
    expect(
      screen.getByText('common.liveStatus.updated(age=common.liveStatus.age.seconds(count=12))'),
    ).toBeInTheDocument();
  });

  it('says offline with the age of the last update', async () => {
    const { container } = render(
      <LiveStatusView state="offline" ageMs={3 * 60_000} variant="inline" />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('common.liveStatus.offline');
    expect(screen.getByText(/common\.liveStatus\.offlineDetail/)).toBeInTheDocument();
    await checkA11y(container);
  });

  it('adds the clock caveat offline through the one offline message', () => {
    render(<LiveStatusView state="offline" ageMs={3 * 60_000} variant="inline" clockCaveat />);
    expect(
      screen.getByText(
        'common.liveStatus.offlineCaveat(age=common.liveStatus.age.minutes(count=3))',
      ),
    ).toBeInTheDocument();
  });

  it('never adds the caveat while the data is live', () => {
    render(<LiveStatusView state="live" variant="chip" clockCaveat />);
    expect(
      screen.getByText('common.liveStatus.live', { selector: '[aria-hidden]' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Caveat/)).not.toBeInTheDocument();
  });
});

describe('useLiveFreshness + LiveStatus', () => {
  function withClient(client: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
  }

  /** A dashboard poll that succeeds (a network fetch, not a local write). */
  const fetchDashboard = (client: QueryClient) =>
    client.fetchQuery({
      queryKey: ['dashboardInfo'],
      queryFn: () => Promise.resolve({ CurNumBids: 1 }),
      staleTime: 0,
    });

  it('reads connecting before any fetch, then live once data arrives', async () => {
    const client = new QueryClient();
    const { result } = renderHook(() => useLiveFreshness(), { wrapper: withClient(client) });
    expect(result.current.state).toBe('connecting');

    await act(async () => {
      await fetchDashboard(client);
    });
    expect(result.current.state).toBe('live');
    expect(result.current.lastSuccessAtMs).toEqual(expect.any(Number));
  });

  it('does not count a local write (optimistic row, chain sync) as live data', () => {
    const client = new QueryClient();
    const { result } = renderHook(() => useLiveFreshness(), { wrapper: withClient(client) });

    act(() => {
      client.setQueryData(['dashboardInfo'], { CurNumBids: 2 });
    });
    expect(result.current.state).toBe('connecting');
    expect(result.current.lastSuccessAtMs).toBeNull();
  });

  it('stays reconnecting when a local write follows a failed poll', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useLiveFreshness(), { wrapper: withClient(client) });
    await act(async () => {
      await fetchDashboard(client);
    });
    const lastFetch = result.current.lastSuccessAtMs;

    await act(async () => {
      await client
        .fetchQuery({
          queryKey: ['dashboardInfo'],
          queryFn: () => Promise.reject(new Error('down')),
          staleTime: 0,
        })
        .catch(() => undefined);
      client.setQueryData(['dashboardInfo'], { CurNumBids: 3 });
    });
    expect(result.current.state).toBe('reconnecting');
    expect(result.current.lastSuccessAtMs).toBe(lastFetch);
  });

  it('reads reconnecting when the latest fetch failed', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useLiveFreshness(), { wrapper: withClient(client) });
    await act(async () => {
      await fetchDashboard(client);
    });

    await act(async () => {
      await client
        .fetchQuery({
          queryKey: ['dashboardInfo'],
          queryFn: () => Promise.reject(new Error('down')),
          staleTime: 0,
        })
        .catch(() => undefined);
    });
    expect(result.current.state).toBe('reconnecting');
  });

  it('renders the chip from the cache', async () => {
    const client = new QueryClient();
    await fetchDashboard(client);
    renderWithWrapper(<LiveStatus variant="chip" />, { wrapper: withClient(client) });
    expect(screen.getByRole('status')).toHaveTextContent('common.liveStatus.live');
  });
});
