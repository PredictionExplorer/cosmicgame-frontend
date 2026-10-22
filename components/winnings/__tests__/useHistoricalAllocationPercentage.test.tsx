import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import { useHistoricalAllocationPercentage } from '../useHistoricalAllocationPercentage';

jest.unmock('@tanstack/react-query');
const mockReadContract = jest.fn();
jest.mock('wagmi', () => ({ usePublicClient: () => ({ readContract: mockReadContract }) }));
jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => TEST_APP_CONTRACT_ADDRESSES,
}));

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => mockReadContract.mockReset());

describe('historical allocation percentage', () => {
  it.each([25, 20])(
    'reads %s from the historical block instead of a current default',
    async (percentage) => {
      mockReadContract.mockResolvedValue(BigInt(percentage));
      const { result } = renderHook(() => useHistoricalAllocationPercentage(500000000), {
        wrapper: wrapper(),
      });
      expect(result.current).toBeNull();
      await waitFor(() => expect(result.current).toBe(percentage));
      expect(mockReadContract.mock.calls.map(([request]) => request.blockNumber)).toEqual([
        499999999n,
        500000000n,
      ]);
      expect(mockReadContract).toHaveBeenCalledWith(
        expect.objectContaining({ address: TEST_APP_CONTRACT_ADDRESSES.cosmicGame }),
      );
    },
  );

  it.each([undefined, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'does not guess without a valid block: %s',
    (block) => {
      const { result } = renderHook(() => useHistoricalAllocationPercentage(block), {
        wrapper: wrapper(),
      });
      expect(result.current).toBeNull();
      expect(mockReadContract).not.toHaveBeenCalled();
    },
  );

  it('keeps an ambiguous finalization-block parameter change unknown', async () => {
    mockReadContract.mockImplementation(({ blockNumber }: { blockNumber: bigint }) =>
      Promise.resolve(blockNumber === 499999999n ? 25n : 20n),
    );
    const { result } = renderHook(() => useHistoricalAllocationPercentage(500000000), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(mockReadContract).toHaveBeenCalledTimes(4));
    expect(result.current).toBeNull();
  });

  it('does not apply current parameters when the archive read fails', async () => {
    mockReadContract.mockRejectedValue(new Error('Historical state unavailable'));
    const { result } = renderHook(() => useHistoricalAllocationPercentage(500000000), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(mockReadContract).toHaveBeenCalledTimes(4));
    expect(result.current).toBeNull();
  });
});
