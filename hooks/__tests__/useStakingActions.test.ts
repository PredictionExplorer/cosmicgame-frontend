import { renderHook, act } from '@testing-library/react';

import { useStakingActions } from '../useStakingActions';

const mockSetNotification = jest.fn();
const mockFetchStakedTokens = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockWaitForTransactionReceipt = jest.fn().mockResolvedValue({ status: 'success' });

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

jest.mock('../../contexts/StakedTokenContext', () => ({
  useStakedToken: () => ({ fetchData: mockFetchStakedTokens }),
}));

jest.mock('../web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser' }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: mockWaitForTransactionReceipt }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../../config/networks', () => ({
  STAKING_WALLET_CST_ADDRESS: '0xCstStaking',
  STAKING_WALLET_RWLK_ADDRESS: '0xRwlkStaking',
}));

jest.mock('../../utils/errors', () => ({
  isUserRejection: jest.fn(() => false),
  reportError: jest.fn(),
  getEthErrorMessage: jest.fn(() => 'An error occurred'),
}));

jest.mock('../../utils/alert', () => ({
  __esModule: true,
  default: jest.fn((msg: string) => msg),
}));

const mockStake = jest.fn().mockResolvedValue('0xhash');
const mockStakeMany = jest.fn().mockResolvedValue('0xhash');
const mockUnstake = jest.fn().mockResolvedValue('0xhash');
const mockUnstakeMany = jest.fn().mockResolvedValue('0xhash');
const mockIsApprovedForAll = jest.fn().mockResolvedValue(true);
const mockSetApprovalForAll = jest.fn().mockResolvedValue('0xhash');

const mockCstStakingContract = {
  write: {
    stake: mockStake,
    stakeMany: mockStakeMany,
    unstake: mockUnstake,
    unstakeMany: mockUnstakeMany,
  },
};

const mockRwlkStakingContract = {
  write: {
    stake: mockStake,
    stakeMany: mockStakeMany,
    unstake: mockUnstake,
    unstakeMany: mockUnstakeMany,
  },
};

const mockCosmicSignatureContract = {
  read: { isApprovedForAll: mockIsApprovedForAll },
  write: { setApprovalForAll: mockSetApprovalForAll },
};

const mockRwalkContract = {
  read: { isApprovedForAll: mockIsApprovedForAll },
  write: { setApprovalForAll: mockSetApprovalForAll },
};

jest.mock('../useStakingWalletCSTContract', () => ({
  __esModule: true,
  default: () => mockCstStakingContract,
}));

jest.mock('../useStakingWalletRWLKContract', () => ({
  __esModule: true,
  default: () => mockRwlkStakingContract,
}));

jest.mock('../useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => mockCosmicSignatureContract,
}));

jest.mock('../useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => mockRwalkContract,
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockIsApprovedForAll.mockResolvedValue(true);
  mockStake.mockResolvedValue('0xhash');
  mockStakeMany.mockResolvedValue('0xhash');
  mockUnstake.mockResolvedValue('0xhash');
  mockUnstakeMany.mockResolvedValue('0xhash');
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
});

afterEach(() => jest.useRealTimers());

describe('useStakingActions', () => {
  describe('stake', () => {
    it('stakes a single CST token', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake(42, false);
      });
      expect(mockStake).toHaveBeenCalledWith([42]);
    });

    it('stakes multiple CST tokens', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake([1, 2, 3], false);
      });
      expect(mockStakeMany).toHaveBeenCalledWith([[1, 2, 3]]);
    });

    it('stakes an RWLK token', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake(10, true);
      });
      expect(mockStake).toHaveBeenCalledWith([10]);
    });

    it('requests approval when not approved', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(false);
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake(1, false);
      });
      expect(mockSetApprovalForAll).toHaveBeenCalledWith(['0xCstStaking', true]);
    });

    it('skips approval when already approved', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake(1, false);
      });
      expect(mockSetApprovalForAll).not.toHaveBeenCalled();
    });

    it('shows success notification after staking', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake(1, false);
      });
      act(() => jest.advanceTimersByTime(2000));
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });

    it('handles errors during staking', async () => {
      mockStake.mockRejectedValue(new Error('stake failed'));
      const { result } = renderHook(() => useStakingActions());
      const returned = await act(async () => {
        return await result.current.stake(1, false);
      });
      expect(returned).toBeInstanceOf(Error);
    });
  });

  describe('unstake', () => {
    it('unstakes a single token', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake(42, false);
      });
      expect(mockUnstake).toHaveBeenCalledWith([42]);
    });

    it('unstakes multiple tokens', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake([1, 2], true);
      });
      expect(mockUnstakeMany).toHaveBeenCalledWith([[1, 2]]);
    });

    it('shows success notification after unstaking', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake(1, false);
      });
      act(() => jest.advanceTimersByTime(2000));
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });

    it('handles errors during unstaking', async () => {
      mockUnstake.mockRejectedValue(new Error('unstake failed'));
      const { result } = renderHook(() => useStakingActions());
      const returned = await act(async () => {
        return await result.current.unstake(1, true);
      });
      expect(returned).toBeInstanceOf(Error);
    });
  });

  describe('handleError', () => {
    it('silently ignores user rejections', async () => {
      const { isUserRejection } = require('../../utils/errors');
      isUserRejection.mockReturnValue(true);

      const { result } = renderHook(() => useStakingActions());
      act(() => {
        result.current.handleError({ code: 4001 });
      });
      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });
});
