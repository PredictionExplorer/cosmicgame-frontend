import { act, render, screen } from '@testing-library/react';

import { flushDynamicImports } from '@/test-utils/dynamic';

import { AccountDataProvider } from '../AccountDataProvider';
import { useAnchoredToken, useApiData } from '../accountDataContexts';

jest.mock('next/dynamic', () => require('@/test-utils/dynamic').syncDynamic);

let mockAccount: string | null = null;
jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

// The wallet's reads, as the lazily loaded providers would supply them.
const mockProviderRenders = jest.fn();
jest.mock('../AnchoredTokenContext', () => {
  const { AnchoredTokenContext } = jest.requireActual('../accountDataContexts');
  const cstokens = [{ TokenInfo: { StakeActionId: 7 } }];
  const value = {
    cstokens,
    rwlktokens: [],
    fetchData: async () => {},
    error: null,
    isLoading: false,
  };
  return {
    AnchoredTokenProvider: ({ children }: { children: React.ReactNode }) => {
      mockProviderRenders();
      return (
        <AnchoredTokenContext.Provider value={value}>{children}</AnchoredTokenContext.Provider>
      );
    },
    useAnchoredToken: jest.requireActual('../accountDataContexts').useAnchoredToken,
  };
});
jest.mock('../ApiDataContext', () => {
  const actual = jest.requireActual('../accountDataContexts');
  const value = {
    ...actual.DISCONNECTED_API_DATA,
    apiData: { ...actual.initialApiData, ETHRaffleToClaim: 0.5 },
  };
  return {
    ApiDataProvider: ({ children }: { children: React.ReactNode }) => (
      <actual.ApiDataContext.Provider value={value}>{children}</actual.ApiDataContext.Provider>
    ),
    useApiData: actual.useApiData,
  };
});

/** Every state the page has read, in order. */
const mockReads = jest.fn();

function Probe() {
  const { cstokens, isLoading: anchoredLoading } = useAnchoredToken();
  const { apiData, isLoading: apiLoading } = useApiData();
  const state = `anchored ${cstokens.length} · retrievable ${apiData.ETHRaffleToClaim}`;
  mockReads(anchoredLoading || apiLoading ? `${state} · loading` : state);
  return <p>{state}</p>;
}

beforeAll(() => flushDynamicImports());
beforeEach(() => {
  mockAccount = null;
  mockProviderRenders.mockClear();
  mockReads.mockClear();
});

describe('AccountDataProvider', () => {
  it('reads empty wallet data without a wallet, and loads no reader', () => {
    render(
      <AccountDataProvider>
        <Probe />
      </AccountDataProvider>,
    );
    expect(screen.getByText('anchored 0 · retrievable 0')).toBeInTheDocument();
    expect(mockProviderRenders).not.toHaveBeenCalled();
  });

  it('hands the connected wallet’s reads to the page without re-parenting it', async () => {
    const { rerender } = render(
      <AccountDataProvider>
        <Probe />
      </AccountDataProvider>,
    );
    const page = screen.getByText(/^anchored/);
    mockAccount = '0xabc';
    await act(async () => {
      rerender(
        <AccountDataProvider>
          <Probe />
        </AccountDataProvider>,
      );
    });
    expect(screen.getByText('anchored 1 · retrievable 0.5')).toBe(page);
  });

  it('reads as loading, not empty, until the connected wallet’s reads report', async () => {
    mockAccount = '0xabc';
    render(
      <AccountDataProvider>
        <Probe />
      </AccountDataProvider>,
    );
    await act(async () => {});
    // Before the reader's first effect relays its values, the page reads
    // "loading", never an empty wallet.
    expect(mockReads.mock.calls.map(([state]) => state)).toEqual([
      'anchored 0 · retrievable 0 · loading',
      'anchored 1 · retrievable 0.5',
    ]);
  });

  it('forgets a wallet’s data once it disconnects', async () => {
    mockAccount = '0xabc';
    const { rerender } = render(
      <AccountDataProvider>
        <Probe />
      </AccountDataProvider>,
    );
    await act(async () => {});
    expect(screen.getByText('anchored 1 · retrievable 0.5')).toBeInTheDocument();
    mockAccount = null;
    rerender(
      <AccountDataProvider>
        <Probe />
      </AccountDataProvider>,
    );
    expect(screen.getByText('anchored 0 · retrievable 0')).toBeInTheDocument();
  });

  it('settles: relaying the values does not re-render the readers in a loop', async () => {
    mockAccount = '0xabc';
    render(
      <AccountDataProvider>
        <Probe />
      </AccountDataProvider>,
    );
    await act(async () => {});
    expect(mockProviderRenders.mock.calls.length).toBeLessThanOrEqual(2);
  });
});
