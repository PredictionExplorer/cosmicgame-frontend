import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import api from '@/services/api';
import type { GestureInfo } from '@/services/api';

import { useNotifyRedBox } from '../useApiQuery';
import {
  summarizeCycleParticipation,
  useCycleParticipation,
  useRetrieveStatus,
} from '../useCycleParticipation';

jest.unmock('@tanstack/react-query');
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get_user_info: jest.fn() },
}));
jest.mock('../useApiQuery', () => ({
  useNotifyRedBox: jest.fn(),
  // The real options factory: the hook shares its key and fetcher.
  userInfoQueryOptions: jest.requireActual('../useApiQuery').userInfoQueryOptions,
}));
let mockClaimableActionIds: unknown[] | undefined = [{ DepositId: 1, StakeActionId: 2 }];
jest.mock('@/contexts/ApiDataContext', () => ({
  useApiData: () => ({ apiData: { claimableActionIds: mockClaimableActionIds } }),
}));

const mockUserInfo = api.get_user_info as jest.MockedFunction<typeof api.get_user_info>;
const mockRedBox = useNotifyRedBox as jest.MockedFunction<typeof useNotifyRedBox>;

const ME = '0x1111111111111111111111111111111111111111';

const gesture = (overrides: Partial<GestureInfo>) =>
  ({ EvtLogId: 1, RoundNum: 2, GestureType: 0, GestureCostEth: 0.1, ...overrides }) as GestureInfo;

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('summarizeCycleParticipation', () => {
  it('counts the wallet Gestures of one cycle and keeps ETH and CST apart', () => {
    expect(
      summarizeCycleParticipation(
        [
          gesture({ GestureCostEth: 0.1 }),
          gesture({ GestureType: 1, GestureCostEth: 0.05 }),
          gesture({ GestureType: 2, GestureCostEth: -1, CstCost: 200 }),
          gesture({ RoundNum: 1, GestureCostEth: 9 }),
        ],
        2,
      ),
    ).toEqual({ gestures: 3, spentEth: 0.15000000000000002, spentCst: 200 });
  });

  it('reads an empty history as no Gestures', () => {
    expect(summarizeCycleParticipation(undefined, 2)).toEqual({
      gestures: 0,
      spentEth: 0,
      spentCst: 0,
    });
  });
});

describe('useCycleParticipation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is loading, then ready with the cycle summary', async () => {
    mockUserInfo.mockResolvedValue({ Gestures: [gesture({})] } as never);
    const { result } = renderHook(() => useCycleParticipation(ME, 2), { wrapper: makeWrapper() });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current).toMatchObject({ status: 'ready', gestures: 1, spentEth: 0.1 });
  });

  it('reports a failed read as an error with a retry, never as zero', async () => {
    mockUserInfo.mockRejectedValue(new Error('down'));
    const { result } = renderHook(() => useCycleParticipation(ME, 2), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('does not read without a wallet', () => {
    renderHook(() => useCycleParticipation(null, 2), { wrapper: makeWrapper() });
    expect(mockUserInfo).not.toHaveBeenCalled();
  });
});

describe('useRetrieveStatus', () => {
  const query = (overrides: Record<string, unknown>) =>
    ({
      data: undefined,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
      ...overrides,
    }) as never;

  it('is loading before the first read', () => {
    mockRedBox.mockReturnValue(query({ isPending: true }));
    const { result } = renderHook(() => useRetrieveStatus(ME));
    expect(result.current).toEqual({ state: 'loading' });
  });

  it('is unknown after a failed or unreadable read, never "nothing"', () => {
    mockRedBox.mockReturnValue(query({ isError: true }));
    expect(renderHook(() => useRetrieveStatus(ME)).result.current.state).toBe('unknown');
    mockRedBox.mockReturnValue(query({ data: null }));
    expect(renderHook(() => useRetrieveStatus(ME)).result.current.state).toBe('unknown');
  });

  it('adds every ETH allocation waiting, Chrono-Warrior included', () => {
    mockRedBox.mockReturnValue(
      query({
        data: {
          ETHRaffleToClaim: 0.1,
          ETHChronoWarriorToClaim: 0.2,
          UnretrievedAnchorDistribution: 0.05,
          NumDonatedNFTToClaim: 1,
        },
      }),
    );
    const { result } = renderHook(() => useRetrieveStatus(ME));
    expect(result.current).toEqual({ state: 'waiting', eth: 0.35000000000000003, nfts: 1 });
  });

  it('counts Anchor Distributions only once one can be retrieved, as the header does', () => {
    mockClaimableActionIds = [];
    mockRedBox.mockReturnValue(
      query({
        data: { ETHRaffleToClaim: 0, NumDonatedNFTToClaim: 0, UnretrievedAnchorDistribution: 0.78 },
      }),
    );
    expect(renderHook(() => useRetrieveStatus(ME)).result.current).toEqual({ state: 'none' });

    mockClaimableActionIds = [{ DepositId: 1, StakeActionId: 2 }];
    expect(renderHook(() => useRetrieveStatus(ME)).result.current).toEqual({
      state: 'waiting',
      eth: 0.78,
      nfts: 0,
    });
  });

  it('says nothing waits only after a successful read of zeros', () => {
    mockRedBox.mockReturnValue(
      query({ data: { ETHRaffleToClaim: 0, NumDonatedNFTToClaim: 0, ETHRaffleToClaimWei: 0 } }),
    );
    expect(renderHook(() => useRetrieveStatus(ME)).result.current).toEqual({ state: 'none' });
  });
});
