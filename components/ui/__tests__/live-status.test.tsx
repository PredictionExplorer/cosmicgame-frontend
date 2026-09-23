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
    expect(screen.getByText(/common\.liveStatus\.delayed\(age=/)).toHaveTextContent(
      'common.liveStatus.clockCaveat',
    );
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
});

describe('useLiveFreshness + LiveStatus', () => {
  function withClient(client: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
  }

  it('reads connecting before any fetch, then live once data arrives', () => {
    const client = new QueryClient();
    const { result } = renderHook(() => useLiveFreshness(), { wrapper: withClient(client) });
    expect(result.current.state).toBe('connecting');

    act(() => {
      client.setQueryData(['dashboardInfo'], { CurNumBids: 1 });
    });
    expect(result.current.state).toBe('live');
    expect(result.current.lastSuccessAtMs).toEqual(expect.any(Number));
  });

  it('reads reconnecting when the latest fetch failed', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(['dashboardInfo'], { CurNumBids: 1 });
    const { result } = renderHook(() => useLiveFreshness(), { wrapper: withClient(client) });

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

  it('renders the chip from the cache', () => {
    const client = new QueryClient();
    client.setQueryData(['dashboardInfo'], { CurNumBids: 1 });
    renderWithWrapper(<LiveStatus variant="chip" />, { wrapper: withClient(client) });
    expect(screen.getByRole('status')).toHaveTextContent('common.liveStatus.live');
  });
});
