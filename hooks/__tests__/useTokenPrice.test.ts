import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';

import { reportError } from '@/utils/errors';
import { useTokenPrice } from '@/hooks/useTokenPrice';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockReportError = reportError as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useTokenPrice', () => {
  describe('default behaviour (ethereum)', () => {
    it('returns 0 as the initial price', () => {
      mockedAxios.get.mockResolvedValue({ data: { ethereum: { usd: 3500 } } });

      const { result } = renderHook(() => useTokenPrice());

      expect(result.current).toBe(0);
    });

    it('fetches the price from CoinGecko and updates state', async () => {
      mockedAxios.get.mockResolvedValue({ data: { ethereum: { usd: 3500 } } });

      const { result } = renderHook(() => useTokenPrice());

      await waitFor(() => {
        expect(result.current).toBe(3500);
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      );
    });

    it('constructs the URL with the tokenId embedded', async () => {
      mockedAxios.get.mockResolvedValue({ data: { ethereum: { usd: 1 } } });

      renderHook(() => useTokenPrice());

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });

      const url = mockedAxios.get.mock.calls[0]?.[0] as string;
      expect(url).toContain('ids=ethereum');
      expect(url).toContain('vs_currencies=usd');
    });
  });

  describe('custom tokenId', () => {
    it('fetches the price for a custom token', async () => {
      mockedAxios.get.mockResolvedValue({ data: { bitcoin: { usd: 65000 } } });

      const { result } = renderHook(() => useTokenPrice('bitcoin'));

      await waitFor(() => {
        expect(result.current).toBe(65000);
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      );
    });

    it('re-fetches when tokenId changes', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { ethereum: { usd: 3500 } } });

      const { result, rerender } = renderHook(({ id }) => useTokenPrice(id), {
        initialProps: { id: 'ethereum' },
      });

      await waitFor(() => {
        expect(result.current).toBe(3500);
      });

      mockedAxios.get.mockResolvedValueOnce({ data: { bitcoin: { usd: 65000 } } });
      rerender({ id: 'bitcoin' });

      await waitFor(() => {
        expect(result.current).toBe(65000);
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('keeps the price at 0 when the API call fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useTokenPrice());

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });

      expect(result.current).toBe(0);
    });

    it('calls reportError when the API call fails', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);

      renderHook(() => useTokenPrice());

      await waitFor(() => {
        expect(mockReportError).toHaveBeenCalledWith(error, 'fetch token price');
      });
    });

    it('keeps the price at 0 when response shape is unexpected', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useTokenPrice());

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockReportError).toHaveBeenCalled();
      });

      expect(result.current).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('does not update state after unmount', async () => {
      let resolveRequest: ((value: unknown) => void) | undefined;
      mockedAxios.get.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount } = renderHook(() => useTokenPrice());
      unmount();

      resolveRequest?.({ data: { ethereum: { usd: 9999 } } });

      await new Promise((r) => setTimeout(r, 50));

      const reactWarnings = consoleSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes("Can't perform a React state"),
      );
      expect(reactWarnings).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });
});
