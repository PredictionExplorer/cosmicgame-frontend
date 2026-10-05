import { act, render } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { flushDynamicImports } from '@/test-utils/dynamic';

import { isLiveGameQueryKey } from '@/lib/liveGameQueryKeys';

import { LiveGameDataRefreshGate } from '../LiveGameDataRefresh';

jest.unmock('@tanstack/react-query');
jest.mock('next/dynamic', () => require('@/test-utils/dynamic').syncDynamic);

const mockRefresh = jest.fn();
jest.mock('../../../hooks/useLiveGameDataRefresh', () => ({
  useLiveGameDataRefresh: () => mockRefresh(),
}));

function Reader({ queryKey }: { queryKey: string }) {
  useQuery({ queryKey: [queryKey], queryFn: () => new Promise(() => {}) });
  return null;
}

function renderGate(children?: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <LiveGameDataRefreshGate />
      {children}
    </QueryClientProvider>,
  );
  return {
    ...view,
    rerenderWith: (next: React.ReactNode) =>
      view.rerender(
        <QueryClientProvider client={client}>
          <LiveGameDataRefreshGate />
          {next}
        </QueryClientProvider>,
      ),
  };
}

beforeAll(() => flushDynamicImports());
beforeEach(() => mockRefresh.mockClear());

describe('LiveGameDataRefreshGate', () => {
  it('knows which queries a chain event refreshes', () => {
    expect(isLiveGameQueryKey(['dashboardInfo'])).toBe(true);
    expect(isLiveGameQueryKey(['roundInfo', 12])).toBe(true);
    expect(isLiveGameQueryKey(['donationsCGSimpleList'])).toBe(true);
    expect(isLiveGameQueryKey(['faqSearch'])).toBe(false);
  });

  it('starts no chain polling on a page without live data', () => {
    renderGate(<Reader queryKey="namedNfts" />);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('starts the refresh once a page observes a live query, and keeps it', async () => {
    const { rerenderWith } = renderGate(<Reader queryKey="namedNfts" />);
    await act(async () => rerenderWith(<Reader queryKey="dashboardInfo" />));
    expect(mockRefresh).toHaveBeenCalled();
    mockRefresh.mockClear();
    await act(async () => rerenderWith(null));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('starts at once when the live query is already there', () => {
    renderGate(<Reader queryKey="gestureList" />);
    expect(mockRefresh).toHaveBeenCalled();
  });
});
