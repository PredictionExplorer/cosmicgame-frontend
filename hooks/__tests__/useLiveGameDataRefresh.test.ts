import { renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';

import {
  startCosmicEventPolling,
  WATCHED_COSMIC_EVENTS,
  type CosmicChainEvent,
} from '@/lib/chainEvents';

import {
  ETL_ECHO_DELAY_MS,
  EVENT_QUERY_ROUTES,
  EVENT_WINDOW_EVENTS,
  invalidateLiveGameQueries,
  LIVE_GAME_QUERY_KEYS,
  useLiveGameDataRefresh,
} from '../useLiveGameDataRefresh';
import { useContractAddresses } from '../../contexts/ContractAddressesContext';

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: jest.fn(),
}));

jest.mock('@/lib/chainEvents', () => ({
  ...jest.requireActual('@/lib/chainEvents'),
  startCosmicEventPolling: jest.fn(),
}));

const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;
const mockUseContractAddresses = useContractAddresses as jest.MockedFunction<
  typeof useContractAddresses
>;
const mockStartPolling = startCosmicEventPolling as jest.MockedFunction<
  typeof startCosmicEventPolling
>;

function event(eventName: CosmicChainEvent['eventName']): CosmicChainEvent {
  return { eventName, blockNumber: 100, logIndex: 0, transactionHash: '0xdead' };
}

describe('invalidateLiveGameQueries', () => {
  it('invalidates every live game query key', async () => {
    const queryClient = {
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
    };

    await invalidateLiveGameQueries(queryClient as never);

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(LIVE_GAME_QUERY_KEYS.length);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboardInfo'] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bidListByRound'] });
  });

  it('can defer the early-cycle special-recipient query', async () => {
    const queryClient = {
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
    };

    await invalidateLiveGameQueries(queryClient as never, {
      includeCurrentSpecialRecipients: false,
    });

    expect(queryClient.invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ['currentSpecialWinners'],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboardInfo'] });
  });
});

describe('EVENT_QUERY_ROUTES', () => {
  it('routes every watched event to at least one query key', () => {
    for (const name of WATCHED_COSMIC_EVENTS) {
      expect(EVENT_QUERY_ROUTES[name].length).toBeGreaterThan(0);
    }
  });

  it('refreshes claim- and round-scoped queries on MainPrizeClaimed', () => {
    const keys = EVENT_QUERY_ROUTES.MainPrizeClaimed.map((key) => JSON.stringify(key));
    expect(keys).toContain(JSON.stringify(['claimHistory']));
    expect(keys).toContain(JSON.stringify(['roundList']));
    expect(keys).toContain(JSON.stringify(['allocationTime']));
  });

  it('refreshes contribution queries on both EthDonated event variants', () => {
    for (const name of ['EthDonated', 'EthDonatedWithInfo'] as const) {
      const keys = EVENT_QUERY_ROUTES[name].map((key) => JSON.stringify(key));
      expect(keys).toContain(JSON.stringify(['donationsCGSimpleList']));
      expect(keys).toContain(JSON.stringify(['dashboardInfo']));
    }
  });
});

