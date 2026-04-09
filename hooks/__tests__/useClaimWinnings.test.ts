import { renderHook, act } from '@testing-library/react';

import { useClaimWinnings } from '../useClaimWinnings';

const mockSetNotification = jest.fn();
const mockFetchData = jest.fn();

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

jest.mock('../../contexts/ApiDataContext', () => ({
  useApiData: () => ({ fetchData: mockFetchData }),
}));

const mockWithdrawEverything = jest.fn().mockResolvedValue('0x');
const mockClaimDonatedNft = jest.fn().mockResolvedValue('0x');
const mockClaimManyDonatedNfts = jest.fn().mockResolvedValue('0x');
const mockClaimDonatedToken = jest.fn().mockResolvedValue('0x');
const mockClaimManyDonatedTokens = jest.fn().mockResolvedValue('0x');

const mockContract = {
  write: {
    withdrawEverything: mockWithdrawEverything,
    claimDonatedNft: mockClaimDonatedNft,
    claimManyDonatedNfts: mockClaimManyDonatedNfts,
    claimDonatedToken: mockClaimDonatedToken,
    claimManyDonatedTokens: mockClaimManyDonatedTokens,
  },
};

jest.mock('../useRaffleWalletContract', () => ({
  __esModule: true,
  default: jest.fn(() => mockContract),
}));

jest.mock('../../utils/errors', () => ({
  isUserRejection: jest.fn(() => false),
  reportError: jest.fn(),
  getEthErrorMessage: jest.fn(() => 'tx failed'),
}));

jest.mock('../../utils/alert', () => ({
  __esModule: true,
  default: jest.fn(() => 'Friendly error'),
}));

jest.mock('viem', () => ({
  ...jest.requireActual('../../__mocks__/viem.js'),
  parseUnits: jest.fn(() => BigInt(1e18)),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockWithdrawEverything.mockResolvedValue('0x');
  mockClaimDonatedNft.mockResolvedValue('0x');
  mockClaimManyDonatedNfts.mockResolvedValue('0x');
  mockClaimDonatedToken.mockResolvedValue('0x');
  mockClaimManyDonatedTokens.mockResolvedValue('0x');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useClaimWinnings', () => {
  it('returns initial claiming state as false', () => {
    const { result } = renderHook(() => useClaimWinnings());
    expect(result.current.isClaiming).toEqual({ raffleETH: false, donatedNFT: false });
    expect(result.current.claimingDonatedNFTs).toEqual([]);
  });

  describe('claimAllRaffleETH', () => {
    it('calls withdrawEverything on the contract', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1, 2, 3]);
      });
      expect(mockWithdrawEverything).toHaveBeenCalledWith([[1, 2, 3], [], []]);
    });

    it('shows error when wallet not connected', async () => {
      const useRaffleWallet = require('../useRaffleWalletContract').default;
      useRaffleWallet.mockReturnValueOnce(null);

      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text: 'Wallet not connected' }),
      );
    });

    it('handles transaction errors', async () => {
      mockWithdrawEverything.mockRejectedValue(new Error('tx failed'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('resets claiming state after error', async () => {
      mockWithdrawEverything.mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(result.current.isClaiming.raffleETH).toBe(false);
    });
  });

  describe('claimDonatedNFT', () => {
    it('calls claimDonatedNft on the contract', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedNFT(42);
      });
      expect(mockClaimDonatedNft).toHaveBeenCalledWith([42]);
    });

    it('shows error when wallet not connected', async () => {
      const useRaffleWallet = require('../useRaffleWalletContract').default;
      useRaffleWallet.mockReturnValueOnce(null);

      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedNFT(1);
      });
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('handles errors and cleans up claiming state', async () => {
      mockClaimDonatedNft.mockRejectedValue(new Error('nft fail'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedNFT(5);
      });
      expect(result.current.claimingDonatedNFTs).not.toContain(5);
    });
  });

  describe('claimAllDonatedNFTs', () => {
    it('calls claimManyDonatedNfts on the contract', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1, 2, 3]);
      });
      expect(mockClaimManyDonatedNfts).toHaveBeenCalledWith([[1, 2, 3]]);
    });

    it('shows error when wallet not connected', async () => {
      const useRaffleWallet = require('../useRaffleWalletContract').default;
      useRaffleWallet.mockReturnValueOnce(null);

      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1]);
      });
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('resets claiming state after error', async () => {
      mockClaimManyDonatedNfts.mockRejectedValue(new Error('batch fail'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1, 2]);
      });
      expect(result.current.isClaiming.donatedNFT).toBe(false);
    });
  });

  describe('claimDonatedERC20', () => {
    it('calls claimDonatedToken on the contract', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(1, '0xToken', '100');
      });
      expect(mockClaimDonatedToken).toHaveBeenCalled();
    });

    it('handles errors', async () => {
      mockClaimDonatedToken.mockRejectedValue(new Error('erc20 fail'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(1, '0xToken', '100');
      });
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  describe('claimAllDonatedERC20', () => {
    it('calls claimManyDonatedTokens on the contract', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedERC20([
          { roundNum: 1, tokenAddress: '0xToken', amount: 100 },
        ]);
      });
      expect(mockClaimManyDonatedTokens).toHaveBeenCalled();
    });

    it('handles errors', async () => {
      mockClaimManyDonatedTokens.mockRejectedValue(new Error('batch erc20 fail'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedERC20([
          { roundNum: 1, tokenAddress: '0x1', amount: 50 },
        ]);
      });
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  it('calls onSuccess callback after successful claim', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useClaimWinnings(onSuccess));
    await act(async () => {
      await result.current.claimAllRaffleETH([1]);
    });
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(mockFetchData).toHaveBeenCalled();
  });

  it('silently ignores user rejection errors', async () => {
    const { isUserRejection } = require('../../utils/errors');
    isUserRejection.mockReturnValue(true);
    mockWithdrawEverything.mockRejectedValue({ code: 4001 });

    const { result } = renderHook(() => useClaimWinnings());
    await act(async () => {
      await result.current.claimAllRaffleETH([1]);
    });
    expect(mockSetNotification).not.toHaveBeenCalled();
  });
});
