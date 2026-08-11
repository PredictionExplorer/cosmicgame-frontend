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
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['donationsNFTByRound'],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['donationsERC20ByRound'],
    });
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
        onError: expect.any(Function),
      }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });

    unmount();
    // Both the BidPlaced and MainPrizeClaimed watchers are torn down.
    expect(unwatch).toHaveBeenCalledTimes(2);
  });

  it('watches MainPrizeClaimed and refreshes claim-affected queries', () => {
    const watchContractEvent = jest.fn(({ onLogs }) => {
      onLogs([]);
      return jest.fn();
    });
    const invalidateQueries = jest.fn().mockResolvedValue(undefined);
    const onCycleFinalized = jest.fn();
    window.addEventListener('cosmic:cycle-finalized', onCycleFinalized);

    mockUsePublicClient.mockReturnValue({ watchContractEvent } as never);
    mockUseQueryClient.mockReturnValue({ invalidateQueries } as never);

    renderHook(() => useLiveGameDataRefresh());

    expect(watchContractEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '0xabc',
        eventName: 'MainPrizeClaimed',
        onError: expect.any(Function),
      }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['claimHistory'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['roundList'] });
    expect(onCycleFinalized).toHaveBeenCalledTimes(1);
    window.removeEventListener('cosmic:cycle-finalized', onCycleFinalized);
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