describe('useLiveGameDataRefresh', () => {
  let invalidateQueries: jest.Mock;
  let cancelQueries: jest.Mock;
  let setQueryData: jest.Mock;
  let emitEvents: (events: CosmicChainEvent[]) => void;
  let stopPolling: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    invalidateQueries = jest.fn().mockResolvedValue(undefined);
    cancelQueries = jest.fn().mockResolvedValue(undefined);
    setQueryData = jest.fn();
    stopPolling = jest.fn();
    mockUseQueryClient.mockReturnValue({
      invalidateQueries,
      cancelQueries,
      setQueryData,
    } as never);
    mockUseContractAddresses.mockReturnValue({ cosmicGame: '0xabc' } as never);
    mockStartPolling.mockImplementation(({ onEvents }) => {
      emitEvents = onEvents;
      return stopPolling;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts polling for the contract and stops on unmount', () => {
    const { unmount } = renderHook(() => useLiveGameDataRefresh());

    expect(mockStartPolling).toHaveBeenCalledWith(
      expect.objectContaining({ contractAddress: '0xabc' }),
    );

    unmount();
    expect(stopPolling).toHaveBeenCalledTimes(1);
  });

  it('invalidates live queries and dispatches the gesture window event on BidPlaced', () => {
    const onGesturePlaced = jest.fn();
    window.addEventListener('cosmic:gesture-placed', onGesturePlaced);

    renderHook(() => useLiveGameDataRefresh());
    emitEvents([event('BidPlaced')]);

    expect(onGesturePlaced).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledTimes(LIVE_GAME_QUERY_KEYS.length);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['allocationTime'] });

    // ETL echo: the same keys are invalidated again after the delay.
    jest.advanceTimersByTime(ETL_ECHO_DELAY_MS);
    expect(invalidateQueries).toHaveBeenCalledTimes(LIVE_GAME_QUERY_KEYS.length * 2);

    window.removeEventListener('cosmic:gesture-placed', onGesturePlaced);
  });

  it('dispatches cosmic:cycle-finalized and refreshes claim queries on MainPrizeClaimed', () => {
    const onCycleFinalized = jest.fn();
    window.addEventListener('cosmic:cycle-finalized', onCycleFinalized);

    renderHook(() => useLiveGameDataRefresh());
    emitEvents([event('MainPrizeClaimed')]);

    expect(onCycleFinalized).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['claimHistory'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['roundList'] });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ['currentSpecialWinners'],
    });
    expect(cancelQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });
    expect(setQueryData).toHaveBeenCalledWith(['currentSpecialWinners'], null);

    jest.advanceTimersByTime(ETL_ECHO_DELAY_MS);
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ['currentSpecialWinners'],
    });

    window.removeEventListener('cosmic:cycle-finalized', onCycleFinalized);
  });

  it('refreshes contribution queries without any window event on EthDonated', () => {
    const listeners = Object.values(EVENT_WINDOW_EVENTS).map((name) => {
      const listener = jest.fn();
      window.addEventListener(name, listener);
      return { name, listener };
    });

    renderHook(() => useLiveGameDataRefresh());
    emitEvents([event('EthDonated')]);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['donationsCGSimpleList'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['donationsBothByRound'] });
    for (const { name, listener } of listeners) {
      expect(listener).not.toHaveBeenCalled();
      window.removeEventListener(name, listener);
    }
  });

  it('coalesces query keys and window events across a batch of events', () => {
    const onGesturePlaced = jest.fn();
    window.addEventListener('cosmic:gesture-placed', onGesturePlaced);

    renderHook(() => useLiveGameDataRefresh());
    emitEvents([event('BidPlaced'), event('FirstBidPlacedInRound'), event('MainPrizeClaimed')]);

    // Both gesture events share one window event, dispatched once.
    expect(onGesturePlaced).toHaveBeenCalledTimes(1);

    // dashboardInfo appears in all three routes but is invalidated once.
    const dashboardCalls = invalidateQueries.mock.calls.filter(
      ([arg]) => JSON.stringify(arg.queryKey) === JSON.stringify(['dashboardInfo']),
    );
    expect(dashboardCalls).toHaveLength(1);

    window.removeEventListener('cosmic:gesture-placed', onGesturePlaced);
  });

  it('clears pending echo timers on unmount', () => {
    const { unmount } = renderHook(() => useLiveGameDataRefresh());
    emitEvents([event('BidPlaced')]);
    const immediateCount = invalidateQueries.mock.calls.length;

    unmount();
    jest.advanceTimersByTime(ETL_ECHO_DELAY_MS * 2);

    expect(invalidateQueries).toHaveBeenCalledTimes(immediateCount);
  });

  it('does not poll without a contract address', () => {
    mockUseContractAddresses.mockReturnValue({ cosmicGame: '' } as never);

    renderHook(() => useLiveGameDataRefresh());

    expect(mockStartPolling).not.toHaveBeenCalled();
  });
});
