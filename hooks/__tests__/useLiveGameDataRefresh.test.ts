import { renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import {
  invalidateLiveGameQueries,
  LIVE_GAME_QUERY_KEYS,
  useLiveGameDataRefresh,
} from '../useLiveGameDataRefresh';
import { useContractAddresses } from '../../contexts/ContractAddressesContext';

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('wagmi', () => ({
  usePublicClient: jest.fn(),
}));

jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: jest.fn(),
}));

const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;
const mockUsePublicClient = usePublicClient as jest.MockedFunction<typeof usePublicClient>;
const mockUseContractAddresses = useContractAddresses as jest.MockedFunction<
  typeof useContractAddresses
>;

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
});

describe('useLiveGameDataRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue({ invalidateQueries: jest.fn() } as never);
    mockUseContractAddresses.mockReturnValue({ cosmicGame: '0xabc' } as never);
  });

  it('watches BidPlaced and invalidates live game queries when logs arrive', () => {
    const unwatch = jest.fn();
    const watchContractEvent = jest.fn(({ onLogs }) => {
      onLogs([]);
      return unwatch;
    });
    const invalidateQueries = jest.fn().mockResolvedValue(undefined);

    mockUsePublicClient.mockReturnValue({ watchContractEvent } as never);
    mockUseQueryClient.mockReturnValue({ invalidateQueries } as never);

    const { unmount } = renderHook(() => useLiveGameDataRefresh());

    expect(watchContractEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '0xabc',
        eventName: 'BidPlaced',
      }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });

    unmount();
    expect(unwatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches a cosmic:gesture-placed window event when a gesture lands', () => {
    const onGesturePlaced = jest.fn();
    window.addEventListener('cosmic:gesture-placed', onGesturePlaced);

    const watchContractEvent = jest.fn(({ onLogs }) => {
      onLogs([]);
      return jest.fn();
    });
    mockUsePublicClient.mockReturnValue({ watchContractEvent } as never);
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
    } as never);

    renderHook(() => useLiveGameDataRefresh());

    expect(onGesturePlaced).toHaveBeenCalledTimes(1);
    window.removeEventListener('cosmic:gesture-placed', onGesturePlaced);
  });

  it('no-ops without a public client or contract address', () => {
    mockUsePublicClient.mockReturnValue(undefined as never);
    mockUseContractAddresses.mockReturnValue({ cosmicGame: '' } as never);

    renderHook(() => useLiveGameDataRefresh());

    expect(mockUseQueryClient().invalidateQueries).not.toHaveBeenCalled();
  });
});
