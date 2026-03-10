import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';

import { useTokenPrice } from '@/hooks/useTokenPrice';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

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
  });
});
